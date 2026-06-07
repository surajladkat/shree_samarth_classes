/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { decryptData } from '../../cryptoUtils';
import { BookOpen, Calendar, CheckCircle2, AlertCircle, Play, Download, Lock, Unlock, FileText, Send, Award, Users, GraduationCap, Upload } from 'lucide-react';
import FacultyDirectory from '../shared/FacultyDirectory';
import { motion } from 'motion/react';

export default function StudentDashboard() {
  const {
    currentUser,
    studyMaterials,
    assignments,
    submissions,
    timetables,
    teachers,
    attendance,
    submitAssignmentHomework
  } = useSchool();

  const student = currentUser as any;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'study-folder' | 'assignments-desk' | 'grades' | 'timetable' | 'faculty-directory' | 'attendance'>('assignments-desk');

  // Submit modal state
  const [activeSubmitAsgId, setActiveSubmitAsgId] = useState<string | null>(null);
  const [submissionBoxText, setSubmissionBoxText] = useState('');
  const [subFileName, setSubFileName] = useState<string | null>(null);
  const [subFileSize, setSubFileSize] = useState<string | null>(null);
  const [subDragActive, setSubDragActive] = useState(false);

  // Selected study material decryption states
  const [decryptedMaterialId, setDecryptedMaterialId] = useState<string | null>(null);

  // Filter materials & assignments by Student Class folder (9th, 10th, 11th, 12th)
  const myClassMaterials = studyMaterials.filter(m => m.classGrade === student.classGrade);
  const myClassAssignments = assignments.filter(a => a.classGrade === student.classGrade);

  // Helper check submission state
  const getSubmissionByAsg = (asgId: string) => {
    return submissions.find(s => s.assignmentId === asgId && s.studentId === student.id);
  };

  const handleSubmissionFile = (file: File) => {
    if (!file) return;
    setSubFileName(file.name);
    setSubFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || '';
      setSubmissionBoxText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAsgId || !submissionBoxText.trim()) return;

    submitAssignmentHomework(activeSubmitAsgId, submissionBoxText, subFileName || undefined, subFileSize || undefined);
    setActiveSubmitAsgId(null);
    setSubmissionBoxText('');
    setSubFileName(null);
    setSubFileSize(null);
  };

  const handleDownloadAndDecrypt = (materialId: string) => {
    setDecryptedMaterialId(materialId === decryptedMaterialId ? null : materialId);
  };

  const handleDownloadFile = (fileName: string, encryptedContent: string) => {
    try {
      const decrypted = decryptData(encryptedContent, 'SCHOOL_SECRET_KEY');
      const blob = new Blob([decrypted], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download file', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1">
      
      {/* Student Profile Overview */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] col-span-1 h-fit space-y-4 font-sans"
      >
        <div className="border-b border-slate-100 pb-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-indigo-200">
            {student?.name?.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <p className="text-[10px] font-bold text-indigo-650 text-indigo-600 tracking-wider uppercase font-mono">Class Student</p>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">{student?.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {student?.studentIdCardNum}</p>
          
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold font-mono">
              Grade {student?.classGrade} Folder Access
            </span>
            {(student?.seatNumber || student?.benchNumber) && (
              <>
                {student.seatNumber && (
                  <span className="inline-block px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-md text-[10px] font-bold font-mono">
                    Seat: {student.seatNumber}
                  </span>
                )}
                {student.benchNumber && (
                  <span className="inline-block px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-md text-[10px] font-bold font-mono">
                    Bench: {student.benchNumber}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dashboard Menu Buttons */}
        <div className="space-y-1 pt-1">
          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('assignments-desk')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'assignments-desk' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            My Assignment Desk
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('study-folder')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'study-folder' 
                ? 'bg-indigo-50 text-indigo-805 text-indigo-800 border border-indigo-205 border-indigo-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Class {student?.classGrade} Reference Library
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('grades')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'grades' 
                ? 'bg-amber-50 text-amber-805 text-amber-805 text-amber-800 border border-amber-205 border-amber-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            Reports & Grades
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'timetable' 
                ? 'bg-sky-50 text-sky-805 text-sky-850 text-sky-800 border border-sky-105 border-sky-100 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            My Class Timetable
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'attendance' 
                ? 'bg-rose-50 text-rose-805 text-rose-800 border border-rose-205 border-rose-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
            Attendance Register
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('faculty-directory')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'faculty-directory' 
                ? 'bg-slate-100 text-slate-805 text-slate-800 border border-slate-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-slate-600" />
            Faculty Directory
          </motion.button>
        </div>

        {/* Academic Fees Balance Widget */}
        <div className="border-t border-slate-100 pt-4 space-y-3 font-sans">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>My Tuition Balance</span>
            {student.pendingFee > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Annual Tuition Fee</span>
              <span className="font-extrabold text-slate-700 font-mono">₹{student.totalFee ?? 15000}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Total Paid</span>
              <span className="font-semibold text-emerald-600 font-mono">₹{student.paidFee ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 font-bold font-sans">
              <span className="text-slate-600">Pending Balances</span>
              <span className={`${student.pendingFee > 0 ? "text-red-650 text-red-600" : "text-emerald-700"} font-mono`}>
                ₹{student.pendingFee ?? 15000}
              </span>
            </div>
            
            {/* Status Badge */}
            <div className="pt-1.5 text-center">
              <span className={`inline-block w-full py-1 rounded text-[10px] font-bold font-mono ${
                student.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                student.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {student.paymentStatus ?? 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Panel */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="lg:col-span-3 space-y-6"
      >

        {/* Warning Badge / Notification Banner for Pending Fees */}
        {student.pendingFee > 0 && (
          <motion.div
            id="pending-fee-alert"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3.5 shadow-sm font-sans"
          >
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-amber-900 tracking-wide uppercase font-mono bg-amber-100 px-2 py-0.5 rounded">
                  ⚠️ Tuition Payment Alert
                </span>
                <span className="text-xs text-slate-900 font-mono">
                  <strong className="font-black text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Deadline:</strong> June 15, 2026
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-normal">
                Dear <span className="font-semibold">{student.name}</span>, you have an outstanding pending balance of <strong className="text-red-600 font-mono">₹{student.pendingFee}</strong>. Please ensure this amount is disbursed before the given due date to avoid restricted reference library permissions or pending status validations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Dynamic tabs display */}
        {activeTab === 'assignments-desk' && (
          <div className="space-y-6">
            
            {/* Split screen: Tasks Queue & Editor */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Task Queue list */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm xl:col-span-2 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-sans">Task Assignments Queue</h2>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Assignments assigned to Class {student?.classGrade} group. Submit solutions online.</p>
                </div>

                {myClassAssignments.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-6 text-center font-sans">No assignments posted for Class {student?.classGrade} yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {myClassAssignments.map(asg => {
                      const submission = getSubmissionByAsg(asg.id);
                      const isExpired = new Date(asg.dueDate).getTime() < new Date().getTime();

                      return (
                        <div key={asg.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3.5 hover:border-blue-200 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-semibold rounded uppercase mr-2 tracking-wide font-mono">
                                {asg.subject}
                              </span>
                              <span className="text-xs font-bold text-slate-800 font-sans">{asg.title}</span>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">Posted by {asg.teacherName} • Due {new Date(asg.dueDate).toLocaleString()}</p>
                            </div>

                            {submission ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono ${
                                submission.status === 'GRADED' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {submission.status === 'GRADED' ? `Grade: ${submission.grade}` : 'Submitted (Secure)'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold border border-slate-200 font-mono">
                                Pending Completion
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-605 text-slate-650 leading-relaxed font-normal font-sans">
                            {asg.description}
                          </p>

                          {submission && submission.feedback && (
                            <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 text-[11px] leading-relaxed">
                              <span className="font-bold text-blue-800 font-mono">Teacher feedback evaluation remarks:</span>
                              <p className="text-slate-600 italic mt-0.5 font-sans">"{submission.feedback}"</p>
                            </div>
                          )}

                          {!submission && (
                            <button
                              onClick={() => {
                                setActiveSubmitAsgId(asg.id);
                                setSubmissionBoxText('');
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer font-sans"
                            >
                              Write Homework Answer Sheet
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Secure Answer Sheet block */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 font-sans">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Answer Workbook
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                  Select an assignment in the left queue to complete. Your answers will be securely submitted directly to your teacher.
                </p>

                {activeSubmitAsgId ? (
                  <form onSubmit={handleSubmitHomework} className="space-y-4">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-sans">
                      <p className="font-semibold text-slate-600">Completing assignment:</p>
                      <p className="text-blue-605 text-blue-600 truncate mt-0.5 font-bold font-mono">
                        {assignments.find(a => a.id === activeSubmitAsgId)?.title}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Homework Workspace</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Write solutions, derivations or essay contents..."
                        value={submissionBoxText}
                        onChange={e => setSubmissionBoxText(e.target.value)}
                        className="w-full font-mono text-[11px] border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-500"
                      />
                    </div>

                    {/* Drag and Drop homework file component */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                        Attach Homework Document (Read/Simulate Upload)
                      </label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setSubDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setSubDragActive(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setSubDragActive(false);
                          if (e.dataTransfer.files?.[0]) {
                            handleSubmissionFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById('student-hw-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                          subDragActive 
                            ? 'border-blue-550 bg-blue-50 text-blue-800' 
                            : subFileName 
                            ? 'border-emerald-300 bg-emerald-50/20' 
                            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="file"
                          id="student-hw-file-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleSubmissionFile(e.target.files[0]);
                            }
                          }}
                        />
                        {subFileName ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 font-sans">
                              <span className="p-1 bg-emerald-100 rounded text-emerald-700">✓ Attached</span>
                              {subFileName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">File Size: {subFileSize} • Click or drag to replace</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                            <p className="text-xs font-semibold text-slate-600 font-sans">
                              Drag & drop document here, or <span className="text-blue-600 underline">browse computer</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">Supports any handout essay, math, log, txt or code file</p>
                          </div>
                        )}
                      </div>
                      {subFileName && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubFileName(null);
                            setSubFileSize(null);
                          }}
                          className="text-[10px] text-red-650 text-red-600 hover:underline font-bold block ml-auto font-mono"
                        >
                          Remove Attached File
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer font-sans"
                      >
                        Submit Secure Homework
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubmitAsgId(null);
                          setSubFileName(null);
                          setSubFileSize(null);
                        }}
                        className="px-3 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition rounded-lg text-xs font-sans"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border border-dashed border-slate-200 p-6 rounded-lg text-center py-12">
                    <p className="text-xs text-slate-400 leading-normal font-sans">
                      Select a homework assignment in the left queue to open the answer workbook space.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {activeTab === 'study-folder' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Class {student?.classGrade} Reference Library Folders
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Official materials and reference manuals uploaded by faculty. Decrypt and read references online.</p>
            </div>

            {myClassMaterials.length === 0 ? (
              <p className="text-xs italic text-slate-400 py-6 text-center font-sans">No study reference material files uploaded in Class {student?.classGrade} folder directory yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClassMaterials.map(mat => {
                  const isOpened = decryptedMaterialId === mat.id;
                  const decryptedPayload = decryptData(mat.fileContent, 'SCHOOL_SECRET_KEY');

                  return (
                    <div key={mat.id} className="border border-slate-200 bg-slate-50/50 rounded-lg p-4.5 space-y-3.5 hover:border-blue-150 transition-colors flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-[9px] text-blue-700 font-bold rounded uppercase font-mono">
                            {mat.subject}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{mat.fileSize}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 font-sans">{mat.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-normal font-sans">{mat.description}</p>
                      </div>

                      {/* File preview */}
                      {isOpened && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 mt-2 space-y-1">
                          <span className="text-[9px] font-bold text-emerald-750 text-emerald-700 uppercase flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded w-fit font-mono">
                            <BookOpen className="w-2.5 h-2.5" /> Course Handbook View
                          </span>
                          <p className="font-sans text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap mt-1">
                            {decryptedPayload}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleDownloadAndDecrypt(mat.id)}
                          className="flex-1 py-2 border border-blue-100 hover:bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          {isOpened ? (
                            <> Close Document View </>
                          ) : (
                            <> <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Open Reference Document </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(mat.fileName, mat.fileContent)}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title="Download Decrypted Handout File"
                        >
                          <Download className="w-3.5 h-3.5 text-white" />
                          Download File
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}        {activeTab === 'grades' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <Award className="w-5 h-5 text-blue-600" />
                Student Academic Report Card
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Consolidated progress evaluation and automated letter grade trackers.</p>
            </div>

            {/* Simulated GPA / Progress Card */}
            <div className="bg-blue-50 border border-blue-105 border-blue-100 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 font-sans">
                <p className="text-xs text-blue-750 text-blue-700 font-extrabold font-mono">Active Classes Enrolled</p>
                <p className="text-2xl font-black text-slate-900">{student?.classGrade} Academic Division</p>
              </div>

              <div className="space-y-1 border-y border-dashed border-blue-200 py-3 md:py-0 md:border-y-0 md:border-x md:px-4 font-sans">
                <p className="text-xs text-blue-750 text-blue-700 font-extrabold font-mono">Homework Completed</p>
                <p className="text-xl font-bold text-slate-900 font-mono">
                  {submissions.filter(s => s.studentId === student?.id).length} Submissions
                </p>
              </div>

              <div className="space-y-1 font-sans font-sans">
                <p className="text-xs text-blue-705 text-blue-700 font-extrabold font-mono">Overall Progress Evaluation</p>
                <p className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                  🎓 Good Standing <span className="text-xs font-normal text-blue-700">(Approved)</span>
                </p>
              </div>
            </div>

            {/* List of graded submissions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-705 text-slate-700 uppercase tracking-wide font-mono">Tasks Evaluation Log</h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden font-sans">
                <table className="w-full text-xs text-left text-slate-500">
                  <thead className="bg-slate-55 bg-slate-50 border-b border-slate-205 border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase font-mono">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Assignment Description</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Automatic Grade Status</th>
                      <th className="py-3 px-4">Teacher Comments/Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {submissions.filter(s => s.studentId === student?.id).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs italic text-slate-450">
                          No submissions recorded in system database for your profile.
                        </td>
                      </tr>
                    ) : (
                      submissions
                        .filter(s => s.studentId === student?.id)
                        .map(sub => (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {assignments.find(a => a.id === sub.assignmentId)?.subject || 'Academics'}
                            </td>
                            <td className="py-3.5 px-4 leading-normal">
                              <p className="font-semibold text-slate-800">{sub.assignmentTitle}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === 'GRADED' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {sub.status === 'GRADED' ? `Grade: ${sub.grade}` : 'Pending review'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate italic text-slate-500">
                              {sub.feedback || 'No remarks published yet.'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* My Class Timetable View */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <Calendar className="w-5 h-5 text-blue-600" />
                Class {student?.classGrade} Weekly Timetable
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Consult class durations, subject streams, and tutors assigned for current academic sessions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                const slots = timetables.filter(t => t.classGrade === student?.classGrade && t.day === dayName);
                return (
                  <div key={dayName} className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/20 space-y-3 font-sans">
                    <h3 className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-100 py-1 px-2.5 rounded w-fit font-mono">
                      {dayName}
                    </h3>

                    {slots.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2 pl-1">No lectures structured for {dayName}.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {slots.map(slot => (
                          <div key={slot.id} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{slot.subject}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.timeSlot}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {slot.teacherName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attendance Register Panel View */}
        {activeTab === 'attendance' && (() => {
          const myRecords = attendance.filter(r => r.studentId === student.id);
          const totalRecords = myRecords.length;
          const presentCount = myRecords.filter(r => r.status === 'PRESENT').length;
          const absentCount = myRecords.filter(r => r.status === 'ABSENT').length;
          const lateCount = myRecords.filter(r => r.status === 'LATE').length;
          const excusedCount = myRecords.filter(r => r.status === 'EXCUSED').length;

          // Attendance rate calculation (treating PRESENT and LATE as present, EXCUSED as exempt or neutral)
          const netTurnoutCount = presentCount + lateCount + excusedCount;
          const turnoutPercentage = totalRecords > 0 
            ? Math.round((netTurnoutCount / totalRecords) * 100) 
            : 100;

          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans pb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-650 text-blue-600" />
                    My Attendance & Turnout Log
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Monitor your daily class presence, view active roll call records logged by faculty, and review custom remarks.
                  </p>
                </div>

                {/* Turnout metrics grids */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Turnout Rate</span>
                    <strong className={`text-2xl font-black mt-1 ${
                      turnoutPercentage >= 85 ? 'text-emerald-600' : turnoutPercentage >= 75 ? 'text-amber-500' : 'text-rose-600'
                    }`}>
                      {totalRecords > 0 ? `${turnoutPercentage}%` : 'N/A'}
                    </strong>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Minimum Required: 75%</span>
                  </div>

                  <div className="bg-emerald-50/45 border border-emerald-100/60 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">Present</span>
                    <strong className="text-2xl font-black text-emerald-800 mt-1">{presentCount}</strong>
                    <span className="text-[9px] text-emerald-600/80 mt-0.5 font-mono">On-time sessions</span>
                  </div>

                  <div className="bg-rose-50/45 border border-rose-100/60 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider font-mono">Absent</span>
                    <strong className="text-2xl font-black text-rose-800 mt-1">{absentCount}</strong>
                    <span className="text-[9px] text-rose-600/80 mt-0.5 font-mono">Inquiries pending</span>
                  </div>

                  <div className="bg-amber-50/45 border border-amber-100/60 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-mono">Late / Excused</span>
                    <strong className="text-2xl font-black text-amber-900 mt-1">{lateCount + excusedCount}</strong>
                    <span className="text-[9px] text-amber-700/80 mt-0.5 font-mono">Tardiness documented</span>
                  </div>
                </div>

                {/* Absence Warn Alert Banner */}
                {absentCount > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 font-sans">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold leading-none uppercase tracking-wide font-mono text-rose-700">Diligent Academic Turnout Advisory</p>
                      <p className="text-xs leading-relaxed text-rose-950/80">
                        You have been marked **Absent** from **{absentCount} class lecture-hour(s)**. If this was an error, consult with the respective teacher to review. Standard guidelines stipulate maintaining at least a 75% turnout velocity to remain eligible for term examinations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Detailed History Table */}
                <div className="space-y-3 font-sans">
                  <h3 className="text-xs font-bold text-slate-650 tracking-wider uppercase font-mono text-slate-500"> Roster Roll Call Chronicle</h3>
                  {myRecords.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-1">
                      <p className="text-sm text-slate-500 italic">No attendance entries published for you in the system records yet.</p>
                      <p className="text-[10px] text-slate-400">Class faculty roll calls will reflect here as they get submitted.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-150">
                      {[...myRecords].reverse().map((rec) => (
                        <div key={rec.id} className="p-4 bg-slate-50/15 hover:bg-slate-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 text-sm">{rec.subject} Class</span>
                              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                Date: {rec.date}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Marked by: <strong>{rec.teacherName}</strong>
                            </p>
                            {rec.remarks && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5 bg-slate-100/50 py-0.5 px-2 rounded w-fit">
                                Remarks: "{rec.remarks}"
                              </p>
                            )}
                          </div>

                          <span className={`px-3 py-1 rounded-full font-black text-[10px] tracking-wide font-mono text-center sm:text-right w-fit ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : rec.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : rec.status === 'LATE'
                              ? 'bg-amber-100 text-amber-805 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Faculty Directory View */}
        {activeTab === 'faculty-directory' && (
          <FacultyDirectory teachers={teachers} />
        )}

      </motion.div>

    </div>
  );
}
