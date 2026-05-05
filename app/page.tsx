'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = '"Update the profile for user jane.doe@enterprise.com. Their SSN is XXX-XX-9982. Summarize last login logs."';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) { setTypedText(fullText.slice(0, i + 1)); i++; }
      else { clearInterval(timer); }
    }, 28);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#08051A' }}>
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b" style={{ background: 'rgba(13,11,33,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(167,139,250,0.1)' }}>
        <div className="max-w-7xl mx-auto px-10 py-4 flex items-center justify-between">
          <span className="text-xl font-semibold text-violet-100 tracking-wider">Sentinel Gateway</span>
          <div className="hidden md:flex items-center gap-1">
            {['Solutions','How It Works','Security','Pricing'].map((item, i) => (
              <a key={item} onClick={() => document.getElementById(i===0?'hero':i===1?'how-it-works':i===2?'trust':'cta')?.scrollIntoView({behavior:'smooth'})}
                className="px-4 py-2 text-sm cursor-pointer transition-colors duration-200 rounded-lg hover:bg-violet-500/10"
                style={{ color: i===0 ? '#cebdff' : 'rgba(206,189,255,0.6)', borderBottom: i===0 ? '2px solid #a78bfa' : 'none' }}>
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(206,189,255,0.4)', fontSize: '18px' }}>search</span>
              <input className="input-dark pl-9 text-sm w-56" placeholder="Search documentation..." type="text" />
            </div>
            <Link href="/login">
              <button className="btn-primary text-sm px-5 py-2">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28">
        {/* HERO */}
        <section id="hero" className="max-w-7xl mx-auto px-10 text-center pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.2)', color: '#cebdff' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block"></span>
            Enterprise-Grade Privacy · Free Tier Available
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight tracking-tight">
            Your AI doesn't need to{' '}
            <span className="text-gradient-violet">see your data</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#cac4d4' }}>
            Zero-Trust Privacy Engine for Enterprise LLMs. Automatically redact, tokenize, and vault sensitive data before it reaches third-party models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/login">
              <button className="btn-primary text-base px-8 py-4">Get Started →</button>
            </Link>
            <button onClick={() => setShowDemo(true)} className="btn-ghost text-base px-8 py-4">▶ Watch Demo</button>
          </div>

          {/* LIVE DEMO PANEL */}
          <div className="glass-card rounded-3xl p-8 max-w-5xl mx-auto relative overflow-hidden" style={{ boxShadow: '0 0 60px rgba(167,139,250,0.1)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.04) 0%, transparent 60%)' }}></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,180,171,0.6)' }}></span>
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#948e9d' }}>INPUT_PROMPT_RAW</span>
                </div>
                <div className="rounded-xl p-5 font-mono text-sm min-h-[150px] border" style={{ background: '#0f0d14', borderColor: 'rgba(73,69,82,0.3)', lineHeight: 1.7 }}>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>"Update the profile for user </span>
                  <span className="px-1 rounded" style={{ color: '#ffb4ab', background: 'rgba(255,180,171,0.12)' }}>jane.doe@enterprise.com</span>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Their social security number is </span>
                  <span className="px-1 rounded" style={{ color: '#ffb4ab', background: 'rgba(255,180,171,0.12)' }}>XXX-XX-9982</span>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Please summarize their last login logs."</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'rgba(167,139,250,0.6)' }}></span>
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#948e9d' }}>INPUT_PROMPT_SHIELDED</span>
                </div>
                <div className="rounded-xl p-5 font-mono text-sm min-h-[150px] border" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.15)', lineHeight: 1.7 }}>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>"Update the profile for user </span>
                  <span className="px-1.5 rounded border font-semibold" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' }}>[ENT_EMAIL_772]</span>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Their social security number is </span>
                  <span className="px-1.5 rounded border font-semibold" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' }}>[ENT_SSN_119]</span>
                  <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Please summarize their last login logs."</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="border-y py-12 mb-24" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.06)' }}>
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[{ val: '99.7%', label: 'PII Detection Rate' }, { val: '< 50ms', label: 'Latency Overhead' }, { val: 'Zero', label: 'Data Leak Events' }].map(m => (
              <div key={m.label}>
                <p className="text-4xl font-semibold mb-1 text-gradient-violet">{m.val}</p>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#948e9d' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-10 mb-24">
          <h2 className="text-4xl font-semibold text-center mb-4">Architected for <span className="text-gradient-violet">Absolute Privacy</span></h2>
          <p className="text-center mb-16 text-sm" style={{ color: '#948e9d' }}>Three layers of protection, zero configuration required</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'filter_center_focus', num: '1', title: 'Intercept', desc: 'Every LLM request is automatically routed through the Sentinel Gateway Proxy, requiring zero changes to your existing application code.', active: false },
              { icon: 'lock', num: '2', title: 'Tokenize & Vault', desc: 'Proprietary ML models identify 80+ PII entities. Data is swapped for deterministic tokens and stored in your private encryption vault.', active: true },
              { icon: 'refresh', num: '3', title: 'Re-Hydrate', desc: 'When the AI responds, Sentinel replaces tokens with original data before it hits the user interface. Seamless, private, and secure.', active: false },
            ].map(step => (
              <div key={step.num} className={`glass-card p-8 rounded-3xl transition-all duration-500 group ${step.active ? 'border-violet-500/30 glow-violet-sm' : 'hover:border-violet-400/30'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${step.active ? 'bg-primary-container' : 'border border-violet-400/20 bg-violet-400/10'}`}>
                  <span className="material-symbols-outlined text-sm" style={{ color: step.active ? '#1a0a4a' : '#cebdff', fontSize: '22px' }}>{step.icon}</span>
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${step.active ? 'text-gradient-violet' : ''}`}>{step.num}. {step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#cac4d4' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST / COMPLIANCE */}
        <section id="trust" className="max-w-7xl mx-auto px-10 mb-24">
          <div className="glass-card rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#cebdff' }}>Compliance Ready</p>
              <h3 className="text-2xl font-semibold">Built for global regulatory standards</h3>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {[{ name: 'GDPR', sub: 'Article 17' }, { name: 'CCPA', sub: '1798.105' }, { name: 'SOC2', sub: 'Type II Certified' }].map(c => (
                <div key={c.name} className="px-6 py-4 rounded-xl border flex flex-col items-center" style={{ background: '#2b2930', borderColor: 'rgba(73,69,82,0.4)' }}>
                  <span className="text-sm font-semibold tracking-widest">{c.name}</span>
                  <span className="text-xs mt-1" style={{ color: '#948e9d' }}>{c.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="max-w-7xl mx-auto px-10 pb-24">
          <div className="glass-card rounded-[2.5rem] py-20 px-10 text-center relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px]" style={{ background: 'rgba(167,139,250,0.08)' }}></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-[100px]" style={{ background: 'rgba(167,139,250,0.08)' }}></div>
            <h2 className="text-4xl font-semibold mb-4">Ready to secure your AI gateway?</h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#cac4d4' }}>Deploy in minutes, protect for a lifetime. Start your free enterprise trial today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login"><button className="btn-primary text-base px-10 py-4">Create Free Account</button></Link>
              <a href="mailto:security@sentinelgateway.io"><button className="btn-ghost text-base px-10 py-4">Talk to Security Expert</button></a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-16" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.08)' }}>
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-xl font-semibold tracking-wider mb-4 text-violet-100">Sentinel Gateway</div>
            <p className="text-sm leading-relaxed" style={{ color: '#948e9d' }}>Protecting enterprise data at the edge of intelligence. The standard for LLM data privacy.</p>
          </div>
          {[{ title: 'Product', links: ['Documentation','API Reference','Integrations','Enterprise FAQ'] },
            { title: 'Company', links: ['Security Portal','Privacy Policy','Terms of Service','Compliance Hub'] },
            { title: 'Live Status', links: [] }].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#e6e0ea' }}>{col.title}</h4>
              {col.links.length > 0 ? (
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-sm transition-colors hover:text-violet-300" style={{ color: '#948e9d' }}>{l}</a></li>)}
                </ul>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                  <span className="text-sm" style={{ color: '#cebdff' }}>All systems operational</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </footer>

      {/* DEMO MODAL */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }} onClick={() => setShowDemo(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-2xl w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Live Demo — PII Tokenization</h3>
              <button onClick={() => setShowDemo(false)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(167,139,250,0.1)', color: '#cebdff' }}>✕</button>
            </div>
            <div className="rounded-xl p-5 font-mono text-sm border mb-4" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.2)', minHeight: 100 }}>
              <span className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: '#948e9d' }}>INPUT_PROMPT_RAW</span>
              <span style={{ color: 'rgba(230,224,234,0.7)' }}>{typedText}<span className="animate-pulse">|</span></span>
            </div>
            <div className="rounded-xl p-5 font-mono text-sm border mb-6" style={{ background: '#0f0d14', borderColor: 'rgba(167,139,250,0.3)', minHeight: 100 }}>
              <span className="text-xs font-semibold tracking-widest uppercase block mb-2" style={{ color: '#948e9d' }}>OUTPUT_SHIELDED</span>
              <span style={{ color: 'rgba(230,224,234,0.4)' }}>"Update the profile for user </span>
              <span className="px-1.5 rounded border font-semibold" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' }}>[ENT_EMAIL_772]</span>
              <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Their SSN is </span>
              <span className="px-1.5 rounded border font-semibold" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderColor: 'rgba(167,139,250,0.3)' }}>[ENT_SSN_119]</span>
              <span style={{ color: 'rgba(230,224,234,0.4)' }}>. Summarize login logs."</span>
            </div>
            <Link href="/login" onClick={() => setShowDemo(false)}>
              <button className="btn-primary w-full py-3">Try It Live on Dashboard →</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
