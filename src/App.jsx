import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

// 9 Main Screens
import HomePage from './pages/HomePage';                               // SCREEN 1
import AuthPage from './pages/AuthPage';                               // SCREEN 2
import CandidateDashboardPage from './pages/CandidateDashboardPage';   // SCREEN 3
import ResumeSkillsPage from './pages/ResumeSkillsPage';               // SCREEN 4
import JobListingsPage from './pages/JobListingsPage';                 // SCREEN 5
import RecruiterDashboardPage from './pages/RecruiterDashboardPage';   // SCREEN 6
import PostJobPage from './pages/PostJobPage';                         // SCREEN 7
import CandidateScreeningPage from './pages/CandidateScreeningPage';   // SCREEN 8
import MatchResultsPage from './pages/MatchResultsPage';               // SCREEN 9

// Route guards
function CandidateRoute({ children }) {
  const { currentUser, isCandidate, isRecruiter } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=candidate" replace />;
  }
  return children;
}

function RecruiterRoute({ children }) {
  const { currentUser, isRecruiter } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login?role=recruiter" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Landing & Auth */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="/login" element={<AuthPage />} />

      {/* Candidate Portal Routes */}
      <Route
        path="/candidate"
        element={
          <CandidateRoute>
            <CandidateLayout />
          </CandidateRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="resume" element={<ResumeSkillsPage />} />
        <Route path="jobs" element={<JobListingsPage />} />
        <Route path="match-results" element={<MatchResultsPage />} />
      </Route>

      {/* Recruiter Portal Routes */}
      <Route
        path="/recruiter"
        element={
          <RecruiterRoute>
            <RecruiterLayout />
          </RecruiterRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboardPage />} />
        <Route path="post-job" element={<PostJobPage />} />
        <Route path="screening" element={<CandidateScreeningPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

