import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                <ShieldAlert className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tight">SENTINEL<span className="text-cyan-400">AI</span></h1>
                <p className="text-[10px] text-cyan-500/80 font-mono tracking-widest uppercase">Heuristic Threat Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 py-1 px-3 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SYSTEM ONLINE
             </div>
             <a href="#" className="p-2 text-slate-400 hover:text-white transition-colors">
                <Activity className="w-5 h-5" />
             </a>
          </div>
        </div>
      </div>
    </header>
  );
};