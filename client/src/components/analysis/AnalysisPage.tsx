import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Brain, TrendingUp, TrendingDown, Moon, Clock,
  RefreshCw, Zap, BarChart3, Calendar, ArrowLeft,
  Flame, Sparkles, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface Session {
  id: string;
  created_at: string;
  username: string;
  dilemma: string;
  brain_rot_score: number;
  chaos_level: string;
  node_count: number;
  edge_case_count: number;
  path_count: number;
  sentiment: string;
  session_hour: number;
  revisit_hash: string;
}

interface AnalysisPageProps {
  username: string;
  onBack: () => void;
}

// ──── Helpers ────


const chaosColors: Record<string, string> = {
  Mild: '#22c55e', Medium: '#facc15', High: '#f97316', Extreme: '#ef4444', Biohazard: '#d946ef',
};
const sentimentColors: Record<string, string> = {
  Anxious: '#ef4444', Chaotic: '#d946ef', Neutral: '#94a3b8', Calm: '#22c55e', Resolved: '#00f0ff',
};

// ──── Stat Card ────
function StatCard({ icon, label, value, sub, color = '#b026ff' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
      {sub && <div className="text-[10px] text-gray-500">{sub}</div>}
    </div>
  );
}

// ──── Mini bar chart ────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-16 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] text-gray-500 w-6 text-right shrink-0">{value}</span>
    </div>
  );
}

// ──── Dot grid for days ────
function ActivityDot({ sessions, day }: { sessions: Session[]; day: Date }) {
  const count = sessions.filter(s => {
    const d = new Date(s.created_at);
    return d.toDateString() === day.toDateString();
  }).length;
  const intensity = count === 0 ? 'bg-white/5' : count === 1 ? 'bg-purple-700' : count >= 3 ? 'bg-[var(--color-neon-purple)]' : 'bg-purple-500';
  return <div className={`w-3 h-3 rounded-sm ${intensity}`} title={`${count} sessions on ${day.toDateString()}`} />;
}

export default function AnalysisPage({ username, onBack }: AnalysisPageProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('username', username)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) setSessions(data as Session[]);
      setLoading(false);
    };
    fetchSessions();
  }, [username]);

  // ──── Filter by range ────
  const now = new Date();
  const cutoff = new Date(now);
  if (range === 'week') cutoff.setDate(now.getDate() - 7);
  else cutoff.setDate(now.getDate() - 30);

  const filtered = sessions.filter(s => new Date(s.created_at) >= cutoff);
  const total = filtered.length;

  // ──── Computed metrics ────
  const avgBrainRot = total > 0 ? Math.round(filtered.reduce((a, s) => a + s.brain_rot_score, 0) / total) : 0;
  const totalEdgeCases = filtered.reduce((a, s) => a + s.edge_case_count, 0);

  // Sleep impact: sessions between 11pm–4am
  const lateSessions = filtered.filter(s => s.session_hour >= 23 || s.session_hour <= 4).length;
  const sleepImpactPct = total > 0 ? Math.round((lateSessions / total) * 100) : 0;

  // Decision delay: avg edge cases / node count = complexity ratio
  const avgComplexity = total > 0
    ? Math.round(filtered.reduce((a, s) => a + (s.node_count > 0 ? s.edge_case_count / s.node_count : 0), 0) / total * 100)
    : 0;

  // Loop counter: repeated hashes
  const hashCounts: Record<string, number> = {};
  sessions.forEach(s => { hashCounts[s.revisit_hash] = (hashCounts[s.revisit_hash] || 0) + 1; });
  const loopCount = Object.values(hashCounts).filter(c => c > 1).length;

  // Sentiment velocity (last 7 vs prior 7 sessions)
  const last7 = sessions.slice(0, 7);
  const prev7 = sessions.slice(7, 14);
  const sentimentScore = (arr: Session[]) => arr.reduce((a, s) => {
    const scores: Record<string, number> = { Resolved: 5, Calm: 4, Neutral: 3, Anxious: 2, Chaotic: 1 };
    return a + (scores[s.sentiment] || 3);
  }, 0) / (arr.length || 1);
  const velocityNow = sentimentScore(last7);
  const velocityPrev = sentimentScore(prev7);
  const velocityDelta = +(velocityNow - velocityPrev).toFixed(1);

  // Chaos distribution
  const chaosDist: Record<string, number> = {};
  filtered.forEach(s => { chaosDist[s.chaos_level] = (chaosDist[s.chaos_level] || 0) + 1; });
  const chaosMax = Math.max(...Object.values(chaosDist), 1);

  // Peak hours (0-23)
  const hourDist: number[] = Array(24).fill(0);
  filtered.forEach(s => { hourDist[s.session_hour]++; });
  const peakHour = hourDist.indexOf(Math.max(...hourDist));

  // Sentiment distribution
  const sentDist: Record<string, number> = {};
  filtered.forEach(s => { sentDist[s.sentiment] = (sentDist[s.sentiment] || 0) + 1; });

  // Last 30 days grid
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d;
  });

  // Progress indicator
  const progressMsg = () => {
    if (total === 0) return { text: 'No data yet – dump your first overthought!', icon: <Sparkles size={14} />, color: '#b026ff' };
    if (velocityDelta > 0.5) return { text: `You're improving! Sentiment up ${velocityDelta} pts`, icon: <TrendingUp size={14} />, color: '#22c55e' };
    if (velocityDelta < -0.5) return { text: `Rough patch bestie, sentiment down ${Math.abs(velocityDelta)} pts`, icon: <TrendingDown size={14} />, color: '#ef4444' };
    return { text: 'Holding steady – consistent energy', icon: <CheckCircle2 size={14} />, color: '#facc15' };
  };
  const progress = progressMsg();

  return (
    <div className="flex-1 w-full overflow-y-auto bg-[#0b0c10]" style={{ minHeight: 0 }}>
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors mb-3">
              <ArrowLeft size={13} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-pink)] flex items-center justify-center text-xl font-extrabold">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">{username}</h1>
                <p className="text-xs text-gray-500">Anonymous Overthinker · Brain Rot Tracker</p>
              </div>
            </div>
          </div>

          {/* Range selector */}
          <div className="flex bg-[#111827] border border-white/10 rounded-full p-0.5 mt-8">
            <button onClick={() => setRange('week')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${range === 'week' ? 'bg-[var(--color-neon-purple)] text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
              Week
            </button>
            <button onClick={() => setRange('month')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${range === 'month' ? 'bg-[var(--color-neon-purple)] text-white font-bold' : 'text-gray-400 hover:text-white'}`}>
              Month
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-8 h-8 border-2 border-[var(--color-neon-purple)]/30 border-t-[var(--color-neon-purple)] rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Loading your brain history…</span>
          </div>
        ) : (
          <>
            {/* Progress banner */}
            <div className="border rounded-xl px-4 py-3 flex items-center gap-3" style={{ borderColor: progress.color + '33', background: progress.color + '0f' }}>
              <span style={{ color: progress.color }}>{progress.icon}</span>
              <span className="text-sm font-semibold" style={{ color: progress.color }}>{progress.text}</span>
            </div>

            {/* Key metrics grid */}
            <div>
              <h2 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 size={13} /> Key Metrics · {range === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard icon={<Brain size={14} />} label="Overthought" value={total} sub="total sessions" color="#b026ff" />
                <StatCard icon={<Flame size={14} />} label="Avg Brain Rot" value={`${avgBrainRot}/10`} sub="per session" color="#f97316" />
                <StatCard icon={<Zap size={14} />} label="Edge Cases" value={totalEdgeCases} sub="total explored" color="#facc15" />
                <StatCard icon={<Moon size={14} />} label="Sleep Impact" value={`${sleepImpactPct}%`} sub="sessions after 11pm" color="#818cf8" />
                <StatCard icon={<Clock size={14} />} label="Decision Delay" value={`${avgComplexity}%`} sub="complexity ratio" color="#0ea5e9" />
                <StatCard icon={<RefreshCw size={14} />} label="Loop Counter" value={loopCount} sub="repeated dilemmas" color="#d946ef" />
              </div>
            </div>

            {/* Sentiment velocity */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={13} /> Sentiment Velocity
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-extrabold" style={{ color: velocityDelta >= 0 ? '#22c55e' : '#ef4444' }}>
                  {velocityDelta >= 0 ? '+' : ''}{velocityDelta}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {velocityDelta > 0 ? '↗ Getting better' : velocityDelta < 0 ? '↘ Getting worse' : '→ Holding steady'}
                  </div>
                  <div className="text-[10px] text-gray-500">vs previous {range === 'week' ? 'week' : 'period'}</div>
                </div>
              </div>
              {/* Sentiment breakdown */}
              <div className="mt-4 flex flex-col gap-2">
                {Object.entries(sentDist).map(([s, c]) => (
                  <MiniBar key={s} label={s} value={c} max={total} color={sentimentColors[s] || '#888'} />
                ))}
              </div>
            </div>

            {/* Chaos distribution */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle size={13} /> Chaos Level Distribution
              </h3>
              <div className="flex flex-col gap-2">
                {['Mild', 'Medium', 'High', 'Extreme', 'Biohazard'].map(level => (
                  <MiniBar key={level} label={level} value={chaosDist[level] || 0} max={chaosMax} color={chaosColors[level]} />
                ))}
              </div>
            </div>

            {/* Activity heatmap */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={13} /> Overthinking Activity · Last 30 Days
              </h3>
              <div className="flex flex-wrap gap-1">
                {last30Days.map((day, i) => (
                  <ActivityDot key={i} sessions={sessions} day={day} />
                ))}
              </div>
              <div className="flex gap-3 mt-3 text-[9px] text-gray-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/5 inline-block" />None</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-700 inline-block" />1</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />2</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[var(--color-neon-purple)] inline-block" />3+</span>
              </div>
            </div>

            {/* Peak overthinking hour */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="text-4xl">🕐</div>
              <div>
                <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Peak Overthinking Hour</div>
                <div className="text-xl font-extrabold text-white mt-1">
                  {total > 0 ? `${peakHour.toString().padStart(2,'0')}:00` : '--:--'}
                </div>
                <div className="text-[10px] text-gray-500">
                  {peakHour >= 23 || peakHour <= 4
                    ? '🌙 Late-night spiral zone — get some sleep bestie'
                    : peakHour >= 8 && peakHour <= 12
                    ? '☀️ Morning anxiety mode activated'
                    : '🌆 Afternoon decision paralysis'}
                </div>
              </div>
            </div>

            {/* Recent sessions */}
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                <Brain size={13} /> Recent Brain Dumps
              </h3>
              <div className="flex flex-col gap-2">
                {sessions.slice(0, 8).map((s) => (
                  <div key={s.id} className="bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2.5 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{s.dilemma}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                        style={{ background: (chaosColors[s.chaos_level] || '#888') + '22', color: chaosColors[s.chaos_level] || '#888' }}>
                        {s.chaos_level}
                      </span>
                      <span className="text-[9px] bg-[var(--color-neon-pink)]/10 text-[var(--color-neon-pink)] px-1.5 py-0.5 rounded-full">
                        🧠 {s.brain_rot_score}
                      </span>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">No sessions yet. Start dumping your brain-rot!</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
