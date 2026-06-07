/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { decryptData } from '../../cryptoUtils';
import { Lock, Unlock, Mail, Compass, HelpCircle, Send, Award, Link2, BookOpen, AlertCircle, Clock, CheckCircle2, Users } from 'lucide-react';
import FacultyDirectory from '../shared/FacultyDirectory';
import { motion } from 'motion/react';

export default function ParentDashboard() {
  const {
    currentUser,
    students,
    teachers,
    assignments,
    submissions,
    messages,
    attendance,
    sendMessage,
    getParentChild,
    getStudentParent,
    // Access context and support updating student-parent links
    registerStudentWithParent
  } = useSchool();

  const parent = currentUser as any;
  const child = getParentChild(parent.id);

  const [activeTab, setActiveTab] = useState<'child-desk' | 'teacher-chat' | 'faculty-directory' | 'account'>('child-desk');

  // Manual linking state if child isn't linked yet
  const [targetStudentId, setTargetStudentId] = useState('');
  const [customRelation, setCustomRelation] = useState('Father');

  // Interactive local message state
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [chatText, setChatText] = useState('');

  // Handle send message to teacher
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !chatText.trim()) return;

    sendMessage(selectedTeacherId, chatText);
    setChatText('');
  };

  // Messages filtered for current parent
  const parentMessages = messages
    .filter(m => (m.senderId === parent.id || m.receiverId === parent.id))
    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Filter Child's assignments & submissions
  const childAssignments = child ? assignments.filter(a => a.classGrade === child.classGrade) : [];
  const childSubmissions = child ? submissions.filter(s => s.studentId === child.id) : [];

  const getChildSubmission = (asgId: string) => {
    return childSubmissions.find(s => s.assignmentId === asgId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1">
      
      {/* Parent Sidebar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm col-span-1 h-fit space-y-4 font-sans">
        <div className="border-b border-slate-100 pb-4">
          <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase font-mono">Parent Custodian</p>
          <p className="text-sm font-extrabold text-slate-850 mt-0.5">{parent?.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">Relation: {parent?.relationship}</p>
          
          {child ? (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-1">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 font-mono" /> Linked Child
              </p>
              <p className="text-xs font-bold text-slate-800">{child.name}</p>
              <p className="text-[10px] text-emerald-700 font-bold font-mono">Class {child.classGrade} Folder Portal</p>
              {(child.seatNumber || child.benchNumber) && (
                <div className="mt-1.5 pt-1 border-t border-emerald-200/40 flex flex-wrap gap-1 text-[9px] font-mono leading-tight">
                  {child.seatNumber && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold border border-emerald-200/50">Seat: {child.seatNumber}</span>}
                  {child.benchNumber && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-extrabold border border-purple-200/50 font-semibold">Bench: {child.benchNumber}</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-lg">
              <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Profile Unlinked
              </span>
              <p className="text-xs text-slate-500 mt-1 leading-normal font-sans">Link your child profile inside the settings tab to begin monitoring.</p>
            </div>
          )}
        </div>

        {/* Menu selections */}
        <div className="space-y-1 pt-1">
          <button 
            onClick={() => setActiveTab('child-desk')}
            disabled={!child}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              !child ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'child-desk' 
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-600" />
            Child's Academic Desk
          </button>

          <button 
            onClick={() => setActiveTab('teacher-chat')}
            disabled={!child}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              !child ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'teacher-chat' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            Contact Teachers
          </button>

          <button 
            onClick={() => setActiveTab('faculty-directory')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              activeTab === 'faculty-directory' 
                ? 'bg-indigo-50 text-indigo-850 border border-indigo-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            Faculty Directory
          </button>

          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              activeTab === 'account' 
                ? 'bg-amber-50 text-amber-850 border border-amber-200 shadow-3xs' 
                : 'text-slate-650 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Link2 className="w-4 h-4 text-amber-600" />
            Custodian Link Center
          </button>
        </div>

        {/* Child Fee Balance Widget for Parent */}
        {child && (
          <div className="border-t border-slate-100 pt-4 space-y-3 font-sans">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Child Tuition Account</p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-sans">Annual Tuition Fee</span>
                <span className="font-extrabold text-slate-700 font-mono">₹{child.totalFee ?? 15000}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-sans">Paid to date</span>
                <span className="font-semibold text-emerald-600 font-mono">₹{child.paidFee ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 font-bold font-sans">
                <span className="text-slate-600">Pending Payable</span>
                <span className={`${child.pendingFee > 0 ? "text-red-650 text-red-600" : "text-emerald-700"} font-mono`}>
                  ₹{child.pendingFee ?? 15000}
                </span>
              </div>
              
              {/* Status */}
              <div className="pt-1.5 text-center">
                <span className={`inline-block w-full py-1 rounded text-[10px] font-bold font-mono ${
                  child.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                  child.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {child.paymentStatus ?? 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Panel */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="lg:col-span-3 space-y-6"
      >

        {!child && activeTab !== 'account' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <Link2 className="w-5 h-5" /> Account Linking Required
            </h2>
            <p className="text-xs text-amber-950 leading-relaxed font-sans">
              No family student profile has been coupled to this parent account index during the database admission workflow. Please navigate to the <strong>Custodian Link Center</strong> tab on the left margin to register and pair your profile to your student immediately.
            </p>
            <button 
              onClick={() => setActiveTab('account')}
              className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-amber-700 transition cursor-pointer"
            >
              Go to Link Center
            </button>
          </div>
        )}

        {child && activeTab === 'child-desk' && (
          <div className="space-y-6">
            
            {/* Child basic analytics card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Academic Performance</span>
                <p className="text-sm font-bold text-slate-800">Assigned Curriculum Class Grade: {child.classGrade}</p>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">Continuous Evaluation status is reviewed automatically by academy administrators.</p>
              </div>

              <div className="space-y-1.5 pl-0 md:pl-4">
                <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Homework Completion Status
                </span>
                <div className="flex items-center justify-between text-xs text-slate-650">
                  <span className="font-sans">Solved tasks:</span>
                  <span className="font-bold font-mono text-slate-705 text-slate-800">{childSubmissions.length} of {childAssignments.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${childAssignments.length ? (childSubmissions.length / childAssignments.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Child's Turnout Oversight Widget */}
            {(() => {
              const childRecords = attendance.filter(r => r.studentId === child.id);
              const totalChildRolls = childRecords.length;
              const presentChildCount = childRecords.filter(r => r.status === 'PRESENT').length;
              const absentChildCount = childRecords.filter(r => r.status === 'ABSENT').length;
              const lateChildCount = childRecords.filter(r => r.status === 'LATE').length;
              const excusedChildCount = childRecords.filter(r => r.status === 'EXCUSED').length;

              const presentRatioPercentage = totalChildRolls > 0
                ? Math.round(((presentChildCount + lateChildCount + excusedChildCount) / totalChildRolls) * 100)
                : 100;

              return (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Child Turnout Oversight
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-sans">Verify roll call turnout logged by class teachers of {child.name}.</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded font-extrabold text-xs font-mono border ${
                      presentRatioPercentage >= 85 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : presentRatioPercentage >= 75 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Turnout Rate: {totalChildRolls > 0 ? `${presentRatioPercentage}%` : 'No logs'}
                    </span>
                  </div>

                  {absentChildCount > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2 text-rose-800 font-sans text-xs">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 select-none" />
                      <div>
                        <p className="font-bold uppercase tracking-wide font-mono text-rose-700 leading-none mb-1">Absence Alert Registered</p>
                        <p className="text-rose-950/80 leading-normal">
                          {child.name} has been marked absent from **{absentChildCount} session(s)**. If this was a mistake, or if a doctor's sick note is pending delivery, please submit a message to the faculty via the **Contact Teachers** tab.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center py-1">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                      <span className="block text-[10px] text-slate-400 font-mono font-bold uppercase">PRESENT</span>
                      <strong className="text-base text-slate-800 font-extrabold">{presentChildCount}</strong>
                    </div>
                    <div className="bg-rose-50/60 border border-rose-100/50 rounded-lg p-2.5">
                      <span className="block text-[10px] text-rose-500 font-mono font-bold uppercase">ABSENT</span>
                      <strong className="text-base text-rose-800 font-extrabold">{absentChildCount}</strong>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100/50 rounded-lg p-2.5">
                      <span className="block text-[10px] text-amber-600 font-mono font-bold uppercase">LATE</span>
                      <strong className="text-base text-amber-800 font-extrabold">{lateChildCount}</strong>
                    </div>
                    <div className="bg-slate-50/60 border border-slate-100 rounded-lg p-2.5">
                      <span className="block text-[10px] text-slate-450 text-slate-500 font-mono font-bold uppercase">EXCUSED</span>
                      <strong className="text-base text-slate-700 font-extrabold">{excusedChildCount}</strong>
                    </div>
                  </div>

                  {childRecords.length > 0 && (
                    <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 max-h-[170px] overflow-y-auto pr-1">
                      {[...childRecords].reverse().slice(0, 5).map(r => (
                        <div key={r.id} className="p-2.5 text-[11px] font-sans flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800">{r.subject}</span>
                            <span className="text-slate-400 font-mono ml-2">({r.date})</span>
                            {r.remarks && <p className="text-[10px] text-slate-400 font-normal italic mt-0.5">Note: "{r.remarks}"</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] font-mono ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : r.status === 'ABSENT'
                              ? 'bg-rose-50 border border-rose-200 text-rose-800'
                              : 'bg-amber-50 border border-amber-200 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Assignments list overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-sans">Child's Homework Desk Oversight</h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">Review assignments issued to {child.name} and current grades published in real-time.</p>
              </div>

              {childAssignments.length === 0 ? (
                <p className="text-xs italic text-slate-400 py-6 text-center font-sans">No assignments declared for {child.name}'s group yet.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {childAssignments.map(asg => {
                    const submission = getChildSubmission(asg.id);

                    return (
                      <div key={asg.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3 hover:border-blue-100 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-extrabold rounded uppercase mr-2 tracking-wide font-mono">
                              {asg.subject}
                            </span>
                            <span className="text-xs font-bold text-slate-800 font-sans">{asg.title}</span>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">Teacher: {asg.teacherName} • Target Due: {new Date(asg.dueDate).toLocaleString()}</p>
                          </div>

                          {submission ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              submission.status === 'GRADED' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100 font-mono'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {submission.status === 'GRADED' ? `Grade Received: ${submission.grade}` : 'Submitted - Locked'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[10px] border border-dashed border-slate-300 font-semibold flex items-center gap-1 font-mono">
                              ⚠️ Uncompleted Solution
                            </span>
                          )}
                        </div>

                        {/* Guidelines */}
                        <div className="text-xs text-slate-650">
                          <p className="font-semibold text-slate-700">Assignment Requirement details:</p>
                          <p className="mt-1 leading-relaxed text-slate-500">{asg.description}</p>
                        </div>

                        {/* Optional teacher evaluation review */}
                        {submission && submission.status === 'GRADED' && (
                          <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-xs">
                            <p className="font-bold text-emerald-800 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> Academic Evaluation Published:
                            </p>
                            <p className="text-slate-800 font-mono text-[11px] font-bold mt-1.5">Score Grade: {submission.grade}</p>
                            <p className="text-slate-605 text-slate-500 italic mt-1 font-normal font-sans">Feedback remarks: "{submission.feedback}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {child && activeTab === 'teacher-chat' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Parent-Teacher Message Desk
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">Chat directly with {child.name}'s teachers. All messages are securely and privately communicated.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Send box */}
              <div className="md:col-span-1 border border-slate-200 p-4 rounded-xl h-fit space-y-4">
                <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wider flex items-center gap-1 font-mono text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-blue-600" /> New Message
                </h3>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium font-sans">Recipient Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full text-xs border border-slate-205 border-slate-200 p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:outline-blue-500"
                  >
                    <option value="">-- Choose Instructor --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subjects.join(', ')})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-505 text-slate-500 font-medium font-sans">Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Ask about grades, progress or behavior updates..."
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                    disabled={!selectedTeacherId}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleChatSubmit}
                  disabled={!selectedTeacherId || !chatText.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message Securely
                </button>
              </div>

              {/* Chat screen */}
              <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 h-[350px] flex flex-col justify-between bg-slate-50/20">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide font-mono">Private Chat Feed</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
                  {parentMessages.length === 0 ? (
                    <div className="text-center py-12 font-sans">
                      <p className="text-xs text-slate-400 italic leading-normal">
                        No private messaging transcripts logged for this account. Keep transparent communication channel active.
                      </p>
                    </div>
                  ) : (
                    parentMessages.map(msg => {
                      const isMe = msg.senderId === parent.id;
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
                              <span className="flex items-center gap-0.5 font-sans font-bold"><Lock className="w-2.5 h-2.5 text-blue-300" /> Private</span>
                            </div>
                            <p className="leading-relaxed font-sans">{decryptedText}</p>
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

        {activeTab === 'faculty-directory' && (
          <FacultyDirectory teachers={teachers} />
        )}

        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-amber-600" />
                Custodian Admission & Profile Linking Center
              </h2>
              <p className="text-xs text-gray-500 mt-1">Bind your parent profile index to your student's account records. This links academic updates dynamically.</p>
            </div>

            <div className="border border-dashed border-gray-200 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-gray-750 uppercase tracking-normal">Admission Policy Details</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Parents are issued dual linked credentials by the academy administration during a student's admission. If you need to manually register a new pupil and link your guardian account now as a self-onboarding test, we have integrated an <strong>Admission Simulator</strong> right inside the academy system!
              </p>

              <div className="bg-amber-55/10 bg-amber-500/10 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-amber-900">💡 Testing Sandbox Note:</p>
                <p className="text-xs text-amber-950 leading-relaxed">
                  Log in as <strong>admin</strong> (password: <code>admin123</code>) to access the official admission office wizard. Completing enrollment there instantly generates dual linked Student & Parent credentials, ready for immediate use.
                </p>
              </div>
            </div>
          </div>
        )}

      </motion.div>

    </div>
  );
}
