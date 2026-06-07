/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { decryptData } from '../../cryptoUtils';
import { Terminal, ShieldAlert, Cpu, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react';

export default function SecurityDebugger() {
  const { submissions, messages, studyMaterials } = useSchool();
  const [showPlain, setShowPlain] = useState<boolean>(false);

  // Take the most recent items
  const recentSubmission = submissions[submissions.length - 1];
  const recentMessage = messages[messages.length - 1];
  const recentMaterial = studyMaterials[studyMaterials.length - 1];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 mt-6 shadow-lg font-mono text-xs space-y-4">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              Data Privacy & Encryption Inspector
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Real-time simulation showing how school records are private and encrypted in the database.</p>
          </div>
        </div>

        <button
          onClick={() => setShowPlain(!showPlain)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-md flex items-center gap-1.5 transition text-[11px] font-sans cursor-pointer"
        >
          {showPlain ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPlain ? 'Mask Under Encryption' : 'Simulate Recipient Decryption'}
        </button>
      </div>

      {/* Terminal grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Handout Material Tunnel */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Cpu className="w-3.5 h-3.5" /> Encrypted Course Material
          </p>
          
          {recentMaterial ? (
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-[10px]">
                <span className="text-slate-500 font-sans">Material Title</span>
                <span className="text-slate-300 font-semibold truncate max-w-[120px]">{recentMaterial.title}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-sans">Database Stored Format (Encrypted)</span>
                <p className="bg-slate-900 p-2 rounded leading-relaxed text-[10px] font-mono break-all line-clamp-3 text-slate-400">
                  {recentMaterial.fileContent}
                </p>
              </div>

              {showPlain && (
                <div className="space-y-1 pt-1 border-t border-dashed border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Decrypted Material View
                  </span>
                  <p className="text-[10px] text-slate-300 bg-slate-900/50 p-2 rounded border border-emerald-950 leading-relaxed font-mono whitespace-pre-wrap">
                    {decryptData(recentMaterial.fileContent, 'SCHOOL_SECRET_KEY')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] italic text-slate-500 font-sans py-4">No reference material packets logged yet.</p>
          )}
        </div>

        {/* Student Submission Tunnel */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Lock className="w-3.5 h-3.5" /> Encrypted Homework Solutions
          </p>

          {recentSubmission ? (
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-[10px]">
                <span className="text-slate-500 font-sans">Student Sender</span>
                <span className="text-slate-300 font-semibold">{recentSubmission.studentName}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-sans">Database Stored Format (Encrypted)</span>
                <p className="bg-slate-900 p-2 rounded leading-relaxed text-[10px] font-mono break-all line-clamp-3 text-slate-400">
                  {recentSubmission.submittedContent}
                </p>
              </div>

              {showPlain && (
                <div className="space-y-1 pt-1 border-t border-dashed border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Decrypted Homework View
                  </span>
                  <p className="text-[10px] text-slate-300 bg-slate-900/50 p-2 rounded border border-emerald-950 leading-relaxed font-mono whitespace-pre-wrap">
                    {decryptData(recentSubmission.submittedContent, 'SCHOOL_SECRET_KEY')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] italic text-slate-500 font-sans py-4">No student submission packets logged yet.</p>
          )}
        </div>

        {/* Messaging Tunnel */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-3.5 h-3.5" /> Encrypted Messages
          </p>

          {recentMessage ? (
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-[10px]">
                <span className="text-slate-500 font-sans">Sender & Recipient</span>
                <span className="text-slate-300 font-semibold truncate max-w-[110px]">{recentMessage.senderName} ➜ Parent</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-sans">Database Stored Format (Encrypted)</span>
                <p className="bg-slate-905 bg-slate-900 p-2 rounded leading-relaxed text-[10px] font-mono break-all line-clamp-3 text-slate-400">
                  {recentMessage.content}
                </p>
              </div>

              {showPlain && (
                <div className="space-y-1 pt-1 border-t border-dashed border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Decrypted Chat View
                  </span>
                  <p className="text-[10px] text-slate-300 bg-slate-900/50 p-2 rounded border border-emerald-950 leading-relaxed font-mono whitespace-pre-wrap">
                    {decryptData(msgContentOrText(recentMessage.content), 'SCHOOL_SECRET_KEY')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] italic text-slate-500 font-sans py-4">No communication packets logged yet.</p>
          )}
        </div>

      </div>

      <p className="text-[10px] text-slate-500 font-sans text-center">
        🔒 All course files, submitted student assignments, and parent-teacher communication chats are kept private & secure inside the school network.
      </p>
    </div>
  );

  function msgContentOrText(content: string) {
    return content;
  }
}
