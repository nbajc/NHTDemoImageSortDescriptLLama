import React, { useState, useEffect } from 'react';
import { Play, Loader2, FolderOpen, FolderOutput, Tags, Settings, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface JobState {
  status: 'idle' | 'starting' | 'running' | 'completed' | 'error';
  current_file: string | null;
  description: string | null;
  category: string | null;
  processed: number;
  total: number;
  results: any[];
  error: string | null;
}

function App() {
  const [source, setSource] = useState('d:/art');
  const [target, setTarget] = useState('d:/art_sorted');
  const [categories, setCategories] = useState('Portraits, Landscapes, Abstract');
  const [visionModel, setVisionModel] = useState('llava');
  const [textModel, setTextModel] = useState('llava');
  const [dryRun, setDryRun] = useState(false);
  
  const [jobState, setJobState] = useState<JobState>({
    status: 'idle',
    current_file: null,
    description: null,
    category: null,
    processed: 0,
    total: 0,
    results: [],
    error: null
  });

  const pollInterval = React.useRef<number | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/status');
      const data = await res.json();
      setJobState(data);
      if (data.status === 'completed' || data.status === 'error') {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    } catch (err) {
      console.error("Failed to fetch status");
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const handleStart = async () => {
    if (jobState.status === 'running' || jobState.status === 'starting') return;
    
    try {
      const catArray = categories.split(',').map(c => c.trim()).filter(c => c);
      await fetch('http://127.0.0.1:5000/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          target,
          categories: catArray,
          vision_model: visionModel,
          text_model: textModel,
          dry_run: dryRun
        })
      });
      
      setJobState(prev => ({ ...prev, status: 'starting', processed: 0, results: [], error: null }));
      
      if (pollInterval.current) clearInterval(pollInterval.current);
      pollInterval.current = window.setInterval(fetchStatus, 1000);
    } catch (err) {
      setJobState(prev => ({ ...prev, status: 'error', error: "Failed to connect to API" }));
    }
  };

  const progressPercent = jobState.total > 0 ? (jobState.processed / jobState.total) * 100 : 0;

  return (
    <div className="min-h-screen font-sans p-6 md:p-12 selection:bg-primary selection:text-background">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-flex items-center gap-4">
          <ImageIcon className="w-10 h-10 text-primary" />
          LlamaImageSorter
        </h1>
        <p className="text-textMain/80 mt-2 text-lg">Intelligent local image categorization</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Conf Panel */}
        <section className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Settings className="w-5 h-5 text-primary" /> Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMain/80 mb-1 flex items-center gap-2"><FolderOpen className="w-4 h-4"/> Source Dir</label>
                <input 
                  type="text" 
                  value={source} 
                  onChange={e => setSource(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textMain/80 mb-1 flex items-center gap-2"><FolderOutput className="w-4 h-4"/> Target Dir</label>
                <input 
                  type="text" 
                  value={target} 
                  onChange={e => setTarget(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain/80 mb-1 flex items-center gap-2"><Tags className="w-4 h-4"/> Categories (comma-separated)</label>
                <input 
                  type="text" 
                  value={categories} 
                  onChange={e => setCategories(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-textMain/70 mb-1">Vision Model</label>
                  <input type="text" value={visionModel} onChange={e => setVisionModel(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded px-3 py-1.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMain/70 mb-1">Text Model</label>
                  <input type="text" value={textModel} onChange={e => setTextModel(e.target.value)} className="w-full bg-background/50 border border-white/10 rounded px-3 py-1.5 text-sm outline-none" />
                </div>
              </div>

              <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} className="sr-only peer"/>
                  <div className="w-10 h-6 bg-background rounded-full peer-checked:bg-secondary transition-colors border border-white/10"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-textMain rounded-full transition-transform peer-checked:translate-x-4 peer-checked:bg-white"></div>
                </div>
                <span className="text-sm font-medium group-hover:text-white transition-colors">Dry Run Mode</span>
              </label>

              <button 
                onClick={handleStart}
                disabled={jobState.status === 'running' || jobState.status === 'starting'}
                className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-background font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {(jobState.status === 'running' || jobState.status === 'starting') ? (
                  <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</>
                ) : (
                  <><Play className="w-5 h-5"/> Start Sorting</>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Status & Results */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center justify-between border-b border-white/10 pb-4">
              <span>Status Overview</span>
              <span className={`text-sm px-3 py-1 rounded-full border ${jobState.status === 'running' ? 'bg-primary/10 border-primary text-primary animate-pulse' : jobState.status === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10'}`}>
                {jobState.status.toUpperCase()}
              </span>
            </h2>

            {jobState.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0"/> {jobState.error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-textMain/70">Progress</span>
                <span className="font-mono">{jobState.processed} / {jobState.total || '?'}</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-background/50 p-4 rounded-lg border border-white/5">
                <h3 className="text-xs text-textMain/60 uppercase tracking-wider mb-2">Current File</h3>
                <p className="font-mono text-sm truncate" title={jobState.current_file || 'None'}>
                  {jobState.current_file || 'Waiting...'}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-white/5">
                <h3 className="text-xs text-textMain/60 uppercase tracking-wider mb-2">Assigned Category</h3>
                <p className="font-medium text-primary text-sm truncate">
                  {jobState.category || 'Waiting...'}
                </p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border border-white/5 md:col-span-2">
                <h3 className="text-xs text-textMain/60 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-textMain/90 italic leading-relaxed">
                  {jobState.description || 'Waiting...'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 flex-1 flex flex-col min-h-[300px]">
            <h2 className="text-xl font-bold flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span>Results Log ({jobState.results.length})</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {jobState.results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-textMain/40 italic">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-20"/>
                  Processed images will appear here.
                </div>
              ) : (
                jobState.results.map((res, i) => (
                  <div key={i} className="bg-background/40 hover:bg-background/60 transition-colors p-4 rounded-lg border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-mono text-sm truncate text-white">{res.file}</span>
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full border border-secondary/30 shrink-0">
                        {res.category}
                      </span>
                    </div>
                    <p className="text-xs text-textMain/80 line-clamp-2">{res.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default App;
