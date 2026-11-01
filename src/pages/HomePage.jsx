import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Target,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
  Search,
  Users,
  Award
} from 'lucide-react';

export default function HomePage() {
  const { switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const handleQuickCandidate = () => {
    switchDemoAccount('rahul.sharma@example.com');
    navigate('/candidate/dashboard');
  };

  const handleQuickRecruiter = () => {
    switchDemoAccount('recruiter@technova.com');
    navigate('/recruiter/dashboard');
  };

  const features = [
    {
      icon: FileText,
      title: 'Resume Management',
      desc: 'Seamlessly upload and manage candidate resume PDFs and experience profiles with complete metadata tracking.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Target,
      title: 'Smart Skill Matching',
      desc: 'Deterministic mathematical matching algorithm calculates precise compatibility percentage against required competencies.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: BarChart3,
      title: 'Candidate Ranking',
      desc: 'Dynamically ranks all job applicants in descending score order to instantly spotlight the most qualified talent.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: CheckCircle2,
      title: 'Automatic Shortlisting',
      desc: 'Configurable qualification threshold automatically flags top candidates while preserving recruiter override control.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: AlertCircle,
      title: 'Missing Skills Analysis',
      desc: 'Provides clear visual breakdown of skill gaps with actionable learning recommendations to bridge the difference.',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      icon: Clock,
      title: 'Application Tracking',
      desc: 'End-to-end recruitment lifecycle tracking with instant status synchronization across candidate and recruiter views.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create Profile',
      desc: 'Set up candidate credentials and personal profile information in seconds.',
    },
    {
      num: '02',
      title: 'Add Skills & Resume',
      desc: 'Select your verified technical competencies and upload your resume PDF.',
    },
    {
      num: '03',
      title: 'Apply for Jobs',
      desc: 'Explore curated job listings and submit applications with a single click.',
    },
    {
      num: '04',
      title: 'Calculate Match Score',
      desc: 'Our matching engine evaluates your skill overlap against job requirements.',
    },
    {
      num: '05',
      title: 'View Results',
      desc: 'Track shortlisting status, analyze missing skills, and review recruiter feedback.',
    },
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-100/50 via-indigo-50/40 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-subtle">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next-Gen Resume Screening & ATS Prototype</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Smarter Resume Screening.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Better Hiring Decisions.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                An intelligent recruitment platform that matches candidate skills with job requirements, ranks applicants, and simplifies the hiring process.
              </p>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleQuickCandidate}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition active:scale-95"
                >
                  <span>Get Started as Candidate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickRecruiter}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-card transition active:scale-95"
                >
                  <span>Continue as Recruiter</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Relational DB Schema Badge */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>6 Relational Tables Architecture</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Deterministic Matching Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Dashboard Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Preview Card */}
                <div className="bg-white rounded-3xl p-6 shadow-elevated border border-slate-200/90 space-y-5">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        TN
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Python Developer</h4>
                        <p className="text-[11px] text-slate-400">TechNova Solutions • Active Job</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      Threshold: 80%
                    </span>
                  </div>

                  {/* Candidate Match Highlight */}
                  <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/60 rounded-2xl p-4 border border-blue-100/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                          RS
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Rahul Sharma</p>
                          <p className="text-xs text-slate-500">B.E. Computer Engineering</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-emerald-600">80%</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap gap-1.5">
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md">✓ Python</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md">✓ SQL</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md">✓ Django</span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md">✓ Git</span>
                      <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-md">+ REST API</span>
                    </div>
                  </div>

                  {/* Ranking mini list */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Automated Candidate Ranking
                    </p>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">1</span>
                          <span className="font-semibold text-slate-800">Rahul Sharma</span>
                        </div>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">80% • Shortlisted</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">2</span>
                          <span className="font-semibold text-slate-800">Rohan Joshi</span>
                        </div>
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">60% • Review</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[11px]">3</span>
                          <span className="font-semibold text-slate-800">Priya Patil</span>
                        </div>
                        <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">40% • Review</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-elevated border border-slate-200 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Zero Ambiguity</p>
                    <p className="text-[11px] text-slate-500">100% Deterministic Scoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Key Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive ATS & Resume Screening Tools
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Engineered from ground up with standard relational database patterns and intuitive applicant tracking workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-5 shadow-subtle group-hover:scale-105 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Screening Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How the System Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              A transparent 5-step journey from candidate profile creation to automated recruiter shortlisting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 relative space-y-3"
              >
                <span className="text-2xl font-black text-blue-600 tracking-tight">
                  {step.num}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-12 text-white shadow-xl shadow-blue-500/20 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to explore the prototype?
            </h3>
            <p className="text-sm sm:text-base text-blue-100">
              Test candidate skill analysis or review ranked applicants as an ATS recruiter with pre-loaded demo accounts.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition"
              >
                Sign In to Demo
              </Link>
              <Link
                to="/candidate/jobs"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500/30 text-white font-semibold text-sm border border-white/20 hover:bg-blue-500/40 transition"
              >
                Browse Sample Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

