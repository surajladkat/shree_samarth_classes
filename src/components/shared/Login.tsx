/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ShieldAlert, LogIn, Users, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SLIDER_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1600&q=80',
    title: 'Digital Classrooms',
    desc: 'Access your coursework and resources from anywhere.'
  },
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    title: 'Collaborative Study',
    desc: 'Direct interaction channels between teachers and students.'
  },
  {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    title: 'Real-time Progress',
    desc: 'Track grades, performance analytics, and fee ledgers instantly.'
  }
];

export default function Login() {
  const { login } = useSchool();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sliding window states
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = Math.abs(page % SLIDER_IMAGES.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Auto-play sliding mechanism
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [page]);

  // Sliding animation configurations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid username or password.');
      }
    } catch (error) {
      setErrorMsg('A system error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Master layout container is completely unconstrained (edge-to-edge screen fluid layout)
    <div className="flex flex-col gap-8 w-full min-h-screen py-6 px-0 bg-slate-50/50">
      
      {/* Row 1: Brand guidelines and info (Stretched to 100% width) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full px-6 md:px-12 space-y-6 text-left"
      >
        <div className="space-y-4">
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] bg-blue-600 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm inline-block"
          >
            Private Academy Hub
          </motion.span>
          <h2 id="login-heading" className="text-3xl font-black text-slate-900 tracking-tight font-sans leading-tight bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 bg-clip-text text-transparent">
            Private Class Academic Portal
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-normal font-sans w-full">
            A practical academic management platform designed for tutoring and private coaching classes. Monitor course handouts, student tasks, fee ledger balances, and faculty-parent channels.
          </p>
        </div>

        {/* Features Split Container spanning full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 w-full">
          <motion.div 
            whileHover={{ scale: 1.005, x: 2 }}
            className="flex gap-4 p-5 bg-white hover:bg-slate-50 rounded-xl border border-slate-150 transition-all cursor-pointer shadow-xs w-full"
          >
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg h-fit border border-blue-100">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Private Student Folders</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                Study resources, homework solutions, and teacher grading evaluations are securely processed in a private folder specific to each class grade.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.005, x: 2 }}
            className="flex gap-4 p-5 bg-white hover:bg-slate-50 rounded-xl border border-slate-150 transition-all cursor-pointer shadow-xs w-full"
          >
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg h-fit border border-emerald-100">
              <Users className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Direct Parent Connection</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
                Parents are connected directly to monitor homework progress, check reports, and stay in contact with faculty.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Row 2: Sliding Window Images (Stretched to 100% width) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="w-full h-[280px] sm:h-[360px] md:h-[460px] relative overflow-hidden group bg-slate-950"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 180, damping: 24 }, opacity: { duration: 0.3 } }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={SLIDER_IMAGES[imageIndex].url} 
              alt={SLIDER_IMAGES[imageIndex].title} 
              className="w-full h-full object-cover opacity-75 select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 w-full px-6 md:px-12 pb-6 text-left text-white z-10">
              <h4 className="text-xs md:text-sm font-bold tracking-wide text-blue-400 font-mono uppercase mb-0.5">
                {SLIDER_IMAGES[imageIndex].title}
              </h4>
              <p className="text-[10px] md:text-[11px] text-slate-300 leading-relaxed max-w-2xl">
                {SLIDER_IMAGES[imageIndex].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Side Controls */}
        <button 
          type="button"
          onClick={() => paginate(-1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/40 hover:bg-white/20 text-white backdrop-blur-xs transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          type="button"
          onClick={() => paginate(1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/40 hover:bg-white/20 text-white backdrop-blur-xs transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute top-6 right-6 z-20 flex gap-1.5 bg-slate-900/40 px-3 py-2 rounded-full backdrop-blur-xs">
          {SLIDER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPage([idx, idx > imageIndex ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === imageIndex ? 'w-5 bg-blue-500' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Row 3: Login Form & Status (Stretched to 100% width with square edges / optional small round) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="w-full px-6 md:px-12 pb-6"
      >
        <div className="w-full bg-white rounded-2xl border border-blue-50 p-6 md:p-10 shadow-[0_20px_50px_-20px_rgba(59,130,246,0.06)] hover:border-blue-100/80 transition-all duration-300 text-left space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-850 bg-clip-text text-transparent font-sans">Portal Access Gateway</h3>
              <p className="text-xs text-slate-400 mt-1 font-sans font-normal">Enter your authorized administrative, teacher, student, or parent account ID below.</p>
            </div>
            
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 w-fit h-fit flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="text-[9px] text-slate-600 font-mono font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex gap-2 items-start">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <p className="font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="space-y-1 w-full">
                <label className="text-xs text-slate-500 font-medium font-sans">Username (Authorized ID)</label>
                <input 
                  id="login-username"
                  type="text"
                  required
                  placeholder="e.g. admin, teacher"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg p-3.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-1 w-full">
                <label className="text-xs text-slate-500 font-medium font-sans">Password</label>
                <input 
                  id="login-password"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg p-3.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <motion.button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1, backgroundColor: "#1e40af" }}
              whileTap={{ scale: 0.995 }}
              className="w-full py-3.5 bg-blue-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs font-sans mt-4 hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Signing In Security Check...' : 'Enter Academic Portal'}
            </motion.button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5 text-[10px] text-slate-400 font-sans w-full">
            <p className="font-semibold text-slate-500 text-[11px]">Notice to Staff & Parents:</p>
            <p>• Only the administrative office can register new teacher and student portals.</p>
            <p>• For initial configuration, log in with default administrator account:</p>
            <p className="font-mono bg-slate-50 p-3 rounded border border-slate-100 text-slate-600 select-all w-full max-w-full">
              Username: <strong className="text-blue-700">admin</strong> &nbsp;|&nbsp; Password: <strong className="text-blue-700">admin123</strong>
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}