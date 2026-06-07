/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ClassGrade, StudyMaterial, Assignment, AttendanceStatus, AttendanceRecord } from '../../types';
import { decryptData } from '../../cryptoUtils';
import { Upload, PlusCircle, CheckSquare, MessageSquare, BookOpen, Send, Lock, Unlock, Award, ChevronRight, FileText, Calendar, Download, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function TeacherDashboard() {
  const {
    currentUser,
    students,
    parents,
    studyMaterials,
    assignments,
    submissions,
    messages,
    timetables,
    attendance,
    sendMessage,
    uploadStudyMaterial,
    deleteStudyMaterial,
    createAssignment,
    gradeSubmission,
    submitDailyAttendance
  } = useSchool();

  const teacher = currentUser as any;

  const [activeSubTab, setActiveSubTab] = useState<'material' | 'assignment' | 'submissions' | 'communications' | 'timetable' | 'attendance'>('submissions');

  // Attendance states
  const [attClass, setAttClass] = useState<ClassGrade>(teacher?.classes?.[0] || '9th');
  const [attSubject, setAttSubject] = useState<string>(teacher?.subjects?.[0] || 'Mathematics');
  const [attDate, setAttDate] = useState('2026-05-29');
  
  // Custom records dictionary that holds { studentId: { status, remarks } }
  const [attRecords, setAttRecords] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  // Auto initialize default attendance status for student roster
  const activeClassStudents = students.filter(s => s.classGrade === attClass);
  
  React.useEffect(() => {
    // Build initial status state
    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    activeClassStudents.forEach(st => {
      // Check if there is an existing record for this class, subject, date, student
      const existing = attendance.find(
        r => r.studentId === st.id && r.classGrade === attClass && r.subject === attSubject && r.date === attDate
      );
      initial[st.id] = {
        status: existing?.status || 'PRESENT',
        remarks: existing?.remarks || ''
      };
    });
    setAttRecords(initial);
  }, [attClass, attSubject, attDate, students, attendance]);

  // Study material form state
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matClass, setMatClass] = useState<ClassGrade>('9th');
  const [matSubject, setMatSubject] = useState('Mathematics');
  const [matFileName, setMatFileName] = useState('');
  const [matFileContent, setMatFileContent] = useState('');
  const [matDragActive, setMatDragActive] = useState(false);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Assignment form state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgClass, setAsgClass] = useState<ClassGrade>('9th');
  const [asgSubject, setAsgSubject] = useState('Mathematics');
  const [asgDueDate, setAsgDueDate] = useState('');

  // Grading states
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [inputGrade, setInputGrade] = useState('');
  const [inputFeedback, setInputFeedback] = useState('');
  const [revealSubId, setRevealSubId] = useState<string[]>([]); // Keeps track of decrypted submission contents

  // Communication states
  const [selectedParentId, setSelectedParentId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [whatsappInfo, setWhatsappInfo] = useState<{ url: string; parentName: string; phone: string } | null>(null);

  const handleMaterialFile = (file: File) => {
    if (!file) return;
    setMatFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    
    // Auto populate Title
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setMatTitle(prev => prev ? prev : cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || '';
      setMatFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadHomeworkFile = (fileName: string, encryptedContent: string) => {
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
      console.error('Failed to download homework file', e);
    }
  };

  const handleDownloadMaterialFile = (fileName: string, encryptedContent: string) => {
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
      console.error('Failed to download material file', e);
    }
  };

  // Upload study material trigger
  const handleMaterialUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle || !matDesc || !matFileName || !matFileContent) return;

    uploadStudyMaterial({
      title: matTitle,
      description: matDesc,
      classGrade: matClass,
      subject: matSubject,
      fileName: matFileName,
      fileSize: uploadedFileSize || `${(matFileContent.length / 1024).toFixed(1)} KB`,
      fileContent: matFileContent // Context will encrypt this
    });

    // Reset
    setMatTitle('');
    setMatDesc('');
    setMatFileName('');
    setMatFileContent('');
    setUploadedFileSize(null);
  };

  // Assign task trigger
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || !asgDesc || !asgDueDate) return;

    createAssignment({
      title: asgTitle,
      description: asgDesc,
      classGrade: asgClass,
      subject: asgSubject,
      dueDate: new Date(asgDueDate).toISOString()
    });

    setAsgTitle('');
    setAsgDesc('');
    setAsgDueDate('');
  };

  // Grade submit trigger
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId || !inputGrade) return;

    gradeSubmission(selectedSubId, inputGrade, inputFeedback);
    setSelectedSubId(null);
    setInputGrade('');
    setInputFeedback('');
  };

  // Message trigger
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || !chatInput.trim()) return;

    const parentUser = parents.find(p => p.id === selectedParentId);

    // Call standard internal send message
    sendMessage(selectedParentId, chatInput);

    if (parentUser && parentUser.mobileNumber) {
      // Find the child student
      const student = students.find(s => s.id === parentUser.childId);

      // Filter graded submissions for this child student
      const studentSubmissions = submissions.filter(
        sub => sub.studentId === student?.id && sub.status === 'GRADED'
      );

      let homeworkReport = 'No homework items graded yet in system.';
      if (studentSubmissions.length > 0) {
        homeworkReport = studentSubmissions.map(
          sub => `• ${sub.assignmentTitle}: Grade [${sub.grade || 'N/A'}] feedback "${sub.feedback || 'Excellent'}"`
        ).join('\n');
      }

      // Construct a professional progress report
      const reportText = `*ACADEMY STUDENT PROGRESS LOG*\n` +
        `----------------------------------------\n` +
        `*Dear ${parentUser.name},*\n\n` +
        `Here is the official progress report for your child *${student?.name || parentUser.childName || 'N/A'}*:\n\n` +
        `*💬 Teacher Message Memo:*\n` +
        `"${chatInput}"\n\n` +
        `*📊 Enrollment batch:*\n` +
        `- Class: Class ${student?.classGrade || parentUser.childClass || 'N/A'}\n` +
        `- Enrollment Card ID: ${student?.studentIdCardNum || 'N/A'}\n` +
        `${student?.seatNumber ? `- Active Seat: Seat ${student.seatNumber}\n` : ''}` +
        `${student?.benchNumber ? `- Active Bench: Bench ${student.benchNumber}\n` : ''}\n` +
        `*💳 Financial Ledger & Outstandings:*\n` +
        `- Projected Annual Fee: ₹${student?.totalFee ?? 15000}\n` +
        `- Fees Disbursed/Paid: ₹${student?.paidFee ?? 0}\n` +
        `- Net Outstanding Balance: ₹${student?.pendingFee ?? 0}\n` +
        `- Ledger Status: *${student?.paymentStatus || 'PENDING'}*\n\n` +
        `*📚 Academic Coursework Submissions Graded:*\n` +
        `${homeworkReport}\n\n` +
        `----------------------------------------\n` +
        `_Sent securely via Academy Official Gateway._`;

      const cleanPhone = parentUser.mobileNumber.replace(/[^0-9+]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}/?text=${encodeURIComponent(reportText)}`;

      // Store in state so we display a direct clickable action badge if a pop-up is blocked
      setWhatsappInfo({
        url: waUrl,
        parentName: parentUser.name,
        phone: parentUser.mobileNumber
      });

      // Attempt popup redirect
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn('Browser popups blocked automatic WhatsApp opening', err);
      }
    }

    setChatInput('');
  };

  // Toggle decryption visualization
  const toggleDecryption = (subId: string) => {
    if (revealSubId.includes(subId)) {
      setRevealSubId(prev => prev.filter(id => id !== subId));
    } else {
      setRevealSubId(prev => [...prev, subId]);
    }
  };

  // Filter submissions by teacher subjects
  const teacherSubmissions = submissions.filter(s => {
    // Show all submissions for simplicity, or if we want to filter logically:
    return true; 
  });

  // Communication messages stream
  const filteredMessages = messages.filter(m => 
    (m.senderId === currentUser?.id || m.receiverId === currentUser?.id)
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Parent options list for dropdown
  const parentChoices = parents.map(p => ({
    id: p.id,
    display: `${p.name} (Parent of ${p.childName}, Class ${p.childClass})`
  }));

  // Homework status tracking calculations
  const totalStudentsCount = students.length;
  const gradedCount = submissions.filter(s => s.status === 'GRADED').length;
  const pendingEvaluation = submissions.filter(s => s.status === 'SUBMITTED').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1">
      {/* Sidebar layout */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm col-span-1 h-fit space-y-2">
        <div className="px-3 py-2 mb-4 border-b border-gray-100 pb-4">
          <p className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">Faculty Lounge</p>
          <p className="text-sm font-bold text-gray-800 mt-1">{currentUser?.name}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {(currentUser as any)?.subjects?.map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-[9px] text-gray-500 font-bold rounded">
                {s}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setActiveSubTab('submissions')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'submissions' 
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          Grades & Submissions ({pendingEvaluation})
        </button>

        <button 
          onClick={() => setActiveSubTab('material')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'material' 
              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4 text-cyan-600" />
          Upload Study Material
        </button>

        <button 
          onClick={() => setActiveSubTab('assignment')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'assignment' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          Assign Homework Task
        </button>

        <button 
          onClick={() => setActiveSubTab('communications')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'communications' 
              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-600" />
          Parent Dialogue Portal
        </button>

        <button 
          onClick={() => setActiveSubTab('attendance')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'attendance' 
              ? 'bg-rose-50 text-rose-805 text-rose-800 border border-rose-200' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-rose-600" />
          Attendance Roll Call
        </button>

        <button 
          onClick={() => setActiveSubTab('timetable')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeSubTab === 'timetable' 
              ? 'bg-sky-50 text-sky-850 text-sky-800 border border-sky-100' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-600" />
          My Assigned Timetable
        </button>
      </div>

      {/* Main Panel Area */}
      <motion.div 
        key={activeSubTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="lg:col-span-3 space-y-6"
      >

        {/* Dashboard completion banner helper */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between font-sans">
          <div className="space-y-1">
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider font-mono">Academic Achievement Stats</p>
            <div className="flex flex-wrap gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-600">✍️ {pendingEvaluation} Homework Submissions Pending</span>
              <span className="text-xs font-semibold text-slate-600">✅ {gradedCount} Tasks Evaluated</span>
            </div>
          </div>
          
          <div className="w-full md:w-48 bg-slate-50 rounded-lg p-2.5 border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono">Evaluation Rate</p>
            <div className="flex justify-between items-baseline mt-1 font-mono">
              <span className="text-lg font-bold text-blue-600">
                {submissions.length ? Math.round((gradedCount / submissions.length) * 100) : 100}%
              </span>
              <span className="text-[10px] text-slate-400">{gradedCount} of {submissions.length}</span>
            </div>
          </div>
        </div>

        {/* Selected Mode displays */}
        {activeSubTab === 'submissions' && (
          <div className="space-y-6">
            
            {/* Split layout: Submissions list & Grading panel */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Submissions List */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm xl:col-span-2 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-sans">Pending & Graded Homeworks</h2>
                  <p className="text-xs text-slate-405 text-slate-400 mt-1 font-sans">Review student task solutions. Toggle secure decryption view before grading.</p>
                </div>

                {teacherSubmissions.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-6 text-center font-sans">No student assignments submitted yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {teacherSubmissions.map(sub => {
                      const displayContent = decryptData(sub.submittedContent, 'SCHOOL_SECRET_KEY');

                      return (
                        <div key={sub.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3.5 hover:border-blue-200 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 font-sans">{sub.assignmentTitle}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                                Submitted by <span className="font-semibold text-blue-700">{sub.studentName}</span> (Class {sub.classGrade}) • {new Date(sub.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              sub.status === 'GRADED' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {sub.status === 'GRADED' ? `Graded: ${sub.grade}` : 'Pending review'}
                            </span>
                          </div>

                          {/* Attached real file, if exists */}
                          {sub.fileName && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-bold text-emerald-900 truncate block font-sans">{sub.fileName}</span>
                                  <span className="text-[10px] text-emerald-750 font-mono block">Attached File size: {sub.fileSize}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDownloadHomeworkFile(sub.fileName!, sub.submittedContent)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer hover:shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5 text-white" />
                                Download Answer Sheet
                              </button>
                            </div>
                          )}

                          {/* Student answer preview */}
                          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                            <div className="border-b border-slate-100 pb-1.5 font-sans font-sans">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Student Submitted Answer
                              </span>
                            </div>

                            <p className="font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed break-all">
                              {displayContent}
                            </p>
                          </div>

                          {sub.feedback && (
                            <div className="bg-blue-50/40 p-2.5 rounded border border-blue-100 text-xs">
                              <p className="font-bold text-blue-800 font-mono">Teacher Evaluation Remarks:</p>
                              <p className="text-slate-650 mt-1 italic font-sans">"{sub.feedback}"</p>
                            </div>
                          )}

                          {sub.status === 'SUBMITTED' && (
                            <button
                              onClick={() => {
                                setSelectedSubId(sub.id);
                                setInputGrade('');
                                setInputFeedback('');
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer font-sans"
                            >
                              Assess & Enter Grade
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Evaluator Panel */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Academic Evaluator
                </h3>
                <p className="text-xs text-gray-400 mb-4">Click "Assess" on a student submission to evaluate, grade, and give performance feedback.</p>

                {selectedSubId ? (
                  <form onSubmit={handleGradeSubmit} className="space-y-4">
                    <div className="bg-gray-50 p-2.5 rounded border text-xs">
                      <p className="font-semibold text-gray-600">Assessing Submission ID:</p>
                      <p className="text-gray-400 font-mono mt-0.5">{selectedSubId}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium">Assign Grade / Score</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. A+, B-, 92%, Excellent"
                        value={inputGrade}
                        onChange={e => setInputGrade(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium">Evaluation Feedback</label>
                      <textarea
                        rows={3}
                        placeholder="Provide concrete details to help the student learn..."
                        value={inputFeedback}
                        onChange={e => setInputFeedback(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Publish Grade
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubId(null)}
                        className="px-3.5 py-2.5 bg-gray-150 text-gray-650 rounded-lg text-xs font-medium hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border border-dashed border-gray-200 p-6 rounded-xl text-center py-10">
                    <p className="text-xs text-gray-400">Select a student submission on the left to activate grading controls.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {activeSubTab === 'material' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 xl:col-span-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans pb-1 justify-between">
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Upload Course Study Materials
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">Upload handouts or syllabi. Only students registered in the designated class level will be able to access and open them.</p>
              </div>

              {/* Drag and Drop zone for Teacher Upload */}
              <div className="space-y-1.5 font-sans">
                <label className="text-xs text-slate-500 font-medium">Drag & Drop Handout File (Pre-fill Form)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setMatDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setMatDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMatDragActive(false);
                    if (e.dataTransfer.files?.[0]) handleMaterialFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('teacher-mat-file-input')?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    matDragActive 
                      ? 'border-blue-500 bg-blue-50 text-blue-800' 
                      : matFileName 
                      ? 'border-emerald-300 bg-emerald-50/20' 
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    id="teacher-mat-file-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleMaterialFile(e.target.files[0]);
                    }}
                  />
                  {matFileName ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                        <span className="p-1 bg-emerald-100 rounded text-emerald-700">✓ Detected</span>
                        {matFileName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Size: {uploadedFileSize} • Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-600">
                        Drag and drop a PDF, Word, text or code file here, or <span className="text-blue-600 underline">browse computer</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Fully reads, fills out fields, and secures on-the-fly</p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleMaterialUpload} className="space-y-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium font-sans">Document Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Kinematics Equations and Friction"
                      value={matTitle}
                      onChange={e => setMatTitle(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium font-sans">Virtual Filename</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. physics_equations_sheet.pdf"
                      value={matFileName}
                      onChange={e => setMatFileName(e.target.value)}
                      className="w-full text-[11px] font-mono border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium font-sans">Subject Topic</label>
                    <select
                      value={matSubject}
                      onChange={e => setMatSubject(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="English Literature">English Literature</option>
                      <option value="History">History</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium font-sans">Target Class Grade Folder</label>
                    <select
                      value={matClass}
                      onChange={e => setMatClass(e.target.value as ClassGrade)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                    >
                      <option value="9th">Class 9th Folder</option>
                      <option value="10th">Class 10th Folder</option>
                      <option value="11th">Class 11th Folder</option>
                      <option value="12th">Class 12th Folder</option>
                    </select>
                  </div>

                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Short Brief Summary Description</label>
                  <input 
                    type="text"
                    required
                    placeholder="Describe what's in this study document..."
                    value={matDesc}
                    onChange={e => setMatDesc(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-mono">Study Material Content (Simulated File Text)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter course guidelines, formulas, textbook readings, or lesson notes..."
                    value={matFileContent}
                    onChange={e => setMatFileContent(e.target.value)}
                    className="w-full font-mono text-[11px] border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer transition shadow-xs font-sans"
                >
                  <Lock className="w-4 h-4" />
                  Upload Study Material to Class {matClass} Folder
                </button>
              </form>
            </div>

            {/* List side panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Uploaded Catalog
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Reference documents uploaded to Class lockers.</p>
              </div>

              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {studyMaterials.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-6 text-center font-sans animate-pulse">No materials posted yet.</p>
                ) : (
                  studyMaterials.map((mat) => (
                    <div key={mat.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/40 space-y-2.5 hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-bold font-mono">
                          <span className="text-blue-700 uppercase bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            {mat.subject}
                          </span>
                          <span className="text-slate-400">Class {mat.classGrade} Folder</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 mt-1.5 font-sans truncate" title={mat.title}>{mat.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{mat.fileName} ({mat.fileSize})</p>
                      </div>

                      {deletingId === mat.id ? (
                        <div className="bg-red-50/50 p-2 rounded-lg border border-red-100/60 flex flex-col gap-2">
                          <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wide font-mono text-center">Delete permanently?</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                deleteStudyMaterial(mat.id);
                                setDeletingId(null);
                              }}
                              className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded transition cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="flex-1 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-between">
                          <button
                            type="button"
                            onClick={() => handleDownloadMaterialFile(mat.fileName, mat.fileContent)}
                            className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(mat.id)}
                            className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded flex items-center justify-center transition cursor-pointer"
                            title="Delete this study material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'assignment' && (
          <div className="bg-white rounded-xl border border-slate-205 border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Assign Homework Task / Specific Study Groups
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Post a new assignment. Targeted students and their parents will be notified instantly via system-wide sync.</p>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Assignment Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Exercise 4.2 Quadratic Formulas"
                    value={asgTitle}
                    onChange={e => setAsgTitle(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Due Date & Completion Time</label>
                  <input 
                    type="datetime-local"
                    required
                    value={asgDueDate}
                    onChange={e => setAsgDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Subject Category</label>
                  <select
                    value={asgSubject}
                    onChange={e => setAsgSubject(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500 font-sans"
                  >
                    <option value="Mathematics font-sans">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="English Literature">English Literature</option>
                    <option value="History">History</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Target Class Level</label>
                  <select
                    value={asgClass}
                    onChange={e => setAsgClass(e.target.value as ClassGrade)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500 font-sans"
                  >
                    <option value="9th">Class 9th Folder</option>
                    <option value="10th">Class 10th Folder</option>
                    <option value="11th">Class 11th Folder</option>
                    <option value="12th">Class 12th Folder</option>
                  </select>
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium font-sans">Assignment Guidelines & Instructions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe precisely what students should complete, write out equations or reference sections, and outline expectations..."
                  value={asgDesc}
                  onChange={e => setAsgDesc(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 focus:bg-white focus:outline-blue-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Assign Homework and Alert Student-Parent Network
              </button>
            </form>
          </div>
        )}

        {activeSubTab === 'communications' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Parent Communication Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Keep parents updated on child progress. All dialogs are kept secure and private.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              {/* Writer Form */}
              <div className="md:col-span-1 border border-slate-200 p-4 rounded-lg h-fit space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5 text-blue-600" /> Write Message
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-medium font-mono">Linked Parent Recipient</label>
                  <select
                    value={selectedParentId}
                    onChange={e => {
                      setSelectedParentId(e.target.value);
                      setWhatsappInfo(null);
                    }}
                    className="w-full text-xs border border-slate-205 border-slate-200 p-2.5 rounded-lg bg-slate-50/50 font-sans"
                  >
                    <option value="">-- Choose a parent --</option>
                    {parentChoices.map(p => (
                      <option key={p.id} value={p.id}>{p.display}</option>
                    ))}
                  </select>

                  {selectedParentId && (
                    <div className="text-[10px] leading-relaxed pt-1 flex flex-wrap gap-1">
                      {parents.find(p => p.id === selectedParentId)?.mobileNumber ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md font-extrabold font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          WhatsApp: {parents.find(p => p.id === selectedParentId)?.mobileNumber} (Compulsory)
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-bold font-mono">
                          ⚠️ No contact number stored
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Message text</label>
                  <textarea
                    rows={4}
                    placeholder="Enter private memo to parent..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={!selectedParentId}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 disabled:opacity-50"
                  />
                </div>

                {whatsappInfo && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-800 space-y-2 animate-fade-in font-sans">
                    <p className="font-bold flex items-center gap-1.5 leading-tight">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                      Dispatching to WhatsApp...
                    </p>
                    <p className="text-slate-600 leading-relaxed font-sans">
                      Secure memo saved. We attempted to open WhatsApp Web containing the student progress report for <strong>{whatsappInfo.parentName}</strong> ({whatsappInfo.phone}). If blockages occurred, click below:
                    </p>
                    <a
                      href={whatsappInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-center text-xs font-bold flex items-center justify-center gap-1 transition-colors select-none font-sans"
                    >
                      💬 Click to open WhatsApp Chat
                    </a>
                    <button
                      type="button"
                      onClick={() => setWhatsappInfo(null)}
                      className="text-emerald-700 underline text-[10px] block mx-auto py-0.5 hover:text-emerald-950 cursor-pointer font-bold font-sans"
                    >
                      Dismiss banner
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!selectedParentId || !chatInput.trim()}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-xs font-sans"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send & Open WhatsApp Progress Report
                </button>
              </div>

              {/* Chat history stream representation */}
              <div className="md:col-span-2 border border-slate-200 rounded-lg p-4 space-y-4 h-[350px] flex flex-col justify-between bg-slate-50/20">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">Secure Communications Log</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-400 italic">No communication history logged inside this terminal session.</p>
                    </div>
                  ) : (
                    filteredMessages.map(msg => {
                      const isMe = msg.senderId === currentUser?.id;
                      const decryptedText = decryptData(msg.content, 'SCHOOL_SECRET_KEY');
                      
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-3 rounded-lg text-xs max-w-sm ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-xs'
                          }`}>
                            <div className="flex items-center gap-1 opacity-75 text-[9px] mb-1 font-mono justify-between">
                              <span>{isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="flex items-center gap-0.5 font-sans"><Lock className="w-2.5 h-2.5" /> Private</span>
                            </div>
                            <p className="leading-relaxed">{decryptedText}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Daily Attendance Roll Call section */}
        {activeSubTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans pb-1">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  Daily Student Turnout & Roll Call
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Select a class grade and course subject to initiate turnout roster list. Double-check statuses and hit commit to securely lock records and trigger automated parent SMS alerts.
                </p>
              </div>

              {/* Selector Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60 font-sans">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Academic Class Grade</label>
                  <select
                    value={attClass}
                    onChange={(e) => setAttClass(e.target.value as ClassGrade)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-blue-500"
                  >
                    <option value="9th">Class 9th Folder</option>
                    <option value="10th">Class 10th Folder</option>
                    <option value="11th">Class 11th Folder</option>
                    <option value="12th">Class 12th Folder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Lecture Subject</label>
                  <select
                    value={attSubject}
                    onChange={(e) => setAttSubject(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-blue-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="English Literature">English Literature</option>
                    <option value="History">History</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Attendance Date</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Roster: <strong className="text-slate-700">{activeClassStudents.length} Students</strong> registered in Class {attClass}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...attRecords };
                      activeClassStudents.forEach(st => {
                        updated[st.id] = { ...(updated[st.id] || { remarks: '' }), status: 'PRESENT' };
                      });
                      setAttRecords(updated);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 rounded-lg text-xs font-bold transition border border-emerald-100 cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...attRecords };
                      activeClassStudents.forEach(st => {
                        updated[st.id] = { ...(updated[st.id] || { remarks: '' }), status: 'ABSENT' };
                      });
                      setAttRecords(updated);
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-lg text-xs font-bold transition border border-rose-100 cursor-pointer"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Student Roll Call List */}
              <div className="space-y-3 font-sans">
                {activeClassStudents.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <p className="text-sm text-slate-500 italic">No students registered in the Class {attClass} Locker yet.</p>
                    <p className="text-[10px] text-slate-400">Head to Admin login to enroll/register students to this class grade.</p>
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {activeClassStudents.map((st) => {
                      const currentStatus = attRecords[st.id]?.status || 'PRESENT';
                      const currentRemarks = attRecords[st.id]?.remarks || '';

                      return (
                        <div key={st.id} className="p-4 bg-slate-50/15 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 tracking-tight">{st.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {st.studentIdCardNum} • seat: {st.seatNumber || 'Unassigned'}</p>
                          </div>

                          {/* Interactive Roster Selection Capsules */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAttRecords(prev => ({
                                  ...prev,
                                  [st.id]: { ...(prev[st.id] || { remarks: '' }), status: 'PRESENT' }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              } cursor-pointer`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAttRecords(prev => ({
                                  ...prev,
                                  [st.id]: { ...(prev[st.id] || { remarks: '' }), status: 'ABSENT' }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              } cursor-pointer`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAttRecords(prev => ({
                                  ...prev,
                                  [st.id]: { ...(prev[st.id] || { remarks: '' }), status: 'LATE' }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              } cursor-pointer`}
                            >
                              Late
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAttRecords(prev => ({
                                  ...prev,
                                  [st.id]: { ...(prev[st.id] || { remarks: '' }), status: 'EXCUSED' }
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                currentStatus === 'EXCUSED'
                                  ? 'bg-slate-500 border-slate-500 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              } cursor-pointer`}
                            >
                              Excused
                            </button>

                            {/* Remarks input inline */}
                            <input
                              type="text"
                              placeholder="Add remarks..."
                              value={currentRemarks}
                              onChange={(e) => {
                                setAttRecords(prev => ({
                                  ...prev,
                                  [st.id]: { ...(prev[st.id] || { status: 'PRESENT' }), remarks: e.target.value }
                                }));
                              }}
                              className="text-[11px] p-1.5 border border-slate-200 rounded-md focus:outline-blue-500 w-32 md:w-40 ml-1 font-sans bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Commit Roll Call trigger button */}
              {activeClassStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const formattedRecords = activeClassStudents.map(st => ({
                      studentId: st.id,
                      studentName: st.name,
                      status: attRecords[st.id]?.status || 'PRESENT',
                      remarks: attRecords[st.id]?.remarks || ''
                    }));
                    submitDailyAttendance({
                      classGrade: attClass,
                      subject: attSubject,
                      date: attDate,
                      records: formattedRecords
                    });
                    alert(`Roll Call Attendance details for Class ${attClass} on date ${attDate} successfully written & parents informed!`);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer uppercase tracking-wider font-mono"
                >
                  <Lock className="w-4 h-4" />
                  Lock & Submit Class {attClass} Roll Call
                </button>
              )}
            </div>

            {/* Turnout History of past locked dates */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Turnout Dashboard Logs
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Historical overview of daily turnout locked across courses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual statistics */}
                <div className="border border-slate-100 p-4.5 bg-slate-50/30 rounded-xl space-y-3 font-sans">
                  <h4 className="text-xs font-bold text-slate-650 tracking-wide uppercase font-mono text-slate-500">Global Attendance Overview</h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] text-emerald-700 block font-bold font-mono">PRESENT</span>
                      <strong className="text-lg text-emerald-900 font-black">
                        {attendance.filter(r => r.status === 'PRESENT').length}
                      </strong>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100/60 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] text-rose-700 block font-bold font-mono">ABSENT</span>
                      <strong className="text-lg text-rose-900 font-black">
                        {attendance.filter(r => r.status === 'ABSENT').length}
                      </strong>
                    </div>
                    <div className="bg-amber-50/50 border border-amber-100/60 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] text-amber-700 block font-bold font-mono">LATE</span>
                      <strong className="text-lg text-amber-950 font-black">
                        {attendance.filter(r => r.status === 'LATE').length}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Total Turnout entries cataloged: {attendance.length} items logged by school staff members.
                  </p>
                </div>

                {/* Chronicled Table */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/10 space-y-2 max-h-[290px] overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide font-mono pb-1 border-b border-slate-100">Live Turnout Chronicle</h4>
                  {attendance.length === 0 ? (
                    <p className="text-xs text-slate-400 italic font-mono pt-4 text-center">No logs generated.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {[...attendance].reverse().slice(0, 15).map(log => (
                        <div key={log.id} className="py-2 flex items-center justify-between text-[11px] font-sans">
                          <div>
                            <span className="font-bold text-slate-800">{log.studentName}</span>
                            <span className="text-slate-400 font-mono block text-[9.5px]">
                              {log.date} • {log.subject} ({log.classGrade})
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] font-mono ${
                            log.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : log.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : log.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Assigned Timetable view */}
        {activeSubTab === 'timetable' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans pb-1">
                <Calendar className="w-5 h-5 text-blue-600" />
                My Weekly Lecture Schedule
              </h2>
              <p className="text-xs text-slate-400 font-sans">View your assigned teaching sessions, active classes, and period intervals structured by administration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                const slots = timetables.filter(t => t.teacherName?.toLowerCase() === currentUser?.name?.toLowerCase() && t.day === dayName);
                return (
                  <div key={dayName} className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/20 space-y-3 font-sans">
                    <h3 className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-100 py-1 px-2.5 rounded w-fit font-mono">
                      {dayName}
                    </h3>

                    {slots.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2 pl-1">No teaching slots structured for {dayName}.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {slots.map(slot => (
                          <div key={slot.id} className="py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{slot.subject}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.timeSlot}</p>
                            </div>
                            <span className="text-[10.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-black font-mono">
                              Class {slot.classGrade}
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

      </motion.div>
    </div>
  );
}
