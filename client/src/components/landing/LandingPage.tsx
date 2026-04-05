import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Brain, Zap, Users, TreePine, BarChart3, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

// ── Floating particle ──
function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute rounded-full pointer-events-none opacity-30 blur-sm animate-pulse" style={style} />;
}

// ── Feature card ──
function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div
      className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 hover:translate-y-[-4px] transition-all duration-300"
      style={{ boxShadow: `0 0 30px ${color}11` }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '20', color }}>
        {icon}
      </div>
      <h3 className="text-white font-bold text-sm">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Typewriter hook ──
function useTypewriter(texts: string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx(i => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return display;
}

const OVERTHINKING_LINES = [
  '"should i text them back or wait 47 minutes?"',
  '"what if I chose the wrong font for my bio?"',
  '"is the vibe check real or am I delulu?"',
  '"brain said we\'re not sleeping tonight bestie"',
  '"they didn\'t use a period... is it over?"',
];

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const typed = useTypewriter(OVERTHINKING_LINES, 60, 2200);
  const aboutRef = useRef<HTMLElement>(null);

  const particles = [
    { width: 180, height: 180, background: '#b026ff', top: '5%', left: '10%', animationDuration: '6s' },
    { width: 120, height: 120, background: '#ff2a85', top: '15%', right: '8%', animationDuration: '8s' },
    { width: 80, height: 80, background: '#00f0ff', bottom: '30%', left: '5%', animationDuration: '5s' },
    { width: 60, height: 60, background: '#ff2a85', top: '40%', right: '12%', animationDuration: '7s' },
    { width: 100, height: 100, background: '#b026ff', bottom: '10%', right: '20%', animationDuration: '9s' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white overflow-x-hidden">

      {/* ──── HERO SECTION ──── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Ambient blobs */}
        {particles.map((p, i) => (
          <Particle key={i} style={{ ...p, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.12 }} />
        ))}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Nav */}
        <nav className="absolute top-0 w-full flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#b026ff] to-[#ff2a85] flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">BrainDump</span>
            <span className="text-[9px] bg-[#b026ff]/20 text-[#b026ff] px-1.5 py-0.5 rounded-full font-bold ml-1">BETA</span>
          </div>
          <button
            onClick={onEnterApp}
            className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-1.5 rounded-full transition-all font-semibold"
          >
            Open App →
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl gap-6 mt-16">
          {/* Badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-400">
            <Sparkles size={11} className="text-[#b026ff]" />
            <span>your brain is NOT going to win this time</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff2a85] via-[#b026ff] to-[#00f0ff]">
              Stop spiraling.
            </span>
            <br />
            <span className="text-white">Start deciding.</span>
          </h1>

          {/* Typewriter sub */}
          <div className="h-8 flex items-center">
            <p className="text-gray-400 text-base font-mono">
              {typed}<span className="animate-pulse text-[#b026ff]">|</span>
            </p>
          </div>

          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            BrainDump turns your chaotic overthinking into a <span className="text-white font-semibold">decision tree</span> you can actually navigate. 
            AI-powered, Gen-Z-approved, no cap.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={onEnterApp}
              className="group bg-gradient-to-r from-[#b026ff] to-[#ff2a85] text-white px-7 py-3 rounded-xl font-extrabold text-sm shadow-[0_0_30px_rgba(176,38,255,0.4)] hover:shadow-[0_0_50px_rgba(176,38,255,0.6)] transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              Let's Dump 🧠
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-xl transition-all"
            >
              what even is this? ↓
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 text-[10px] text-gray-600 mt-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI-powered trees</span>
            <span>·</span>
            <span>anonymous by default</span>
            <span>·</span>
            <span>free to use</span>
          </div>
        </div>

        {/* Floating mock cards */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 opacity-40 pointer-events-none select-none">
          {['Extreme 🔥', 'Chaotic 💀', 'Mild ✨'].map((tag, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-gray-400 backdrop-blur">
              {tag}
            </div>
          ))}
        </div>
      </section>

      {/* ──── ABOUT SECTION ──── */}
      <section ref={aboutRef} className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-16">

          {/* Section header */}
          <div className="text-center flex flex-col gap-4">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#b026ff]">so what's the deal</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Your brain on{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                overthinking mode
              </span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
              You know the feeling — you've been staring at a message draft for 40 minutes, 
              refreshed the situation in your head 67 times, and somehow still can't decide.{' '}
              <span className="text-white font-medium">BrainDump gets it.</span> And then it maps it all out for you, no cap.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <FeatureCard
              icon={<Brain size={18} />}
              color="#b026ff"
              title="AI Decision Trees"
              desc="Dump your dilemma, watch AI break it into paths, outcomes, and edge cases in seconds. Like a therapist but it actually responds."
            />
            <FeatureCard
              icon={<Zap size={18} />}
              color="#ff2a85"
              title="Brain Rot Score™"
              desc="Every path gets scored on chaos, vibes, and how absolutely unhinged the decision is. Self-awareness hit different fr."
            />
            <FeatureCard
              icon={<Users size={18} />}
              color="#00f0ff"
              title="Community Feed"
              desc="Share your spiral with the world anonymously. Upvote whoever is going through it the most. real ones know."
            />
            <FeatureCard
              icon={<BarChart3 size={18} />}
              color="#facc15"
              title="Overthinking Analytics"
              desc="Weekly reports on how often you spiral, when you're worst (spoiler: 2am), and if you're actually getting better. The data doesn't lie bestie."
            />
          </div>

          {/* How it works */}
          <div className="w-full bg-[#0d1117] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-center">how it works (it's actually simple fr)</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                { step: '01', label: 'Dump the thought', desc: 'Type whatever is living rent-free in your head', emoji: '💬', color: '#b026ff' },
                { step: '02', label: 'AI maps it out', desc: 'Watch your spiral become a structured decision tree', emoji: '🕸️', color: '#ff2a85' },
                { step: '03', label: 'Pick your path', desc: 'Unlock paths one by one. AI even tells you the best move.', emoji: '🔓', color: '#00f0ff' },
              ].map(({ step, label, desc, emoji, color }) => (
                <div key={step} className="flex-1 flex flex-col items-center text-center gap-2">
                  <div className="text-3xl">{emoji}</div>
                  <div className="text-[9px] uppercase font-bold tracking-widest" style={{ color }}>{step}</div>
                  <div className="text-white font-bold text-xs">{label}</div>
                  <div className="text-gray-500 text-[10px] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center flex flex-col items-center gap-5">
            <div className="text-2xl font-extrabold">
              bestie, your dilemma won't{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff2a85] to-[#b026ff]">solve itself</span> 💀
            </div>
            <p className="text-gray-500 text-xs max-w-sm">stop doom-scrolling, start decision-making. it's giving main character energy actually.</p>
            <button
              onClick={onEnterApp}
              className="group bg-gradient-to-r from-[#b026ff] to-[#ff2a85] text-white px-8 py-3.5 rounded-xl font-extrabold shadow-[0_0_30px_rgba(176,38,255,0.4)] hover:shadow-[0_0_50px_rgba(176,38,255,0.6)] transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm"
            >
              Let's Dump 🧠
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-gray-600">anonymous by default · no sign-up required · the vibes are free</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#b026ff] to-[#ff2a85] flex items-center justify-center">
              <Brain size={10} className="text-white" />
            </div>
            <span className="text-xs font-bold text-gray-500">BrainDump</span>
          </div>
          <span className="text-[10px] text-gray-700">built for overthinkers, by overthinkers 🫡</span>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>
    </div>
  );
}
