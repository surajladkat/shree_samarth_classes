/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Header from './components/shared/Header';
import Login from './components/shared/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ParentDashboard from './components/parent/ParentDashboard';

function AppContent() {
  const { currentUser } = useSchool();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-6 px-4 md:px-8 space-y-6">
      
      {/* If logged in, show Header */}
      {currentUser && <Header />}

      {/* Main Panel Coordination */}
      <main className="mx-auto max-w-7xl">
        {!currentUser ? (
          <Login />
        ) : (
          <div className="transition-all duration-300">
            {currentUser.role === 'ADMIN' && <AdminDashboard />}
            {currentUser.role === 'TEACHER' && <TeacherDashboard />}
            {currentUser.role === 'STUDENT' && <StudentDashboard />}
            {currentUser.role === 'PARENT' && <ParentDashboard />}
          </div>
        )}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
