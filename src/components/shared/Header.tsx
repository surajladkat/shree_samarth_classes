/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { LogOut, Bell, ShieldCheck, UserCheck, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  const { currentUser, logout, notifications, markNotificationsAsRead } = useSchool();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) return null;

  // Filter relevant notifications
  const myNotifications = notifications.filter(n => {
    if (n.recipientId === currentUser.id) return true;
    if (n.recipientId === `ALL_${currentUser.role}S`) return true;
    return false;
  });

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] flex justify-between items-center relative z-20"
    >
      
      {/* Brand area */}
      <div className="flex items-center gap-2.5">
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100"
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">Private Academy Portal</h1>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Academic Session 2026</p>
        </div>
      </div>

      {/* Operations Panel */}
      <div className="flex items-center gap-3">
        
        {/* Sync Indicator */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1.5 rounded-xl border border-emerald-100/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" /> Portal Operational & Active
        </span>

        {/* Realtime Alert popover */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNotificationClick}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition relative border border-slate-200 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200/85 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-4 space-y-3 z-50 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-850">Real-Time Alerts Log</span>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono">Synced</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {myNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center font-sans">No recent alerts recorded.</p>
                ) : (
                  myNotifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 bg-slate-50/50 rounded-xl space-y-1 hover:bg-slate-50 transition border border-slate-100/60">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">{notif.message}</p>
                      <p className="text-[9px] text-slate-400 font-mono text-right">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* User Identity Details Card */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{currentUser.name}</p>
            <p className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-0.5 justify-end uppercase mt-0.5">
              <UserCheck className="w-3 h-3 text-blue-500" />
              {currentUser.role}
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            title="Log out securely"
            className="p-2.5 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 text-blue-600 rounded-xl transition border border-blue-250 border-blue-200 cursor-pointer flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>

      </div>

    </motion.header>
  );
}
