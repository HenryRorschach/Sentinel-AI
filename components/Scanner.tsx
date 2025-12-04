import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileCode, AlertTriangle, ShieldCheck, Skull, Loader2, X } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult, ThreatLevel, ScanHistoryItem } from '../types';

interface ScannerProps {
  onScanComplete: (item: ScanHistoryItem) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    if (file.size > 1000000) { // 1MB limit for demo
        alert("File too large. Max 1MB for web demo.");
        return;
    }

    setIsScanning(true);
    setCurrentResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            const result = await analyzeContent(content, file.name);
            setCurrentResult(result);
            onScanComplete({
                id: crypto.randomUUID(),
                filename: file.name,
                timestamp: Date.now(),
                result: result
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsScanning(false);
        }
    };
    // Attempt to read as text. If it's a binary, it might look garbage, 
    // but Gemini can often detect binary headers if present in text representation.
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
  };

  const handleTextScan = async () => {
      if (!textInput.trim()) return;
      setIsScanning(true);
      setCurrentResult(null);
      try {
          const result = await analyzeContent(textInput, "Manual_Input_Snippet");
          setCurrentResult(result);
          onScanComplete({
              id: crypto.randomUUID(),
              filename: "Manual Snippet",
              timestamp: Date.now(),
              result: result
          });
      } catch (err) {
          console.error(err);
      } finally {
          setIsScanning(false);
      }
  };

  const getVerdictColor = (verdict: ThreatLevel) => {
      switch (verdict) {
          case ThreatLevel.SAFE: return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10";
          case ThreatLevel.SUSPICIOUS: return "text-amber-400 border-amber-500/50 bg-amber-500/10";
          case ThreatLevel.MALICIOUS: return "text-rose-500 border-rose-500/50 bg-rose-500/10";
          default: return "text-slate-400 border-slate-500/50 bg-slate-500/10";
      }
  };

  const getVerdictIcon = (verdict: ThreatLevel) => {
      switch (verdict) {
          case ThreatLevel.SAFE: return <ShieldCheck className="w-16 h-16 text-emerald-400" />;
          case ThreatLevel.SUSPICIOUS: return <AlertTriangle className="w-16 h-16 text-amber-400" />;
          case ThreatLevel.MALICIOUS: return <Skull className="w-16 h-16 text-rose-500" />;
          default: return <FileCode className="w-16 h-16 text-slate-400" />;
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* INPUT SECTION */}
      <div className="space-y-6">
        <div className="flex gap-4 mb-4">
            <button 
                onClick={() => setInputMode('file')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${inputMode === 'file' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                File Upload
            </button>
            <button 
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${inputMode === 'text' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                Paste Code/Logs
            </button>
        </div>

        {inputMode === 'file' ? (
             <div 
             className={`relative h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${dragActive ? "border-cyan-400 bg-cyan-900/20" : "border-slate-600 bg-slate-800/30"}`}
             onDragEnter={handleDrag}
             onDragLeave={handleDrag}
             onDragOver={handleDrag}
             onDrop={handleDrop}
           >
             <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
             />
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                <div className="w-64 h-64 rounded-full bg-cyan-500 blur-[100px] opacity-10"></div>
             </div>
             
             <Upload className={`w-12 h-12 mb-4 ${dragActive ? "text-cyan-400" : "text-slate-500"}`} />
             <p className="text-lg font-medium text-slate-300">Drag & Drop suspicious file</p>
             <p className="text-sm text-slate-500 mt-2 mb-6">or click to browse (Max 1MB)</p>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="z-10 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors border border-slate-500"
             >
                Select File
             </button>
           </div>
        ) : (
            <div className="h-80 flex flex-col">
                <textarea 
                    className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm text-green-400 focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="// Paste suspicious shell script, JS, Python, or logs here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />
                <button 
                    onClick={handleTextScan}
                    disabled={!textInput.trim() || isScanning}
                    className="mt-4 w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white shadow-lg shadow-cyan-900/50 transition-all flex items-center justify-center gap-2"
                >
                   {isScanning ? <Loader2 className="animate-spin w-5 h-5"/> : <ShieldCheck className="w-5 h-5"/>}
                   Analyze Snippet
                </button>
            </div>
        )}
      </div>

      {/* RESULT SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden min-h-[400px]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900/90 backdrop-blur-sm">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-cyan-500/20 rounded-full blur-md"></div>
                </div>
                <h3 className="text-xl font-bold text-cyan-400 animate-pulse">ANALYZING SIGNATURES</h3>
                <div className="mt-2 font-mono text-xs text-slate-400">
                    <p>Heuristic Scan: <span className="text-green-400">ACTIVE</span></p>
                    <p>Pattern Matching: <span className="text-green-400">RUNNING</span></p>
                    <p>Gemini Engine: <span className="text-green-400">CONNECTED</span></p>
                </div>
            </div>
        ) : currentResult ? (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {getVerdictIcon(currentResult.verdict)}
                        <div>
                            <h2 className={`text-3xl font-black uppercase tracking-tighter ${currentResult.verdict === ThreatLevel.MALICIOUS ? 'text-rose-500' : currentResult.verdict === ThreatLevel.SUSPICIOUS ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {currentResult.verdict}
                            </h2>
                            {currentResult.threatName && (
                                <p className="text-slate-400 font-mono text-sm border border-slate-700 px-2 py-0.5 rounded inline-block bg-slate-800 mt-1">
                                    Type: {currentResult.threatName}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-slate-500 uppercase font-bold tracking-wider block">Confidence</span>
                        <span className="text-2xl font-bold text-white">{currentResult.confidence}%</span>
                    </div>
                </div>

                <div className={`p-4 rounded-lg border mb-6 ${getVerdictColor(currentResult.verdict)}`}>
                    <h4 className="font-bold mb-1 opacity-90">Analysis Summary</h4>
                    <p className="opacity-80 text-sm leading-relaxed">{currentResult.summary}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Patterns</h4>
                        <div className="flex flex-wrap gap-2">
                            {currentResult.detectedPatterns.length > 0 ? (
                                currentResult.detectedPatterns.map((pattern, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded font-mono">
                                        {pattern}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500 text-sm italic">No malicious patterns detected.</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Details</h4>
                        <p className="text-sm text-slate-300 font-mono bg-black/30 p-3 rounded border border-slate-700/50 whitespace-pre-wrap">
                            {currentResult.technicalDetails}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-1">Recommendation</h4>
                        <p className="text-sm text-slate-300">{currentResult.recommendation}</p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <ShieldCheck className="w-24 h-24 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">System Ready</h3>
                <p className="text-slate-500 max-w-xs mt-2">Upload a file or paste a script to begin the heuristic analysis process.</p>
            </div>
        )}
      </div>
    </div>
  );
};