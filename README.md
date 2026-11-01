# Mini ATS — Resume Screening & Candidate Ranking System

> **Third-Year Engineering DBMS Mini Project | Phase 1: Frontend Prototype**  
> A modern, responsive, and interactive recruitment platform built with **React, Vite, Tailwind CSS, and Recharts**, engineered to demonstrate automated resume screening, mathematical skill-matching, and candidate ranking.

---

## 🌟 Key Highlights

- **9 Fully Interactive Screens**: Complete end-to-end recruitment journey for both candidates and recruiters.
- **Deterministic Skill Matching Engine**: Transparent mathematical formula comparing candidate competencies with job specifications without black-box confusion.
- **Dynamic Candidate Ranking**: Recruiter screening dashboard automatically ranks applicants in descending score order with automated shortlisting threshold eligibility.
- **Relational DBMS Alignment**: Directly models 6 standard relational database tables (`Users`, `Skills`, `User_Skills`, `Jobs`, `Job_Skills`, `Applications`) in a centralized Data Access Layer (`storageService.js`), fully prepared for Phase 2 Python Flask & MySQL integration.
- **1-Click Demo Profiles**: Pre-populated with realistic candidates (Rahul Sharma, Priya Patil, etc.) and recruiter accounts for instant academic demonstrations.
- **Data Visualizations**: Integrated Recharts for applicant volume by job, candidate match score distribution, and hiring funnel status.

---

## 🏗️ Relational Database Schema (6 Tables)

The application data architecture strictly mirrors the following DBMS relational design:

```
+--------------------+        +---------------------+        +--------------------+
|       USERS        |        |     USER_SKILLS     |        |       SKILLS       |
+--------------------+        +---------------------+        +--------------------+
| id (PK)            |<------>| id (PK)             |<------>| id (PK)            |
| name               |        | userId (FK)         |        | name               |
| email              |        | skillName           |        | category           |
| password           |        +---------------------+        +--------------------+
| role               |
| phone              |        +---------------------+        +--------------------+
| location           |        |     JOB_SKILLS      |        |        JOBS        |
| education / degree |        +---------------------+        +--------------------+
| experienceYears    |<------>| id (PK)             |<------>| id (PK)            |
| resumeFile         |        | jobId (FK)          |        | recruiterId (FK)   |
+--------------------+        | skillName           |        | title              |
          |                   +---------------------+        | companyName        |
          |                                                  | location / type    |
          |                   +---------------------+        | threshold (e.g 80%)|
          |                   |    APPLICATIONS     |        | description        |
          |                   +---------------------+        +--------------------+
          +------------------>| id (PK)             |                  |
                              | jobId (FK)          |<-----------------+
                              | candidateId (FK)    |
                              | matchScore (%)      |
                              | matchedSkills []    |
                              | missingSkills []    |
                              | status              |
                              | appliedDate         |
                              +---------------------+
```

---

## 📐 Core Skill Matching Algorithm

The matching algorithm is implemented in [`src/services/matchingService.js`](file:///e:/DBM%20project/src/services/matchingService.js):

$$\text{Match Score} = \left( \frac{\text{Number of Matched Required Skills}}{\text{Total Required Skills}} \right) \times 100$$

### Example:
- **Job Requirements (5 skills)**: Python, SQL, Django, Git, REST API
- **Candidate Profile (4 skills)**: Python, SQL, Git, Django
- **Matched Skills**: 4 (Python, SQL, Django, Git)
- **Missing Skills**: 1 (REST API)
- **Calculation**: $(4 / 5) \times 100 = 80\%$
- **Shortlisting**: Since $80\% \ge \text{Threshold } (80\%)$, status is automatically marked as **`Shortlisted`**.

---

## 📱 The 9 Main Screens

| # | Screen Name | Route | Description |
|---|-------------|-------|-------------|
| **1** | **Landing Page** | `/` | Hero section, feature breakdown, 5-step screening workflow, and navigation CTAs. |
| **2** | **Login & Registration** | `/login` | Split-screen authentication, role toggle (Candidate / Recruiter), form validation, and 1-click demo logins. |
| **3** | **Candidate Dashboard** | `/candidate/dashboard` | Profile readiness meter, 4 metric cards, recommended jobs, recent applications, and quick actions. |
| **4** | **Resume & Skills** | `/candidate/resume` | Personal info editor, drag-and-drop PDF resume upload simulation, and master skill selector. |
| **5** | **Job Listings** | `/candidate/jobs` | Dynamic search, job type & experience filters, live skill-match percentages, and 1-click job application modal. |
| **6** | **Recruiter Dashboard** | `/recruiter/dashboard` | 4 summary KPI cards, Recharts visualizations, recent applicant table, and active job management. |
| **7** | **Post Job** | `/recruiter/post-job` | Job creation form, requirement chips, interactive qualification threshold slider (0–100%), and preview modal. |
| **8** | **Screening & Ranking** | `/recruiter/screening` | Job selector, descending candidate rankings, color-coded score badges, quick status updates, and deep inspection modal. |
| **9** | **Match Results & Missing Skills** | `/candidate/match-results` | Large SVG percentage ring, matched vs missing skills comparison, and transparent rule-based gap recommendations. |

---

## 👥 Demo Accounts

You can log in directly using the 1-click buttons on the Login page or using these credentials:

| Role | Name | Email | Password | Pre-loaded Skills |
|------|------|-------|----------|-------------------|
| **Recruiter** | Admin Recruiter | `recruiter@technova.com` | `password123` | N/A (TechNova Solutions) |
| **Candidate** | Rahul Sharma | `rahul.sharma@example.com` | `password123` | Python, SQL, Git, Django |
| **Candidate** | Priya Patil | `priya.patil@example.com` | `password123` | Python, SQL, Machine Learning |
| **Candidate** | Amit Deshmukh | `amit.deshmukh@example.com` | `password123` | Java, MySQL, HTML, CSS |
| **Candidate** | Sneha Kulkarni | `sneha.kulkarni@example.com` | `password123` | React, JavaScript, HTML, CSS |
| **Candidate** | Rohan Joshi | `rohan.joshi@example.com` | `password123` | Python, Flask, Git, REST API |
| **Candidate** | Neha Singh | `neha.singh@example.com` | `password123` | SQL, Power BI, Data Analysis |

---

## 🛠️ Project Structure

```
src/
├── assets/                  # Icons & assets
├── components/
│   ├── candidate/           # Candidate feature modals & upload box
│   │   ├── JobApplicationModal.jsx
│   │   ├── ProfileEditorModal.jsx
│   │   └── ResumeUploadBox.jsx
│   ├── common/              # Reusable UI components
│   │   ├── ConfirmModal.jsx
│   │   ├── Footer.jsx
│   │   ├── MatchScoreRing.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SkillChip.jsx
│   │   ├── StatCard.jsx
│   │   ├── StatusBadge.jsx
│   │   └── Toast.jsx
│   └── recruiter/           # Recruiter inspection modals
│       ├── CandidateDetailModal.jsx
│       └── JobPreviewModal.jsx
├── context/
│   ├── AuthContext.jsx      # Authentication & session provider
│   └── ToastContext.jsx     # Modern animated toast notifications
├── data/
│   └── initialData.js       # Consistent demo database seed
├── layouts/
│   ├── CandidateLayout.jsx  # Candidate sidebar + topbar
│   ├── MainLayout.jsx       # Public navbar + footer
│   └── RecruiterLayout.jsx  # Recruiter sidebar + topbar
├── pages/                   # Exactly the 9 required screens
│   ├── AuthPage.jsx
│   ├── CandidateDashboardPage.jsx
│   ├── CandidateScreeningPage.jsx
│   ├── HomePage.jsx
│   ├── JobListingsPage.jsx
│   ├── MatchResultsPage.jsx
│   ├── PostJobPage.jsx
│   ├── RecruiterDashboardPage.jsx
│   └── ResumeSkillsPage.jsx
├── services/
│   ├── matchingService.js   # Mathematical skill matching algorithm
│   └── storageService.js    # Data Access Layer (DAL) representing 6 SQL tables
├── utils/
│   └── helpers.js           # Score colors, profile completeness, date formatting
├── App.jsx                  # React Router 6 setup & route guards
├── index.css                # Tailwind CSS imports & custom styles
└── main.jsx                 # Application entry point
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18 or higher installed)
- npm or pnpm

### 2. Installation
Open a terminal in the project directory:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or `http://localhost:5173`).

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, minified production bundle in the `/dist` directory.

---

## 🔮 Phase 2 Roadmap: Flask & MySQL Integration

In Phase 2, the `src/services/storageService.js` Data Access Layer will replace localStorage calls with standard `fetch()` or `axios` calls to a Python Flask REST API:

1. **Database Setup**: Run MySQL scripts creating the 6 relational tables (`Users`, `Skills`, `User_Skills`, `Jobs`, `Job_Skills`, `Applications`).
2. **Flask Backend**:
   - `POST /api/auth/login` (JWT token generation)
   - `GET /api/jobs` (SELECT with JOIN on `Job_Skills`)
   - `POST /api/applications` (Execute matching algorithm or SQL query)
   - `GET /api/jobs/<id>/rankings` (ORDER BY match_score DESC)
3. **Resume Storage**: Store uploaded PDF resumes in an `/uploads` directory or cloud bucket with secure path references in the MySQL `Users` table.

