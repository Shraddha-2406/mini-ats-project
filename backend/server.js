require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

const uid = (p) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const wrap = (fn) => (req, res) =>
    fn(req, res).catch((e) => {
        console.error(e);
        res.status(500).json({ error: e.message });
    });

// ---------- helpers ----------
async function getJobSkills(jobId) {
    const [rows] = await db.query('SELECT skill_name FROM Job_Skills WHERE job_id=?', [jobId]);
    return rows.map((r) => r.skill_name);
}
async function getUserSkills(userId) {
    const [rows] = await db.query('SELECT skill_name FROM User_Skills WHERE user_id=?', [userId]);
    return rows.map((r) => r.skill_name);
}
async function setSkills(table, col, id, skills = []) {
    await db.query(`DELETE FROM ${table} WHERE ${col}=?`, [id]);
    for (const s of [...new Set(skills.map((x) => x.trim()).filter(Boolean))]) {
        await db.query(`INSERT IGNORE INTO ${table} (${col}, skill_name) VALUES (?,?)`, [id, s]);
    }
}
function safeUser(u) {
    const { password_hash, ...rest } = u;
    return rest;
}

// ---------- AUTH ----------
app.post('/api/auth/register', wrap(async (req, res) => {
    const { name, email, password, role = 'candidate', company_name, phone, location } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    const [exist] = await db.query('SELECT id FROM Users WHERE email=?', [email]);
    if (exist.length) return res.status(409).json({ error: 'Email already registered' });
    const id = uid(role === 'recruiter' ? 'usr-recruiter' : 'usr-cand');
    const hash = await bcrypt.hash(password, 10);
    await db.query(
        'INSERT INTO Users (id,name,email,password_hash,role,company_name,phone,location) VALUES (?,?,?,?,?,?,?,?)',
        [id, name, email, hash, role, company_name || null, phone || null, location || null]
    );
    const [[u]] = await db.query('SELECT * FROM Users WHERE id=?', [id]);
    res.status(201).json(safeUser(u));
}));

app.post('/api/auth/login', wrap(async (req, res) => {
    const { email, password } = req.body;
    const [[u]] = await db.query('SELECT * FROM Users WHERE email=?', [email]);
    if (!u) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, u.password_hash).catch(() => false);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const user = safeUser(u);
    user.skills = await getUserSkills(u.id);
    res.json(user);
}));

// ---------- USERS / PROFILE ----------
app.get('/api/users/:id', wrap(async (req, res) => {
    const [[u]] = await db.query('SELECT * FROM Users WHERE id=?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const user = safeUser(u);
    user.skills = await getUserSkills(u.id);
    res.json(user);
}));

app.put('/api/users/:id', wrap(async (req, res) => {
    const f = ['name', 'company_name', 'phone', 'location', 'education', 'degree',
        'graduation_year', 'experience_years', 'bio', 'resume_file_name', 'resume_file_size', 'resume_uploaded_at'];
    const sets = [], vals = [];
    for (const k of f) if (req.body[k] !== undefined) { sets.push(`${k}=?`); vals.push(req.body[k]); }
    if (sets.length) await db.query(`UPDATE Users SET ${sets.join(',')} WHERE id=?`, [...vals, req.params.id]);
    if (Array.isArray(req.body.skills)) await setSkills('User_Skills', 'user_id', req.params.id, req.body.skills);
    const [[u]] = await db.query('SELECT * FROM Users WHERE id=?', [req.params.id]);
    const user = safeUser(u);
    user.skills = await getUserSkills(u.id);
    res.json(user);
}));

// ---------- SKILLS ----------
app.get('/api/skills', wrap(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Skills ORDER BY category, name');
    res.json(rows);
}));

// ---------- JOBS ----------
async function withSkills(jobs) {
    for (const j of jobs) j.skills = await getJobSkills(j.id);
    return jobs;
}

app.get('/api/jobs', wrap(async (req, res) => {
    const [rows] = await db.query(`
    SELECT j.*, (SELECT COUNT(*) FROM Applications a WHERE a.job_id=j.id) AS applicant_count
    FROM Jobs j WHERE j.status='Active' ORDER BY j.created_at DESC`);
    res.json(await withSkills(rows));
}));

app.get('/api/jobs/recruiter/:rid', wrap(async (req, res) => {
    const [rows] = await db.query(`
    SELECT j.*, (SELECT COUNT(*) FROM Applications a WHERE a.job_id=j.id) AS applicant_count
    FROM Jobs j WHERE j.recruiter_id=? ORDER BY j.created_at DESC`, [req.params.rid]);
    res.json(await withSkills(rows));
}));

app.get('/api/jobs/:id', wrap(async (req, res) => {
    const [[j]] = await db.query('SELECT * FROM Jobs WHERE id=?', [req.params.id]);
    if (!j) return res.status(404).json({ error: 'Job not found' });
    j.skills = await getJobSkills(j.id);
    res.json(j);
}));

app.post('/api/jobs', wrap(async (req, res) => {
    const b = req.body;
    const id = uid('job');
    await db.query(
        `INSERT INTO Jobs (id,recruiter_id,company_name,title,location,job_type,min_experience,description,threshold,deadline,salary,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.recruiter_id, b.company_name, b.title, b.location, b.job_type || 'Full-Time',
            b.min_experience || '0-2 years', b.description, b.threshold ?? 80,
            b.deadline || null, b.salary || null, b.status || 'Active']
    );
    await setSkills('Job_Skills', 'job_id', id, b.skills || []);
    res.status(201).json({ id });
}));

app.put('/api/jobs/:id', wrap(async (req, res) => {
    const f = ['title', 'company_name', 'location', 'job_type', 'min_experience',
        'description', 'threshold', 'deadline', 'salary', 'status'];
    const sets = [], vals = [];
    for (const k of f) if (req.body[k] !== undefined) { sets.push(`${k}=?`); vals.push(req.body[k]); }
    if (sets.length) await db.query(`UPDATE Jobs SET ${sets.join(',')} WHERE id=?`, [...vals, req.params.id]);
    if (Array.isArray(req.body.skills)) await setSkills('Job_Skills', 'job_id', req.params.id, req.body.skills);
    res.json({ success: true });
}));

app.delete('/api/jobs/:id', wrap(async (req, res) => {
    await db.query('DELETE FROM Jobs WHERE id=?', [req.params.id]);
    res.json({ success: true });
}));

// ---------- APPLICATIONS ----------
// Apply: match score is calculated automatically, auto-shortlist if score >= job threshold
app.post('/api/applications', wrap(async (req, res) => {
    const { job_id, candidate_id } = req.body;
    const [[job]] = await db.query('SELECT * FROM Jobs WHERE id=?', [job_id]);
    const [[cand]] = await db.query('SELECT * FROM Users WHERE id=?', [candidate_id]);
    if (!job || !cand) return res.status(404).json({ error: 'Job or candidate not found' });

    const [dup] = await db.query('SELECT id FROM Applications WHERE job_id=? AND candidate_id=?', [job_id, candidate_id]);
    if (dup.length) return res.status(409).json({ error: 'Already applied to this job' });

    const required = await getJobSkills(job_id);
    const has = (await getUserSkills(candidate_id)).map((s) => s.toLowerCase());
    const matched = required.filter((s) => has.includes(s.toLowerCase()));
    const missing = required.filter((s) => !has.includes(s.toLowerCase()));
    const score = required.length ? Math.round((matched.length / required.length) * 100) : 0;
    const status = score >= job.threshold ? 'Shortlisted' : 'Pending';

    const id = uid('app');
    await db.query(
        `INSERT INTO Applications (id,job_id,candidate_id,candidate_name,candidate_email,match_score,matched_skills,missing_skills,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, job_id, candidate_id, cand.name, cand.email, score, JSON.stringify(matched), JSON.stringify(missing), status]
    );
    res.status(201).json({ id, match_score: score, matched_skills: matched, missing_skills: missing, status });
}));

// Candidate's own applications
app.get('/api/applications/candidate/:cid', wrap(async (req, res) => {
    const [rows] = await db.query(`
    SELECT a.*, j.title AS job_title, j.company_name, j.location AS job_location
    FROM Applications a JOIN Jobs j ON j.id=a.job_id
    WHERE a.candidate_id=? ORDER BY a.applied_date DESC`, [req.params.cid]);
    res.json(rows);
}));

// Recruiter: applicants of one job, best score first
app.get('/api/jobs/:id/applications', wrap(async (req, res) => {
    const [rows] = await db.query(
        'SELECT * FROM Applications WHERE job_id=? ORDER BY match_score DESC', [req.params.id]);
    res.json(rows);
}));

// Recruiter: shortlist / reject / add notes
app.put('/api/applications/:id', wrap(async (req, res) => {
    const { status, notes } = req.body;
    const sets = [], vals = [];
    if (status) { sets.push('status=?'); vals.push(status); }
    if (notes !== undefined) { sets.push('notes=?'); vals.push(notes); }
    if (sets.length) await db.query(`UPDATE Applications SET ${sets.join(',')} WHERE id=?`, [...vals, req.params.id]);
    res.json({ success: true });
}));

// ---------- DASHBOARD ----------
app.get('/api/stats/recruiter/:rid', wrap(async (req, res) => {
    const [[s]] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM Jobs WHERE recruiter_id=?) AS total_jobs,
      (SELECT COUNT(*) FROM Applications a JOIN Jobs j ON j.id=a.job_id WHERE j.recruiter_id=?) AS total_applicants,
      (SELECT COUNT(*) FROM Applications a JOIN Jobs j ON j.id=a.job_id WHERE j.recruiter_id=? AND a.status='Shortlisted') AS shortlisted,
      (SELECT COUNT(*) FROM Applications a JOIN Jobs j ON j.id=a.job_id WHERE j.recruiter_id=? AND a.status='Rejected') AS rejected`,
        [req.params.rid, req.params.rid, req.params.rid, req.params.rid]);
    res.json(s);
}));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 5000, () => console.log('Mini ATS API running on port ' + (process.env.PORT || 5000)));