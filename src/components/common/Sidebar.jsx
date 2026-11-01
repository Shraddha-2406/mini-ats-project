import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Layers,
  FileCheck2,
  PieChart,
  LogOut,
  PlusCircle,
  Users,
  CheckCircle2,
  ChevronDown,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onOpenProfileModal }) {
  const { currentUser, logout, switchDemoAccount, isCandidate, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = (e) => {
    const email = e.target.value;
    if (email) {
      const switched = switchDemoAccount(email);
      if (switched) {
        if (switched.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      }
    }
  };

  const candidateLinks = [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { 
      name: 'My Profile', 
      icon: User, 
      action: onOpenProfileModal,
      badge: 'Edit'
    },
    { name: 'Resume & Skills', path: '/candidate/resume', icon: FileText },
    { name: 'Browse Jobs', path: '/candidate/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/candidate/dashboard#applications', icon: FileCheck2 },
    { name: 'Match Results', path: '/candidate/match-results', icon: PieChart },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post Job', path: '/recruiter/post-job', icon: PlusCircle },
    { name: 'Manage Jobs', path: '/recruiter/dashboard#manage-jobs', icon: Briefcase },
    { name: 'Candidate Screening', path: '/recruiter/screening', icon: Users },
    { name: 'Rankings', path: '/recruiter/screening', icon: CheckCircle2 },
  ];

  const links = isRecruiter ? recruiterLinks : candidateLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <NavLink to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 flex items-center gap-1">
                Mini <span className="text-blue-600">ATS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block -mt-0.5">
                {isRecruiter ? 'Recruiter Portal' : 'Candidate Portal'}
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview snippet */}
        <div className="px-5 py-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {currentUser?.name || 'User'}
              </p>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isRecruiter 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isRecruiter ? 'Recruiter' : 'Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {links.map((link, idx) => {
            const Icon = link.icon;

            if (link.action) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    link.action();
                    onClose && onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            }

            const isActive = location.pathname === link.path && !link.path.includes('#');

            return (
              <NavLink
                key={idx}
                to={link.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Demo profile switcher for quick testing */}
        <div className="p-4 mx-3 mb-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs">
          <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1.5">
            Quick Switch Demo User
          </label>
          <div className="relative">
            <select
              value={currentUser?.email || ''}
              onChange={handleDemoSwitch}
              className="w-full bg-white text-xs border border-blue-200 rounded-lg py-1.5 px-2.5 pr-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium cursor-pointer"
            >
              <optgroup label="Candidates">
                <option value="rahul.sharma@example.com">Rahul Sharma (Python, SQL)</option>
                <option value="priya.patil@example.com">Priya Patil (ML, Python)</option>
                <option value="amit.deshmukh@example.com">Amit Deshmukh (Java, MySQL)</option>
                <option value="sneha.kulkarni@example.com">Sneha Kulkarni (React, JS)</option>
                <option value="rohan.joshi@example.com">Rohan Joshi (Flask, Git)</option>
                <option value="neha.singh@example.com">Neha Singh (Power BI, SQL)</option>
              </optgroup>
              <optgroup label="Recruiters">
                <option value="recruiter@technova.com">Admin Recruiter (TechNova)</option>
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Logout action */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

