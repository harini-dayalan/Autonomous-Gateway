'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import GlobeComponent from '../../components/GlobeComponent';

type Log = { id: number; time: string; event: string; type: string; status: string; risk: string };
type Tab = 'overview' | 'pipeline' | 'gateway' | 'audit' | 'settings';

const INIT_LOGS: Log[] = [
  { id: 1, time: '14:32:11', event: 'CSV_PROCESS', type: 'EMAIL', status: 'TOKENIZED', risk: 'HIGH' },
  { id: 2, time: '14:31:58', event: 'HIGH_RISK_BLOCKED', type: 'SSN', status: 'BLOCKED', risk: 'CRITICAL' },
  { id: 3, time: '14:31:44', event: 'PROMPT_SCAN', type: 'PHONE', status: 'TOKENIZED', risk: 'MEDIUM' },
  { id: 4, time: '14:31:20', event: 'ERASURE_CERT', type: 'NAME', status: 'ERASED', risk: 'LOW' },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [logs, setLogs] = useState<Log[]>(INIT_LOGS);
  const workerRef = useRef<Worker | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiReady, setAiReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const [chatMessages, setChatMessages] = useState<{role:'user'|'ai'; text:string}[]>([{role:'ai', text:'👋 Hi! I am Sentinel AI — a local privacy intelligence assistant running entirely in your browser. Click "Load Local AI Model" to activate me. No API key or internet connection required after the first download.'}]);
  const [chatInput, setChatInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [rawPrompt, setRawPrompt] = useState('Update the profile for user jane.doe@enterprise.com. Their SSN is 123-45-6789. Last login was from 192.168.1.1.');
  const [shielded, setShielded] = useState('');
  const [scanning, setScanning] = useState(false);
  const [csvName, setCsvName] = useState('');
  const [scanDone, setScanDone] = useState(false);
  const [toast, setToast] = useState('');
  const [policies, setPolicies] = useState({ email: true, ssn: true, phone: true, name: true, ip: false, dob: false });
  const [kernelSettings, setKernelSettings] = useState({ localFallback: true, hmacMode: true, fpeMode: false, ragEnabled: true, auditLog: true, autoErase: false, devMode: false });
  const fileRef = useRef<HTMLInputElement>(null);
  const logId = useRef(5);

  const [eraseId, setEraseId] = useState('');
  const [erasingState, setErasingState] = useState(0);
  const [erasureCert, setErasureCert] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadModel = () => {
    if (aiLoading || aiReady) return;
    setAiLoading(true);
    setAiProgress('Initializing...');
    const worker = new Worker('/llm-worker.js', { type: 'module' });
    worker.onmessage = (e) => {
      const { type, message, pct, text } = e.data;
      if (type === 'status') setAiProgress(message);
      if (type === 'progress') setAiProgress(`Loading model: ${pct}%`);
      if (type === 'ready') { setAiReady(true); setAiLoading(false); setAiProgress(''); setChatMessages(prev => [...prev, { role: 'ai', text: '✅ Model loaded! I am ready. Ask me anything about privacy, PII, GDPR, or your gateway configuration.' }]); }
      if (type === 'result') { setChatMessages(prev => [...prev, { role: 'ai', text }]); setAiThinking(false); }
      if (type === 'error') { setAiLoading(false); setAiProgress(''); setChatMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${message}` }]); setAiThinking(false); }
    };
    workerRef.current = worker;
    worker.postMessage({ type: 'load' });
  };

  const sendAiMessage = () => {
    if (!chatInput.trim() || !aiReady || aiThinking) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setAiThinking(true);
    workerRef.current?.postMessage({ type: 'generate', text: msg });
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  useEffect(() => {
    const savedRole = localStorage.getItem('sentinel_role') as 'admin' | 'user';
    if (savedRole === 'admin' || savedRole === 'user') {
      setRole(savedRole);
      if (savedRole === 'user' && (tab === 'audit' || tab === 'settings')) {
        setTab('overview');
      }
    }
  }, []);

  const addLog = (event: string, type: string, status: string, risk: string) => {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    setLogs(prev => [{ id: logId.current++, time, event, type, status, risk }, ...prev.slice(0, 19)]);
  };

  const handleShield = () => {
    setScanning(true);
    setTimeout(() => {
      let out = rawPrompt;
      const fpe = kernelSettings.fpeMode;
      if (policies.email) out = out.replace(/[\w.-]+@[\w.-]+\.\w+/g, fpe ? 'alex.smith@example.net' : '[ENT_EMAIL_772]');
      if (policies.ssn) out = out.replace(/\d{3}-\d{2}-\d{4}/g, fpe ? '982-11-0034' : '[ENT_SSN_119]');
      if (policies.phone) out = out.replace(/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g, fpe ? '555-019-8372' : '[ENT_PHONE_334]');
      if (policies.ip) out = out.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, fpe ? '198.51.100.42' : '[ENT_IP_991]');
      setShielded(out);
      setScanning(false);
      addLog('PROMPT_SCAN', fpe ? 'MULTI-PII (FPE)' : 'MULTI-PII', 'TOKENIZED', 'HIGH');
      showToast(fpe ? '✓ Prompt shielded using Format-Preserving Encryption' : '✓ Prompt shielded successfully');
    }, 900);
  };

  const handleCSVScan = () => {
    setScanDone(false);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      addLog('CSV_PROCESS', 'EMAIL,SSN', 'TOKENIZED', 'HIGH');
      addLog('HIGH_RISK_BLOCKED', 'SSN', 'BLOCKED', 'CRITICAL');
      showToast('✓ Security scan complete — 2 PII types detected');
    }, 1800);
  };

  const handleErasure = () => {
    if (!eraseId.trim() || erasingState > 0) return;
    setErasingState(1);
    setTimeout(() => setErasingState(2), 1500);
    setTimeout(() => setErasingState(3), 3000);
    setTimeout(() => {
      setErasingState(4);
      setErasureCert(`CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`);
      addLog('ERASURE_CERT', 'USER_ID', 'ERASED', 'LOW');
      showToast('✓ Cryptographic erasure complete');
    }, 4500);
  };

  const riskColor = (r: string) => r === 'CRITICAL' ? '#ffb4ab' : r === 'HIGH' ? '#f3aeff' : r === 'MEDIUM' ? '#dbc839' : '#cebdff';
  const statusColor = (s: string) => s === 'BLOCKED' ? '#ffb4ab' : s === 'ERASED' ? '#dbc839' : '#a78bfa';

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'pipeline', icon: 'security', label: 'Privacy Pipeline' },
    { id: 'gateway', icon: 'hub', label: 'LLM Gateway' },
    ...(role === 'admin' ? [{ id: 'audit' as Tab, icon: 'fact_check', label: 'Audit Logs' }] : []),
    ...(role === 'admin' ? [{ id: 'settings' as Tab, icon: 'tune', label: 'Kernel Settings' }] : []),
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#08051A' }}>
      {/* SIDEBAR */}
      <aside className="glass-sidebar w-60 flex-shrink-0 flex flex-col py-6 px-4">
        <Link href="/" className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#a78bfa' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>shield</span>
          </div>
          <span className="font-semibold text-violet-100 tracking-wide text-sm">Sentinel DS</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: tab === t.id ? 'rgba(167,139,250,0.15)' : 'transparent', color: tab === t.id ? '#cebdff' : '#948e9d', borderLeft: tab === t.id ? '3px solid #a78bfa' : '3px solid transparent' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3 py-3 rounded-xl border" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.1)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-xs font-semibold" style={{ color: '#cebdff' }}>System Active</span>
          </div>
          <p className="text-xs" style={{ color: '#948e9d' }}>All agents operational</p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'rgba(167,139,250,0.08)' }}>
          <div>
            <h1 className="text-lg font-semibold capitalize">{tab === 'pipeline' ? 'Privacy Pipeline' : tab === 'gateway' ? 'LLM Gateway' : tab === 'audit' ? 'Audit Compliance Log' : tab === 'settings' ? 'Kernel Settings' : 'Overview'}</h1>
            <p className="text-xs" style={{ color: '#948e9d' }}>Sentinel-DS · Enterprise Privacy Engine</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast('🔔 No new alerts')} className="w-9 h-9 flex items-center justify-center rounded-xl border relative" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.15)', color: '#cebdff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-400"></span>
            </button>
            {role === 'admin' && (
              <button onClick={() => { showToast('✓ Settings saved'); }} className="w-9 h-9 flex items-center justify-center rounded-xl border" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.15)', color: '#cebdff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
              </button>
            )}
            <Link href="/login" onClick={() => localStorage.removeItem('sentinel_role')} className="h-9 px-3 rounded-xl flex items-center justify-center font-semibold text-xs transition-opacity hover:opacity-80" style={{ background: '#a78bfa', color: '#1a0a4a' }}>
              {role === 'admin' ? 'SA' : 'SU'}
              <span className="material-symbols-outlined ml-1" style={{ fontSize: 14 }}>logout</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">

          {/* === OVERVIEW === */}
          {tab === 'overview' && (
            <div className="animate-fadeIn space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Scans', val: '156', icon: 'search', delta: '+12 today' },
                  { label: 'Leaks Prevented', val: '4,726', icon: 'security', delta: '+89 today' },
                  { label: 'Tokens Vaulted', val: '1,203', icon: 'lock', delta: 'Active vault' },
                  { label: 'Erasure Certs', val: '14', icon: 'verified', delta: 'GDPR compliant' },
                ].map(s => (
                  <div key={s.label} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#948e9d' }}>{s.label}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#a78bfa' }}>{s.icon}</span>
                    </div>
                    <p className="text-3xl font-semibold text-gradient-violet">{s.val}</p>
                    <p className="text-xs mt-1" style={{ color: '#cac4d4' }}>{s.delta}</p>
                  </div>
                ))}
              </div>
              {/* Top Row: Risk Timeline & Global Threat Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Risk Timeline */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 text-sm">Risk Event Timeline</h3>
                  <div className="flex items-end gap-2 h-28">
                    {[30,55,20,80,45,90,60,75,40,95,50,65].map((h,i) => (
                      <div key={i} className="flex-1 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%`, background: h > 75 ? 'rgba(255,180,171,0.5)' : h > 50 ? 'rgba(243,174,255,0.4)' : 'rgba(167,139,250,0.3)' }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs" style={{ color: '#948e9d' }}>
                    <span>12 hours ago</span><span>Now</span>
                  </div>
                </div>

                {/* Global Threat Map */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '220px' }}>
                  <div className="relative z-10">
                    <h3 className="font-semibold mb-1 text-sm">Global Threat Intercepts</h3>
                    <p className="text-xs" style={{ color: '#948e9d' }}>Live PII redactions mapped geographically</p>
                  </div>
                  <GlobeComponent />
                  <div className="relative z-10 flex gap-4 mt-auto pt-24">
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: '#cebdff' }}></span><span className="text-xs" style={{ color: '#948e9d' }}>API Requests</span></div>
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: '#ffb4ab' }}></span><span className="text-xs" style={{ color: '#948e9d' }}>Blocked Threats</span></div>
                  </div>
                </div>
              </div>
              {/* Recent Logs & Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 text-sm">Recent Activity</h3>
                  <div className="space-y-2">
                    {logs.slice(0,5).map(l => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                        <span className="font-mono text-xs" style={{ color: '#948e9d' }}>{l.time}</span>
                        <span className="text-xs font-semibold">{l.event}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${riskColor(l.risk)}18`, color: riskColor(l.risk) }}>{l.risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIVE TELEMETRY MATRIX */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#08051A] opacity-50 pointer-events-none z-10"></div>
                  <div className="flex items-center justify-between mb-4 relative z-20">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                      Live Intercept Telemetry
                    </h3>
                    <span className="text-xs font-mono text-violet-400">STREAM ACTIVE</span>
                  </div>
                  <div className="font-mono text-[10px] leading-tight space-y-1 relative z-0 h-48 overflow-hidden" style={{ color: 'rgba(167,139,250,0.6)' }}>
                    <div className="animate-scanline absolute w-full h-8 bg-gradient-to-b from-transparent via-violet-500/10 to-transparent pointer-events-none z-20"></div>
                    {[
                      '> INGRESS: [192.168.1.1] -> POST /v1/chat/completions',
                      '> ANALYZING PAYLOAD (482 bytes)...',
                      '> REGEX_MATCH: SSN detected at offset 142',
                      '> ACTION: Tokenizing... [ENT_SSN_881]',
                      '< EGRESS: Forwarding sanitized payload to OpenAI API',
                      '> INGRESS: [10.0.0.5] -> GET /users/search',
                      '> ANALYZING PAYLOAD (120 bytes)...',
                      '> NER_MATCH: Person Name detected [Jonathan Hughes]',
                      '> ACTION: FPE mode active... Swap: [Alex Smith]',
                      '< EGRESS: Forwarding sanitized payload...',
                      '> HTTP 200 OK (Latency: 42ms overhead)',
                      '> VAULT_SYNC: Committing deterministic map to Supabase',
                      '> ...waiting for next packet...'
                    ].map((line, i) => (
                      <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis opacity-80 hover:opacity-100 transition-opacity">
                        {line.includes('REGEX_MATCH') || line.includes('NER_MATCH') ? (
                          <span className="text-red-400">{line}</span>
                        ) : line.includes('ACTION:') ? (
                          <span className="text-[#cebdff] font-semibold">{line}</span>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === PRIVACY PIPELINE === */}
          {tab === 'pipeline' && (
            <div className="animate-fadeIn space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-1">Upload Dataset</h3>
                <p className="text-sm mb-5" style={{ color: '#948e9d' }}>Upload a CSV file to scan for PII entities and auto-tokenize sensitive columns.</p>
                <div className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:border-violet-500/50"
                  style={{ borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.03)' }}
                  onClick={() => fileRef.current?.click()}>
                  <span className="material-symbols-outlined mb-3 block" style={{ fontSize: 40, color: '#a78bfa' }}>upload_file</span>
                  <p className="font-semibold text-sm">{csvName || 'Click to upload CSV dataset'}</p>
                  <p className="text-xs mt-1" style={{ color: '#948e9d' }}>Supports .csv, .tsv, .json — max 50MB</p>
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.json" className="hidden" onChange={e => { if (e.target.files?.[0]) { setCsvName(e.target.files[0].name); setScanDone(false); } }} />
                </div>
              </div>
              {/* Security Policy */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-1">Security Policy</h3>
                <p className="text-sm mb-5" style={{ color: '#948e9d' }}>Configure which PII entity types to detect and tokenize.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(policies) as Array<keyof typeof policies>).map(k => (
                    <div key={k} onClick={() => setPolicies(p => ({ ...p, [k]: !p[k] }))}
                      className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
                      style={{ background: policies[k] ? 'rgba(167,139,250,0.08)' : 'rgba(15,13,20,0.5)', borderColor: policies[k] ? 'rgba(167,139,250,0.3)' : 'rgba(73,69,82,0.3)' }}>
                      <span className="text-sm font-semibold uppercase tracking-wider">{k}</span>
                      <div className={`toggle-track ${policies[k] ? 'active' : ''}`}><div className="toggle-thumb"></div></div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleCSVScan} disabled={scanning} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>radar</span>
                {scanning ? 'Scanning Dataset...' : 'Start Security Scan'}
              </button>
              {scanDone && (
                <div className="glass-card rounded-2xl p-6 border animate-fadeIn" style={{ borderColor: 'rgba(167,139,250,0.3)' }}>
                  <p className="font-semibold text-sm mb-3 text-gradient-violet">✓ Scan Complete</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[{ v: '2', l: 'PII Types Found' }, { v: '156', l: 'Records Scanned' }, { v: '89', l: 'Tokens Created' }].map(s => (
                      <div key={s.l} className="rounded-xl p-3" style={{ background: 'rgba(167,139,250,0.06)' }}>
                        <p className="text-2xl font-semibold text-gradient-violet">{s.v}</p>
                        <p className="text-xs" style={{ color: '#948e9d' }}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === LLM GATEWAY === */}
          {tab === 'gateway' && (
            <div className="animate-fadeIn space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-1">Secure Prompt Composer</h3>
                <p className="text-sm mb-5" style={{ color: '#948e9d' }}>Enter a raw prompt. The gateway will shield all PII before sending to the LLM.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-2" style={{ color: '#948e9d' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(255,180,171,0.7)' }}></span>
                      INPUT_PROMPT_RAW
                    </p>
                    <textarea value={rawPrompt} onChange={e => setRawPrompt(e.target.value)} rows={6}
                      className="input-dark font-mono text-sm resize-none"
                      style={{ background: '#0f0d14' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-2" style={{ color: '#948e9d' }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(167,139,250,0.7)' }}></span>
                      INPUT_PROMPT_SHIELDED
                    </p>
                    <div className="font-mono text-sm p-3 rounded-lg border min-h-[144px]" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.2)', color: 'rgba(230,224,234,0.6)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {scanning ? <span className="animate-pulse text-violet-400">Shielding prompt...</span> : shielded || <span style={{ color: '#494552' }}>Shielded output will appear here...</span>}
                    </div>
                  </div>
                </div>
                <button onClick={handleShield} disabled={scanning} className="btn-primary mt-4 py-3 w-full flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                  {scanning ? 'Shielding...' : 'Shield & Send to LLM'}
                </button>
              </div>
              {shielded && (
                <div className="glass-card rounded-2xl p-6 animate-fadeIn">
                  <h4 className="font-semibold text-sm mb-3">Token Map</h4>
                  <div className="space-y-2">
                    {[{ token: '[ENT_EMAIL_772]', original: '*** redacted ***', type: 'EMAIL' },
                      { token: '[ENT_SSN_119]', original: '*** redacted ***', type: 'SSN' }].map(t => (
                      <div key={t.token} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.06)' }}>
                        <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>{t.token}</span>
                        <span className="text-xs" style={{ color: '#948e9d' }}>→</span>
                        <span className="text-xs font-mono" style={{ color: '#cac4d4' }}>{t.original}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.1)', color: '#cebdff' }}>{t.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SENTINEL AI CHAT */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(167,139,250,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: aiReady ? 'rgba(167,139,250,0.3)' : 'rgba(73,69,82,0.4)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: aiReady ? '#cebdff' : '#948e9d' }}>smart_toy</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Sentinel AI Assistant</p>
                      <p className="text-xs" style={{ color: aiReady ? '#a78bfa' : '#948e9d' }}>
                        {aiReady ? '● Local model active — Flan-T5-Base' : aiLoading ? aiProgress : '○ Model not loaded'}
                      </p>
                    </div>
                  </div>
                  {!aiReady && (
                    <button onClick={loadModel} disabled={aiLoading} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                      {aiLoading ? 'Loading...' : 'Load Local AI Model'}
                    </button>
                  )}
                  {aiReady && <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(167,139,250,0.15)', color: '#cebdff' }}>No API Key Required ✓</span>}
                </div>
                {aiLoading && (
                  <div className="px-6 py-3 border-b" style={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(167,139,250,0.1)' }}>
                        <div className="h-full rounded-full animate-pulse" style={{ width: '65%', background: 'linear-gradient(90deg, #a78bfa, #cebdff)' }}></div>
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ color: '#948e9d' }}>{aiProgress}</span>
                    </div>
                  </div>
                )}
                <div className="h-64 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs" style={{ background: m.role === 'ai' ? 'rgba(167,139,250,0.2)' : '#a78bfa', color: m.role === 'ai' ? '#cebdff' : '#1a0a4a' }}>
                        {m.role === 'ai' ? '🤖' : 'U'}
                      </div>
                      <div className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed" style={{ background: m.role === 'ai' ? 'rgba(167,139,250,0.07)' : 'rgba(167,139,250,0.2)', color: '#e6e0ea', borderRadius: m.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px' }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {aiThinking && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs" style={{ background: 'rgba(167,139,250,0.2)' }}>🤖</div>
                      <div className="px-4 py-3" style={{ background: 'rgba(167,139,250,0.07)', borderRadius: '4px 16px 16px 16px' }}>
                        <span className="flex gap-1">{[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d*0.15}s` }}></span>)}</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-5 pb-5 pt-3 border-t flex gap-2" style={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                    placeholder={aiReady ? 'Ask about GDPR, PII, tokenization...' : 'Load model first...'}
                    disabled={!aiReady || aiThinking}
                    className="input-dark text-sm flex-1" />
                  <button onClick={sendAiMessage} disabled={!aiReady || aiThinking || !chatInput.trim()} className="btn-primary px-4 py-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === AUDIT LOGS === */}
          {tab === 'audit' && (
            <div className="animate-fadeIn space-y-6">
              
              {/* SISA ERASURE COMPONENT */}
              <div className="glass-card rounded-2xl p-6 border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: 20 }}>delete_forever</span>
                    Right to be Forgotten (GDPR Art. 17)
                  </h3>
                  <p className="text-sm mb-5" style={{ color: '#948e9d' }}>Execute a SISA (Sliced, Isolated, Shuffled, and Aggregated) cryptographic erasure. This permanently destroys the HMAC key mapping for a user, rendering all associated synthetic tokens useless.</p>
                  
                  {erasingState === 0 && (
                    <div className="flex gap-3">
                      <input value={eraseId} onChange={e => setEraseId(e.target.value)}
                        placeholder="Enter User ID or Email to erase (e.g. user_992)"
                        className="input-dark text-sm max-w-md" />
                      <button onClick={handleErasure} disabled={!eraseId.trim()} className="btn-primary" style={{ background: '#ffb4ab', color: '#93000a' }}>
                        Burn Key & Erase
                      </button>
                    </div>
                  )}

                  {erasingState > 0 && erasingState < 4 && (
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-t-red-400 border-red-400/20 animate-spin"></div>
                        <p className="font-mono text-sm text-red-300">
                          {erasingState === 1 && '> Locating cryptographic shards in vault...'}
                          {erasingState === 2 && '> Destroying master HMAC key 0x8F92A1...'}
                          {erasingState === 3 && '> Aggregating zero-knowledge proofs...'}
                        </p>
                      </div>
                      <div className="h-2 bg-red-950 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${(erasingState / 3) * 100}%` }}></div>
                      </div>
                    </div>
                  )}

                  {erasingState === 4 && (
                    <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-green-400">verified</span>
                        <h4 className="font-semibold text-green-400">Cryptographic Erasure Verified</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div><span className="text-gray-400">Target ID:</span> <span className="text-white">{eraseId}</span></div>
                        <div><span className="text-gray-400">Timestamp:</span> <span className="text-white">{new Date().toISOString()}</span></div>
                        <div className="col-span-2"><span className="text-gray-400">Certificate:</span> <span className="text-yellow-200">{erasureCert}</span></div>
                      </div>
                      <button onClick={() => { setErasingState(0); setEraseId(''); }} className="mt-4 text-xs px-4 py-2 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors">
                        Acknowledge & Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                  <h3 className="font-semibold text-sm">Compliance Audit Log</h3>
                  <button onClick={() => { setLogs([]); showToast('Log cleared'); }} className="text-xs px-3 py-1.5 rounded-lg border" style={{ borderColor: 'rgba(167,139,250,0.2)', color: '#948e9d' }}>Clear Log</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(167,139,250,0.08)' }}>
                        {['Time','Event','Entity Type','Status','Risk Level'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-semibold tracking-widest uppercase" style={{ color: '#948e9d' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.id} className="border-b hover:bg-violet-500/5 transition-colors" style={{ borderColor: 'rgba(167,139,250,0.05)' }}>
                          <td className="px-5 py-3 font-mono" style={{ color: '#948e9d' }}>{l.time}</td>
                          <td className="px-5 py-3 font-semibold">{l.event}</td>
                          <td className="px-5 py-3 font-mono" style={{ color: '#cac4d4' }}>{l.type}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${statusColor(l.status)}18`, color: statusColor(l.status) }}>{l.status}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${riskColor(l.risk)}18`, color: riskColor(l.risk) }}>{l.risk}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length === 0 && <p className="text-center py-12 text-sm" style={{ color: '#494552' }}>No audit events recorded yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* === KERNEL SETTINGS === */}
          {tab === 'settings' && (
            <div className="animate-fadeIn space-y-4">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-1">Kernel Configuration</h3>
                <p className="text-sm mb-6" style={{ color: '#948e9d' }}>Core engine settings for the Sentinel privacy kernel and agent orchestration.</p>
                <div className="space-y-3">
                  {(Object.keys(kernelSettings) as Array<keyof typeof kernelSettings>).map(k => {
                    const labels: Record<string, { label: string; desc: string }> = {
                      localFallback: { label: 'Local Fallback Mode', desc: 'Use local regex when OpenAI quota is exceeded' },
                      hmacMode: { label: 'HMAC-SHA256 Tokenization', desc: 'Deterministic cryptographic token generation' },
                      fpeMode: { label: 'Format-Preserving Encryption (FPE)', desc: 'Replace PII with realistic fake data instead of [ENT] tokens' },
                      ragEnabled: { label: 'RAG Vector Search', desc: 'Enable retrieval-augmented generation pipeline' },
                      auditLog: { label: 'Immutable Audit Logging', desc: 'Write all events to compliance log (Art. 30)' },
                      autoErase: { label: 'Auto-Erasure on Expiry', desc: 'Cryptographically erase PII after retention period' },
                      devMode: { label: 'Developer Debug Mode', desc: 'Show token internals in API responses' },
                    };
                    return (
                      <div key={k} className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'rgba(15,13,20,0.6)', borderColor: 'rgba(73,69,82,0.3)' }}>
                        <div>
                          <p className="font-semibold text-sm">{labels[k].label}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#948e9d' }}>{labels[k].desc}</p>
                        </div>
                        <div className={`toggle-track ${kernelSettings[k] ? 'active' : ''}`} onClick={() => setKernelSettings(s => ({ ...s, [k]: !s[k] }))}>
                          <div className="toggle-thumb"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-sm">System Health</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ label: 'PII Engine', status: 'ONLINE' }, { label: 'Supabase Vault', status: 'ONLINE' }, { label: 'RAG Pipeline', status: kernelSettings.ragEnabled ? 'ONLINE' : 'OFFLINE' }, { label: 'Audit Logger', status: kernelSettings.auditLog ? 'ONLINE' : 'PAUSED' }].map(s => (
                    <div key={s.label} className="rounded-xl p-4 text-center border" style={{ background: 'rgba(15,13,20,0.6)', borderColor: 'rgba(73,69,82,0.3)' }}>
                      <span className={`w-2 h-2 rounded-full inline-block mb-2 ${s.status === 'ONLINE' ? 'bg-violet-400 animate-pulse' : 'bg-yellow-400'}`}></span>
                      <p className="text-xs font-semibold">{s.label}</p>
                      <p className="text-xs mt-1" style={{ color: s.status === 'ONLINE' ? '#cebdff' : '#dbc839' }}>{s.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => showToast('✓ Kernel settings saved')} className="btn-primary w-full py-3">Save Kernel Configuration</button>
            </div>
          )}
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold animate-fadeIn z-50 border"
          style={{ background: 'rgba(19,16,58,0.95)', borderColor: 'rgba(167,139,250,0.3)', color: '#cebdff', backdropFilter: 'blur(20px)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
