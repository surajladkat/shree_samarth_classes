/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, GraduationCap, BookOpen, Layers } from 'lucide-react';
import { TeacherUser } from '../../types';

interface FacultyDirectoryProps {
  teachers: TeacherUser[];
}

export default function FacultyDirectory({ teachers }: FacultyDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Gather unique subjects for filters
  const allSubjects = Array.from(
    new Set(teachers.flatMap(t => t.subjects || []))
  ).filter(Boolean);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || (t.subjects && t.subjects.includes(selectedSubject));
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Academy Faculty Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Verify official educator course streams and departments. Contact logins and individual authentication records are private.
          </p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-100">
          {filteredTeachers.length} Registered Instructors
        </span>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-405 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search instructor name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-205 border-slate-200 rounded-lg focus:bg-white focus:outline-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-205 border-slate-200 rounded-lg focus:bg-white focus:outline-blue-500"
          >
            <option value="ALL">All Subject Departments</option>
            {allSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of faculty profiles */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl">
          <p className="text-xs text-slate-400 italic">No faculty instructors matched the search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeachers.map(t => {
            const initials = t.name ? t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FC';
            return (
              <div 
                key={t.id} 
                className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/30 hover:bg-white hover:border-blue-200 transition-all duration-150 flex items-start gap-4 shadow-sm"
              >
                {/* Avatar with dynamic matching color */}
                <div className="w-11 h-11 rounded-full bg-blue-105 bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-[13px] flex items-center justify-center shrink-0">
                  {initials}
                </div>

                <div className="space-y-2 flex-grow">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">{t.name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.2 bg-slate-50 text-[10px] text-slate-500 font-mono font-bold rounded border border-slate-200/50">
                      Official Faculty Instructor
                    </span>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-500" /> Assigned Subjects
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {t.subjects && t.subjects.map((sub, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-sans font-semibold rounded border border-blue-100/50"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Classes */}
                  {t.classes && t.classes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-404 text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-500" /> Teaching Batches
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {t.classes.map((cls, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.1 bg-purple-50 text-purple-700 text-[10px] font-sans font-semibold rounded border border-purple-100/50"
                          >
                            Class {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
