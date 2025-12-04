import React, { useState } from 'react';
import { Header } from './components/Header';
import { Scanner } from './components/Scanner';
import { HistoryChart } from './components/HistoryChart';
import { ScanHistoryItem } from './types';
import { Terminal, Shield, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const handleScanComplete = (item: ScanHistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-200 selection:bg-cyan-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Disclaimer */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/10 border-l-4 border-cyan-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                <div>
                    <h3 className="font-bold text-cyan-100">Local Static Analysis Environment</h3>
                    <p className="text-sm text-cyan-200/70 mt-1">
                        This tool analyzes uploaded scripts and logs using Gemini's heuristic engine. 
                        It runs in your browser. For full system remediation, use a dedicated desktop antivirus.
                    </p>
                </div>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Scans</h3>
                    <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-3xl font-black text-white">{history.length}</div>
                <div className="text-xs text-slate-500 mt-2">Current Session</div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Last File</h3>
                    <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-lg font-bold text-white truncate">
                    {history[0]?.filename || "N/A"}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                    {history[0] ? new Date(history[0].timestamp).toLocaleTimeString() : "--:--"}
                </div>
            </div>

             {/* Stat Card 3 - Chart */}
            <div className="md:row-span-2">
                 <HistoryChart history={history} />
            </div>

             {/* Main Scanner takes up 2 columns */}
            <div className="md:col-span-2 md:row-span-3">
                <Scanner onScanComplete={handleScanComplete} />
            </div>

             {/* Recent Logs List (Right side) */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full md:min-h-[400px]">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="font-mono text-sm text-cyan-400 font-bold">Event Log</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-10 text-slate-600 text-xs font-mono">
                            // NO EVENTS RECORDED
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="p-3 bg-slate-800/50 rounded border border-slate-700 hover:bg-slate-800 transition-colors cursor-default">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                        item.result.verdict === 'SAFE' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                        item.result.verdict === 'MALICIOUS' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                                        'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                    }`}>{item.result.verdict}</span>
                                </div>
                                <div className="font-medium text-sm text-slate-200 truncate" title={item.filename}>{item.filename}</div>
                                <div className="text-xs text-slate-500 mt-1 truncate">{item.result.threatName || "No specific threat signature"}</div>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>

      </main>
    </div>
  );
};

export default App;