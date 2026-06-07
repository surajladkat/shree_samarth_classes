/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ClassGrade } from '../../types';
import { motion } from 'motion/react';
import { 
  Shield, 
  UserPlus, 
  BarChart2, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Key, 
  DollarSign, 
  CreditCard, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Search,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  X
} from 'lucide-react';

const FEE_MAP: Record<ClassGrade, number> = {
  '9th': 15000,
  '10th': 18000,
  '11th': 22000,
  '12th': 25000,
  'Library': 5000
};

export default function AdminDashboard() {
  const { 
    students, 
    teachers, 
    parents, 
    activityLogs,
    timetables,
    registerStudentWithParent,
    registerTeacher,
    updateStudentFee,
    addTimetableEntry,
    deleteTimetableEntry,
    deleteStudent,
    deleteTeacher
  } = useSchool();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'onboarding' | 'fees' | 'logs' | 'timetable'>('analytics');
  
  // Modals for Registry lists
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [showTeacherListModal, setShowTeacherListModal] = useState(false);
  const [studentSearchText, setStudentSearchText] = useState('');
  const [teacherSearchText, setTeacherSearchText] = useState('');

  // Confirmation states for delete actions
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);
  const [confirmDeleteTeacherId, setConfirmDeleteTeacherId] = useState<string | null>(null);

  // Timetable Form States
  const [ttClassGrade, setTtClassGrade] = useState<ClassGrade>('9th');
  const [ttDay, setTtDay] = useState<string>('Monday');
  const [ttTimeSlot, setTtTimeSlot] = useState<string>('09:00 AM - 10:00 AM');
  const [ttSubject, setTtSubject] = useState<string>('');
  const [ttTeacher, setTtTeacher] = useState<string>('');
  
  // Onboarding Sub-Tab
  const [onboardRole, setOnboardRole] = useState<'student' | 'teacher'>('student');

  // Student Onboarding States
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState<ClassGrade>('9th');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [customTotalFee, setCustomTotalFee] = useState<number>(15000);
  const [initialPaid, setInitialPaid] = useState<number>(0);
  const [seatNumber, setSeatNumber] = useState('');
  const [benchNumber, setBenchNumber] = useState('');

  // Sync default fee when grade changes
  useEffect(() => {
    setCustomTotalFee(FEE_MAP[classGrade]);
  }, [classGrade]);

  // Teacher Onboarding States
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherGrades, setTeacherGrades] = useState<ClassGrade[]>(['9th']);

  // Shared Credential Modal State
  const [credentials, setCredentials] = useState<{
    type: 'student' | 'teacher';
    studentName?: string;
    parentName?: string;
    sLogin?: string;
    sPass?: string;
    pLogin?: string;
    pPass?: string;
    teacherName?: string;
    tLogin?: string;
    tPass?: string;
    subject?: string;
  } | null>(null);

  // Fee Ledger Filter States
  const [feeSearch, setFeeSearch] = useState('');
  const [feeGradeFilter, setFeeGradeFilter] = useState<'ALL' | ClassGrade>('ALL');
  
  // Inline Pay State
  const [payingStudentId, setPayingStudentId] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');

  // Logging states
  const [logSearch, setLogSearch] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !parentPhone.trim()) return;

    const result = registerStudentWithParent({
      studentName: studentName.trim(),
      classGrade,
      parentName: parentName.trim(),
      parentRelation: relationship,
      parentPhone: parentPhone.trim(),
      totalFee: Number(customTotalFee) || 15000,
      paidFee: Number(initialPaid) || 0,
      seatNumber: classGrade === 'Library' ? seatNumber.trim() : undefined,
      benchNumber: classGrade === 'Library' ? benchNumber.trim() : undefined
    });

    setCredentials({
      type: 'student',
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      sLogin: result.studentLogin,
      sPass: result.studentPass,
      pLogin: result.parentLogin,
      pPass: result.parentPass
    });

    // Reset values
    setStudentName('');
    setParentName('');
    setParentPhone('');
    setInitialPaid(0);
    setSeatNumber('');
    setBenchNumber('');
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNameInput.trim() || !teacherSubject.trim()) return;

    const result = registerTeacher({
      name: teacherNameInput.trim(),
      subjects: [teacherSubject.trim()],
      classes: teacherGrades
    });

    setCredentials({
      type: 'teacher',
      teacherName: teacherNameInput.trim(),
      subject: teacherSubject.trim(),
      tLogin: result.teacherLogin,
      tPass: result.teacherPass
    });

    // Reset fields
    setTeacherNameInput('');
    setTeacherSubject('');
    setTeacherGrades(['9th']);
  };

  const handleGradeToggle = (grade: ClassGrade) => {
    if (teacherGrades.includes(grade)) {
      if (teacherGrades.length > 1) {
        setTeacherGrades(prev => prev.filter(g => g !== grade));
      }
    } else {
      setTeacherGrades(prev => [...prev, grade]);
    }
  };

  const handleRecordPaymentSubmit = (studentId: string) => {
    const amount = Number(payAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    updateStudentFee(studentId, amount);
    setPayingStudentId(null);
    setPayAmountInput('');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Finance analytics parameters
  const totalProjected = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  const totalCollections = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
  const totalOutstanding = students.reduce((acc, s) => acc + (s.pendingFee || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1 font-sans">
      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] col-span-1 h-fit space-y-2"
      >
        <div className="px-3 py-2 mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs tracking-wider uppercase font-mono">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin Control
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Academy Management</p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'analytics' 
              ? 'bg-indigo-50 text-indigo-850 border-l-2 border-indigo-600 pl-3.5' 
              : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          Academy Analytics
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('onboarding')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'onboarding' 
              ? 'bg-emerald-50 text-emerald-850 border-l-2 border-emerald-600 pl-3.5' 
              : 'text-slate-650 text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-500" />
          Staff & Student Admissions
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('fees')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'fees' 
              ? 'bg-amber-50 text-amber-850 border-l-2 border-amber-600 pl-3.5' 
              : 'text-slate-650 text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-550" />
          Fee Ledger & Structure
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('logs')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'logs' 
              ? 'bg-rose-50 text-rose-850 border-l-2 border-rose-600 pl-3.5' 
              : 'text-slate-655 text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" />
          System Log ({activityLogs.length})
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('timetable')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'timetable' 
              ? 'bg-sky-50 text-sky-850 border-l-2 border-sky-600 pl-3.5' 
              : 'text-slate-655 text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-500" />
          Class Timetables
        </motion.button>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="lg:col-span-3 space-y-6 text-left"
      >
        
        {/* Dynamic Totals Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setShowStudentListModal(true)}
            className="group relative bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-[10px] text-blue-650 font-black uppercase tracking-wider font-mono text-blue-600 block">Total Students</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">{students.length}</span>
              <span className="text-[9px] bg-blue-100/60 text-blue-700 px-2 py-0.5 rounded font-black font-mono shadow-3xs">View Registry</span>
            </div>
          </div>

          <div 
            onClick={() => setShowTeacherListModal(true)}
            className="group relative bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-[10px] text-emerald-650 font-black uppercase tracking-wider font-mono text-emerald-750 block">Faculty & Staff</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-slate-800 group-hover:text-emerald-750 transition-colors">{teachers.length}</span>
              <span className="text-[9px] bg-emerald-100/60 text-emerald-800 px-2 py-0.5 rounded font-black font-mono shadow-3xs">View Faculty</span>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-8 -mt-8" />
            <p className="text-[10px] text-teal-650 font-black uppercase tracking-wider font-mono text-teal-600 block">Total Collected Fees</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-teal-600">₹{totalCollections}</span>
              <span className="text-[9.5px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-extrabold font-mono border border-teal-100">Received</span>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs overflow-hidden col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8" />
            <p className="text-[10px] text-rose-650 font-black uppercase tracking-wider font-mono text-rose-600 block">Outstanding Balances</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-rose-600">₹{totalOutstanding}</span>
              <span className="text-[9.5px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-extrabold font-mono border border-rose-100">Due Amount</span>
            </div>
          </div>
        </div>

        {/* 1. ANALYTICS TABLE OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Enrollment Metrics & Fees Collection
              </h2>
              <p className="text-xs text-slate-400 mt-1">Overall view of enrollment distributions and class tuition metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              {/* Classroom population bar list */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" /> Student Distribution
                </p>
                <div className="space-y-3 pt-2">
                  {(['9th', '10th', '11th', '12th', 'Library'] as ClassGrade[]).map(grade => {
                    const count = students.filter(s => s.classGrade === grade).length;
                    const pct = students.length ? Math.round((count / students.length) * 100) : 0;
                    return (
                      <div key={grade} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{grade === 'Library' ? 'Library Students' : `Class ${grade} Course`}</span>
                          <span className="font-mono text-slate-500 font-bold">{count} Enrolled ({pct}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${pct || 4}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outstanding vs Collected bento */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Budget Collections
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Total expected fee collections stand at <strong className="text-slate-800">₹{totalProjected}</strong>. 
                    Currently, <strong>{Math.round((totalCollections / (totalProjected || 1)) * 100)}%</strong> of tuition invoices have been finalized and cleared by guardians.
                  </p>
                </div>
                
                {/* SVG Visual Progress Bar */}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-xs text-slate-400 font-medium">Payment Performance Indicator</span>
                    <span className="text-sm font-extrabold text-emerald-600">{Math.round((totalCollections / (totalProjected || 1)) * 100)}% Collected</span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-lg flex overflow-hidden border border-slate-200 font-mono text-[9px] text-white">
                    <div 
                      className="bg-emerald-500 h-full flex items-center justify-center font-bold" 
                      style={{ width: `${(totalCollections / (totalProjected || 1)) * 100}%` }}
                    >
                      {totalCollections > 0 && `₹${totalCollections}`}
                    </div>
                    <div 
                      className="bg-red-200 text-red-800 h-full flex items-center justify-center font-bold" 
                      style={{ width: `${(totalOutstanding / (totalProjected || 1)) * 105}%` }}
                    >
                      {totalOutstanding > 0 && `₹${totalOutstanding}`}
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end text-[9px] font-mono font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Collected</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-200 rounded" /> Outstanding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academy Directories */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">Teachers & Active Subjects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-600">
                {teachers.map(t => (
                  <div key={t.id} className="border border-slate-205 p-3 rounded-xl bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-800">{t.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Classes assigned: {t.classes.join(', ')}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg border border-blue-100">
                      {t.subjects[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ONBOARDING & ENROLLMENT PORTAL */}
        {activeTab === 'onboarding' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            
            {/* Header and Pill Toggle for student vs teacher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Academy Onboarding & Access Portal
                </h2>
                <p className="text-xs text-slate-400 mt-1">Enroll regular students (generates paired parent details) or register teaching staff.</p>
              </div>

              {/* Inline Pills */}
              <div className="flex bg-slate-100 p-1 rounded-lg w-fit text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setOnboardRole('student'); setCredentials(null); }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${onboardRole === 'student' ? 'bg-white text-slate-800 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Student Admission
                </button>
                <button
                  type="button"
                  onClick={() => { setOnboardRole('teacher'); setCredentials(null); }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${onboardRole === 'teacher' ? 'bg-white text-slate-800 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Faculty Registration
                </button>
              </div>
            </div>

            {/* Generated Credentials Output Panel */}
            {credentials && (
              <div className="bg-blue-50/45 border border-blue-200 rounded-xl p-5 space-y-4 font-normal">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> Official Login ID Generated Successfully
                  </h3>
                  <button 
                    onClick={() => setCredentials(null)}
                    className="text-[11px] text-blue-700 font-bold bg-white px-3 py-1 rounded-lg border border-blue-150 hover:bg-slate-50 cursor-pointer shadow-xs font-sans"
                  >
                    Onboard Another Account
                  </button>
                </div>

                {credentials.type === 'student' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Student details card */}
                    <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3 text-xs">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-mono font-bold">STUDENT</span>
                        {credentials.studentName}
                      </p>
                      <div className="border-t border-slate-50 pt-2 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Assigned Folder</span>
                          <span className="font-bold text-slate-700">{classGrade} Grade</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                          <span className="text-slate-500 font-semibold">Login ID (Username)</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-[11px] text-blue-900 border border-slate-200 font-bold flex items-center gap-2">
                            {credentials.sLogin}
                            <button onClick={() => credentials.sLogin && copyText(credentials.sLogin)} className="text-slate-400 hover:text-blue-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                          <span className="text-slate-500 font-semibold">Standard Password</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-[11px] text-blue-900 border border-slate-200 font-bold flex items-center gap-2">
                            {credentials.sPass}
                            <button onClick={() => credentials.sPass && copyText(credentials.sPass)} className="text-slate-400 hover:text-blue-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Parent details card */}
                    <div className="bg-white p-4 rounded-lg border border-blue-100 space-y-3 text-xs">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-mono font-bold">PARENT</span>
                        {credentials.parentName}
                      </p>
                      <div className="border-t border-slate-50 pt-2 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Relation</span>
                          <span className="font-bold text-slate-700">{relationship}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                          <span className="text-slate-500 font-semibold">Login ID (Username)</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-[11px] text-amber-900 border border-slate-200 font-bold flex items-center gap-2">
                            {credentials.pLogin}
                            <button onClick={() => credentials.pLogin && copyText(credentials.pLogin)} className="text-slate-400 hover:text-amber-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                          <span className="text-slate-500 font-semibold">Standard Password</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-[11px] text-amber-900 border border-slate-200 font-bold flex items-center gap-2">
                            {credentials.pPass}
                            <button onClick={() => credentials.pPass && copyText(credentials.pPass)} className="text-slate-400 hover:text-amber-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Teacher details card
                  <div className="bg-white p-5 rounded-lg border border-blue-100 space-y-3.5 text-xs max-w-xl">
                    <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-805 text-emerald-700 rounded text-[9px] font-mono font-bold">TEACHING FACULTY</span>
                      {credentials.teacherName}
                    </p>
                    <div className="border-t border-slate-50 pt-2.5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-sans">Primary Subject</span>
                        <span className="font-bold text-slate-700">{credentials.subject}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-sans">Classes assigned folder</span>
                        <span className="font-bold text-slate-700">{teacherGrades.join(', ')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-slate-50 p-2.5 rounded">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Generated ID Username</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-blue-900 font-bold">{credentials.tLogin}</span>
                            <button onClick={() => credentials.tLogin && copyText(credentials.tLogin)} className="text-slate-400 hover:text-blue-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Generated Default Password</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-blue-900 font-bold">{credentials.tPass}</span>
                            <button onClick={() => credentials.tPass && copyText(credentials.tPass)} className="text-slate-400 hover:text-blue-650 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-[10px] italic text-slate-400 font-sans border-t border-blue-100 pt-2.5">
                  🛡️ Give these credentials to the staff or parent. They can log in immediately from the home screen using this specific ID.
                </div>
              </div>
            )}

            {/* Student Admission Form */}
            {onboardRole === 'student' && !credentials && (
              <form onSubmit={handleStudentSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left part: Student values */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3.5 bg-slate-50/20">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" /> Student Profile
                    </p>

                    <div className="space-y-1 text-xs">
                      <label className="text-slate-500 font-medium font-sans">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jack Mitchell"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        className="w-full text-xs font-sans border border-slate-220 border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-slate-500 font-medium font-sans">Class Level</label>
                      <select
                        value={classGrade}
                        onChange={e => setClassGrade(e.target.value as ClassGrade)}
                        className="w-full text-xs font-sans border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                      >
                        <option value="9th">Class 9th Grade</option>
                        <option value="10th">Class 10th Grade</option>
                        <option value="11th">Class 11th Grade</option>
                        <option value="12th">Class 12th Grade</option>
                        <option value="Library">Library Student</option>
                      </select>
                    </div>

                    {classGrade === 'Library' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-xs">
                          <label className="text-slate-500 font-semibold font-sans text-[11px] text-blue-700">Seat Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Seat-24"
                            value={seatNumber}
                            onChange={e => setSeatNumber(e.target.value)}
                            className="w-full text-xs font-sans border border-blue-200 rounded-lg p-2 bg-blue-50/20 focus:outline-blue-500"
                          />
                        </div>

                        <div className="space-y-1 text-xs">
                          <label className="text-slate-500 font-semibold font-sans text-[11px] text-blue-700">Bench Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Bench-E2"
                            value={benchNumber}
                            onChange={e => setBenchNumber(e.target.value)}
                            className="w-full text-xs font-sans border border-blue-200 rounded-lg p-2 bg-blue-50/20 focus:outline-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-xs">
                        <label className="text-slate-500 font-medium font-sans text-[11px]">Tuition Fee (₹)</label>
                        <input
                          type="number"
                          required
                          value={customTotalFee}
                          onChange={e => setCustomTotalFee(Math.max(0, Number(e.target.value)))}
                          className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 mt-0.5 bg-white focus:outline-blue-500"
                        />
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-slate-500 font-medium font-sans text-[11px]">Paid to Date (₹)</label>
                        <input
                          type="number"
                          required
                          value={initialPaid}
                          onChange={e => setInitialPaid(Math.max(0, Number(e.target.value)))}
                          className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 mt-0.5 bg-white focus:outline-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right part: Parent values */}
                  <div className="border border-slate-200 p-4 rounded-xl space-y-3.5 bg-slate-50/20">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" /> Paired Custodian Account
                    </p>

                    <div className="space-y-1 text-xs">
                      <label className="text-slate-500 font-medium font-sans">Parent/Guardian Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Richard Mitchell"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        className="w-full text-xs font-sans border border-slate-220 border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-slate-500 font-medium font-sans">Relationship Type</label>
                      <select
                        value={relationship}
                        onChange={e => setRelationship(e.target.value)}
                        className="w-full text-xs font-sans border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-slate-500 font-semibold font-sans text-blue-700">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={parentPhone}
                        onChange={e => setParentPhone(e.target.value)}
                        className="w-full text-xs font-sans border border-blue-200 rounded-lg p-2.5 bg-blue-50/10 focus:outline-blue-500"
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2">
                      💡 Paired accounts share a synchronized ledger. Students submit tasks, and parents can monitor pending tuition and chat with faculty.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-2 select-none shadow-xs"
                >
                  <UserPlus className="w-4 h-4" /> Enrol Student & Link Parent Account
                </button>
              </form>
            )}

            {/* Teacher Enrollment Form */}
            {onboardRole === 'teacher' && !credentials && (
              <form onSubmit={handleTeacherSubmit} className="space-y-5 max-w-2xl">
                <div className="border border-slate-200 p-5 rounded-xl space-y-4 bg-slate-50/20">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" /> Faculty Specifications
                  </p>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-500 font-medium font-sans">Faculty Member Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Professor Charles Thomas"
                      value={teacherNameInput}
                      onChange={e => setTeacherNameInput(e.target.value)}
                      className="w-full text-xs font-sans border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-550 focus:outline-blue-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-500 font-medium font-sans">Primary Subject/Course Assigned</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics, Chemistry, English Literature"
                      value={teacherSubject}
                      onChange={e => setTeacherSubject(e.target.value)}
                      className="w-full text-xs font-sans border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-550 focus:outline-blue-500"
                    />
                  </div>

                  {/* Multiselect Class Grades Assigned */}
                  <div className="space-y-2 text-xs">
                    <label className="text-slate-500 font-semibold font-sans block">Classes Authorized to Teach</label>
                    <div className="flex gap-2 pt-1 font-mono text-[11px]">
                      {(['9th', '10th', '11th', '12th'] as ClassGrade[]).map(grade => {
                        const isSelected = teacherGrades.includes(grade);
                        return (
                          <button
                            type="button"
                            key={grade}
                            onClick={() => handleGradeToggle(grade)}
                            className={`px-3 py-2 rounded-lg cursor-pointer border text-center transition ${
                              isSelected 
                                ? 'bg-blue-600 text-white font-bold border-blue-650' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                            }`}
                          >
                            Class {grade}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-sans">Select at least one class grade.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-605 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-2 select-none shadow-xs"
                >
                  <UserPlus className="w-4 h-4" /> Register Teacher Profile & Set Specific Login ID
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. FEE STRUCTURE & INLINE LEDGER */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Tuition Fee ledger & Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure structural class policies, view details of pending accounts, and collect payments.</p>
              </div>

              {/* Class policy labels */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold text-slate-500">
                <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded">Class 9: ₹15,000</span>
                <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded">Class 10: ₹18,000</span>
                <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded">Class 11: ₹22,000</span>
                <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded">Class 12: ₹25,000</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-155 rounded">Library Student: ₹5,000</span>
              </div>
            </div>

            {/* Quick summary and ledger tools */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
              {/* Ledger search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search student or username..."
                  value={feeSearch}
                  onChange={e => setFeeSearch(e.target.value)}
                  className="w-full text-xs font-sans pl-8.5 pl-8 pr-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-blue-550 text-slate-700"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5 text-xs font-semibold self-end sm:self-auto uppercase tracking-wide">
                <span className="text-slate-400 font-mono text-[10px]">Filter Grade:</span>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-mono">
                  {(['ALL', '9th', '10th', '11th', '12th', 'Library'] as const).map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFeeGradeFilter(f)}
                      className={`px-2 py-1 rounded-md transition duration-100 cursor-pointer ${feeGradeFilter === f ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-505 text-slate-500 hover:text-slate-700'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Ledger List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs text-slate-500">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right">Tuition Fee</th>
                    <th className="py-3 px-4 text-right text-emerald-700">Paid to Date</th>
                    <th className="py-3 px-4 text-right text-red-650 text-red-600">Pending Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-755 text-slate-700">
                  {students
                    .filter(s => {
                      const matchesSearch = s.name.toLowerCase().includes(feeSearch.toLowerCase()) || 
                                            s.username.toLowerCase().includes(feeSearch.toLowerCase());
                      const matchesGrade = feeGradeFilter === 'ALL' || s.classGrade === feeGradeFilter;
                      return matchesSearch && matchesGrade;
                    })
                    .map(s => {
                      const isPaying = payingStudentId === s.id;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/10 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-850 text-slate-800">
                            <div>
                              <span>{s.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono font-normal mt-0.5">Login ID: {s.username}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-600 font-sans">{s.classGrade}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600">₹{s.totalFee || 15000}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-semibold">₹{s.paidFee || 0}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-700 font-semibold">
                            <span className={s.pendingFee > 0 ? "text-red-650 text-red-600 font-semibold" : "text-emerald-700 font-semibold"}>
                              ₹{s.pendingFee || 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                              s.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              s.paymentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {s.paymentStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {isPaying ? (
                              <div className="flex items-center gap-1.5 justify-end font-sans">
                                <input
                                  type="number"
                                  autoFocus
                                  placeholder="Amount (₹)"
                                  value={payAmountInput}
                                  onChange={e => setPayAmountInput(e.target.value)}
                                  className="border border-slate-300 rounded font-mono text-xs w-24 px-2 py-1 focus:outline-blue-500 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRecordPaymentSubmit(s.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPayingStudentId(null)}
                                  className="text-[11px] text-slate-400 font-semibold bg-slate-100 hover:bg-slate-200 px-1 py-1 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              s.pendingFee > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayingStudentId(s.id);
                                    setPayAmountInput(s.pendingFee.toString());
                                  }}
                                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 font-extrabold text-blue-700 rounded-lg text-[11px] cursor-pointer"
                                >
                                  Collect Fees
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-medium italic">Fully Settled</span>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. AUDIT LOG */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Academy Audits & Transactions Log
                </h2>
                <p className="text-xs text-slate-400 mt-1">Verified audit records containing administrator admissions, fee receipts, and faculty additions.</p>
              </div>

              <input
                type="text"
                placeholder="Search audit actions..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="text-xs font-sans w-56 border border-slate-200 rounded-lg py-2 px-3 focus:outline-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Table layout */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left text-slate-500 border-collapse">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-200 font-mono font-bold">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Operation Verified</th>
                    <th className="py-3 px-4 text-right font-mono">IP Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activityLogs
                    .filter(log => 
                      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.userName.toLowerCase().includes(logSearch.toLowerCase())
                    )
                    .slice(0, 15)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {log.userName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${
                            log.userRole === 'ADMIN' ? 'bg-slate-100 text-slate-700' :
                            log.userRole === 'TEACHER' ? 'bg-blue-50 text-blue-700' :
                            log.userRole === 'STUDENT' ? 'bg-slate-50 text-slate-600' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {log.userRole}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CLASS TIMETABLE MANAGER */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Class Timetable Scheduler
              </h2>
              <p className="text-xs text-slate-400 mt-1">Assign weekly classroom schedules, subject slot durations, and instructor links.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Creator Form */}
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Create Schedule Slot</h3>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ttSubject.trim() || !ttTeacher) {
                      alert("Please fill in the subject and select a teacher.");
                      return;
                    }
                    addTimetableEntry({
                      classGrade: ttClassGrade,
                      day: ttDay,
                      timeSlot: ttTimeSlot,
                      subject: ttSubject.trim(),
                      teacherName: ttTeacher
                    });
                    setTtSubject('');
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Class Division</label>
                    <select
                      value={ttClassGrade}
                      onChange={e => setTtClassGrade(e.target.value as ClassGrade)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                    >
                      <option value="9th">9th Standard</option>
                      <option value="10th">10th Standard</option>
                      <option value="11th">11th Standard</option>
                      <option value="12th">12th Standard</option>
                      <option value="Library">Library Sessions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Day of Week</label>
                    <select
                      value={ttDay}
                      onChange={e => setTtDay(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Time Period Slot</label>
                    <select
                      value={ttTimeSlot}
                      onChange={e => setTtTimeSlot(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:15 AM - 11:15 AM">10:15 AM - 11:15 AM</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                      <option value="01:30 PM - 02:30 PM">01:30 PM - 02:30 PM</option>
                      <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Subject Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Chemistry"
                      value={ttSubject}
                      onChange={e => setTtSubject(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tutoring Faculty Instructor</label>
                    <select
                      value={ttTeacher}
                      onChange={e => setTtTeacher(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-blue-500"
                    >
                      <option value="">-- Click to Select Roster Teacher --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.subjects.join(', ')})</option>
                      ))}
                      <option value="Guest Lecturer">Guest Lecturer</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex justify-center items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Publish Classroom Slot
                  </button>
                </form>
              </div>

              {/* Schedules View */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-slate-50 p-2 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold ml-2 font-mono">Select Active Class Division for Filter:</span>
                  <select
                    value={ttClassGrade}
                    onChange={e => setTtClassGrade(e.target.value as ClassGrade)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-blue-500 font-bold text-blue-700"
                  >
                    <option value="9th">Class 9th Schedules</option>
                    <option value="10th">Class 10th Schedules</option>
                    <option value="11th">Class 11th Schedules</option>
                    <option value="12th">Class 12th Schedules</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => {
                    const slots = timetables.filter(t => t.classGrade === ttClassGrade && t.day === dayName);
                    return (
                      <div key={dayName} className="border border-slate-100 rounded-xl p-4 bg-white shadow-xs space-y-2">
                        <h4 className="text-xs font-extrabold text-slate-850 text-slate-800 bg-slate-50 border border-slate-100 py-1 px-2.5 rounded w-fit font-mono">
                          {dayName}
                        </h4>

                        {slots.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic py-2 pl-2">No tuition sessions structured for {dayName} yet.</p>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {slots.map(slot => (
                              <div key={slot.id} className="py-2.5 flex justify-between items-center group font-sans">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-800">{slot.subject}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({slot.timeSlot})</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span className="font-semibold text-blue-700">{slot.teacherName}</span> • Tutor linked
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteTimetableEntry(slot.id)}
                                  className="p-1.5 hover:bg-red-50 text-slate-450 hover:text-red-500 rounded transition cursor-pointer text-[10px] font-bold font-mono"
                                >
                                  Cancel Slot
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* OVERLAY MODALS FOR REGISTRY DIRECTORIES */}
      {showStudentListModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> Student Directory Registry
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive real-time student log containing student credentials and outstanding fee metrics.</p>
              </div>
              <button 
                onClick={() => setShowStudentListModal(false)}
                className="p-1 px-2.5 rounded bg-slate-100 hover:bg-slate-250 text-slate-650 hover:bg-slate-200 text-xs transition cursor-pointer font-bold"
              >
                Close [X]
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Search students by name, card number or Class grade..."
                  value={studentSearchText}
                  onChange={e => setStudentSearchText(e.target.value)}
                  className="w-full text-xs font-sans pl-9 border border-slate-200 rounded-lg py-2 px-3 focus:outline-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-white">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left text-slate-500 border-collapse">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-200 font-mono font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Student Details</th>
                      <th className="py-2.5 px-3">Parent Details</th>
                      <th className="py-2.5 px-3">Class Grade</th>
                      <th className="py-2.5 px-3">Login Credentials Info</th>
                      <th className="py-2.5 px-3">Total Fee</th>
                      <th className="py-2.5 px-3">Paid Fee</th>
                      <th className="py-2.5 px-3">Pending Fee</th>
                      <th className="py-2.5 px-3">Fee Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {students
                      .filter(s => 
                        s.name.toLowerCase().includes(studentSearchText.toLowerCase()) ||
                        s.classGrade.toLowerCase().includes(studentSearchText.toLowerCase()) ||
                        s.studentIdCardNum.toLowerCase().includes(studentSearchText.toLowerCase()) ||
                        s.username.toLowerCase().includes(studentSearchText.toLowerCase())
                      )
                      .map(s => {
                        const linkedParent = parents.find(p => p.childId === s.id);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{s.studentIdCardNum}</p>
                              {(s.seatNumber || s.benchNumber) && (
                                <div className="mt-1 flex gap-1.5 text-[9px] font-mono leading-relaxed">
                                  {s.seatNumber && <span className="bg-blue-50 text-blue-700 border border-blue-105 px-1.5 py-0.2 rounded">Seat: {s.seatNumber}</span>}
                                  {s.benchNumber && <span className="bg-purple-50 text-purple-700 border border-purple-105 px-1.5 py-0.2 rounded">Bench: {s.benchNumber}</span>}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              {linkedParent ? (
                                <div>
                                  <p className="font-bold text-slate-700">{linkedParent.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{linkedParent.relationship} • {linkedParent.mobileNumber}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[10px]">No linked parent</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                              Class {s.classGrade}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap bg-blue-50/30">
                              <div className="flex flex-col text-[10px] space-y-0.5">
                                <span className="font-semibold text-slate-700">Login ID: <span className="font-bold text-blue-750 font-sans text-blue-700">{s.username}</span></span>
                                <span className="text-slate-500 font-mono">Password: <span className="font-bold text-slate-700">{s.username}123</span></span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">₹{s.totalFee}</td>
                            <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">₹{s.paidFee}</td>
                            <td className="py-2.5 px-3 font-mono text-red-650 text-red-600 font-bold">₹{s.pendingFee}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-mono tracking-wide border ${
                                s.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                s.paymentStatus === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {s.paymentStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {confirmDeleteStudentId === s.id ? (
                                <div className="flex items-center gap-1.5 justify-center">
                                  <button
                                    onClick={() => {
                                      deleteStudent(s.id);
                                      setConfirmDeleteStudentId(null);
                                    }}
                                    className="px-2 py-1 bg-red-650 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteStudentId(null)}
                                    className="px-2 py-1 bg-slate-250 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteStudentId(s.id)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTeacherListModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" /> Faculty & Staff Registry
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive real-time teacher roster containing access IDs and tutoring subject specializations.</p>
              </div>
              <button 
                onClick={() => setShowTeacherListModal(false)}
                className="p-1 px-2.5 rounded bg-slate-100 hover:bg-slate-250 text-slate-650 hover:bg-slate-200 text-xs transition cursor-pointer font-bold"
              >
                Close [X]
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Search teachers by name or subject specialty..."
                  value={teacherSearchText}
                  onChange={e => setTeacherSearchText(e.target.value)}
                  className="w-full text-xs font-sans pl-9 border border-slate-200 rounded-lg py-2 px-3 focus:outline-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-white">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left text-slate-500 border-collapse">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 border-b border-slate-200 font-mono font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Faculty Name</th>
                      <th className="py-2.5 px-3">Subjects Taught</th>
                      <th className="py-2.5 px-3">Assigned Classes</th>
                      <th className="py-2.5 px-3">Login Credentials Info</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {teachers
                      .filter(t => 
                        t.name.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
                        t.subjects.some(subj => subj.toLowerCase().includes(teacherSearchText.toLowerCase()))
                      )
                      .map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {t.name}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {t.subjects.map(sub => (
                                <span key={sub} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {t.classes.map(cl => (
                                <span key={cl} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-mono">
                                  Class {cl}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap bg-emerald-50/30">
                            <div className="flex flex-col text-[10px] space-y-0.5">
                              <span className="font-semibold text-slate-700">Login ID: <span className="font-bold text-emerald-800 font-sans">{t.username}</span></span>
                              <span className="text-slate-500 font-mono">Password: <span className="font-bold text-slate-700">{t.username}123</span></span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {confirmDeleteTeacherId === t.id ? (
                              <div className="flex items-center gap-1.5 justify-center">
                                <button
                                  onClick={() => {
                                    deleteTeacher(t.id);
                                    setConfirmDeleteTeacherId(null);
                                  }}
                                  className="px-2 py-1 bg-red-650 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 transition cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteTeacherId(null)}
                                  className="px-2 py-1 bg-slate-250 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold hover:bg-slate-300 transition cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteTeacherId(t.id)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                                title="Delete Faculty Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
