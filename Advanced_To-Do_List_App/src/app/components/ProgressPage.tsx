import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, CheckCircle2, Target, Calendar, Flame, Trophy, BarChart3, Zap, Star } from 'lucide-react';
import { Task, Category } from '../types';

interface ProgressPageProps {
  tasks: Task[];
  theme: 'light' | 'dark';
  categories: Category[];
}

interface DailyStats {
  date: string;
  completed: number;
  created: number;
  displayDate: string;
}

const QUOTES = [
  { text: "Small steps every day lead to massive results.", author: "— Progress mindset" },
  { text: "Done is better than perfect. Keep moving.", author: "— Ship it" },
  { text: "Your future self is cheering you on right now.", author: "— Keep going" },
  { text: "Consistency beats motivation every single time.", author: "— Daily discipline" },
  { text: "Every task you finish is a vote for who you want to become.", author: "— Identity-based habits" },
  { text: "The secret is to get started. The rest follows.", author: "— Mark Twain" },
];

function AnimatedBackground({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const COLORS = isDark
      ? ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
      : ['#6366f1', '#8b5cf6', '#059669', '#d97706', '#db2777', '#0891b2'];

    type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string; life: number; maxLife: number };

    const spawn = (): P => ({
      x: Math.random() * (canvas.width || 800),
      y: (canvas.height || 600) + 10,
      vy: -(0.5 + Math.random() * 1.4),
      vx: (Math.random() - 0.5) * 0.7,
      r: 0.8 + Math.random() * 2.2,
      alpha: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 100 + Math.random() * 200,
    });

    const particles: P[] = Array.from({ length: 80 }, () => {
      const p = spawn();
      p.y = Math.random() * (canvas.height || 600);
      p.life = Math.random() * p.maxLife;
      return p;
    });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        p.alpha = t < 0.2 ? t / 0.2 : t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
        if (p.life >= p.maxLife || p.y < -10) Object.assign(p, spawn());

        ctx.save();
        ctx.globalAlpha = p.alpha * (isDark ? 0.75 : 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isDark ? 10 : 5;
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [isDark]);

  const aurora = isDark
    ? [
        { w: 700, h: 320, l: '-12%', t: '-8%',  c: 'rgba(59,130,246,0.1)',   dur: 20, dl: 0 },
        { w: 550, h: 280, l:  '45%', t: '-6%',  c: 'rgba(139,92,246,0.1)',   dur: 27, dl: -6 },
        { w: 480, h: 480, l:  '68%', t:  '25%', c: 'rgba(16,185,129,0.08)',  dur: 23, dl: -10 },
        { w: 500, h: 320, l:  '-8%', t:  '48%', c: 'rgba(245,158,11,0.07)',  dur: 30, dl: -14 },
        { w: 400, h: 400, l:  '28%', t:  '58%', c: 'rgba(236,72,153,0.07)',  dur: 19, dl: -4 },
        { w: 320, h: 320, l:  '80%', t:  '65%', c: 'rgba(6,182,212,0.07)',   dur: 25, dl: -8 },
      ]
    : [
        { w: 700, h: 320, l: '-12%', t: '-8%',  c: 'rgba(99,102,241,0.08)',  dur: 20, dl: 0 },
        { w: 550, h: 280, l:  '45%', t: '-6%',  c: 'rgba(139,92,246,0.07)',  dur: 27, dl: -6 },
        { w: 480, h: 480, l:  '68%', t:  '25%', c: 'rgba(16,185,129,0.06)',  dur: 23, dl: -10 },
        { w: 500, h: 320, l:  '-8%', t:  '48%', c: 'rgba(245,158,11,0.06)',  dur: 30, dl: -14 },
        { w: 400, h: 400, l:  '28%', t:  '58%', c: 'rgba(236,72,153,0.06)',  dur: 19, dl: -4 },
        { w: 320, h: 320, l:  '80%', t:  '65%', c: 'rgba(6,182,212,0.06)',   dur: 25, dl: -8 },
      ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {aurora.map((o, i) => (
        <motion.div key={i} className="absolute rounded-full blur-3xl"
          style={{ width: o.w, height: o.h, left: o.l, top: o.t, background: o.c }}
          animate={{ x: [0, 50, -35, 25, 0], y: [0, -35, 30, -18, 0], scale: [1, 1.18, 0.88, 1.1, 1], rotate: [0, 20, -12, 8, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.dl }}
        />
      ))}

      {[
        { size: 560, color: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(99,102,241,0.05)', dur: 9,  dl: 0,  scale: [0.75, 1.45, 0.75] },
        { size: 340, color: isDark ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.06)', dur: 7,  dl: -3, scale: [1.25, 0.65, 1.25] },
        { size: 200, color: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.05)', dur: 5,  dl: -1, scale: [0.9,  1.5,  0.9] },
      ].map((ring, i) => (
        <motion.div key={`ring-${i}`} className="absolute rounded-full border"
          style={{
            width: ring.size, height: ring.size,
            left: '50%', top: '15%',
            marginLeft: -ring.size / 2,
            borderColor: ring.color,
            borderWidth: 1,
          }}
          animate={{ scale: ring.scale, opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: ring.dur, repeat: Infinity, ease: 'easeInOut', delay: ring.dl }}
        />
      ))}

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function AnimatedCounter({ value, duration = 1.2 }: { value: number | string; duration?: number }) {
  const numVal = parseFloat(String(value));
  const isFloat = String(value).includes('.');
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const p = Math.min((ts - startTime.current) / 1000 / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(numVal * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [numVal, duration]);
  return <>{isFloat ? display.toFixed(1) : Math.round(display)}</>;
}

function CompletionRing({ rate, theme }: { rate: number; theme: 'light' | 'dark' }) {
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="10" />
        <motion.circle cx="72" cy="72" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (rate / 100) * circ }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rate}%</span>
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>done</span>
      </div>
    </div>
  );
}

function MotivationalBanner({ theme }: { theme: 'light' | 'dark' }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`relative overflow-hidden rounded-2xl px-8 py-6 ${
      theme === 'dark' ? 'bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 border border-white/5' : 'bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-100'
    }`}>
      <motion.div className="absolute inset-0 opacity-20"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
      />
      <div className="flex items-start gap-4">
        <motion.div animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.2, 1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="mt-0.5 shrink-0">
          <Zap className="w-5 h-5 text-yellow-400" />
        </motion.div>
        <div className="min-h-[52px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
              <p className={`text-base font-medium leading-snug ${theme === 'dark' ? 'text-white/90' : 'text-gray-800'}`}>
                "{QUOTES[idx].text}"
              </p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{QUOTES[idx].author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="ml-auto flex items-center gap-1 self-center shrink-0">
          {QUOTES.map((_, i) => (
            <motion.div key={i} className="rounded-full cursor-pointer"
              animate={{ width: i === idx ? 16 : 6, background: i === idx ? (theme === 'dark' ? '#818cf8' : '#6366f1') : (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') }}
              style={{ height: 6 }} onClick={() => setIdx(i)} transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AreaChart({ data, isDark }: { data: { label: string; value: number }[]; isDark: boolean }) {
  const W = 500, H = 180, PL = 32, PR = 12, PT = 12, PB = 28;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const max = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => ({
    x: PL + (i / Math.max(data.length - 1, 1)) * plotW,
    y: PT + plotH - (d.value / max) * plotH,
    label: d.label, value: d.value,
  }));

  const linePath = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cpx} ${prev.y.toFixed(1)} ${cpx} ${pt.y.toFixed(1)} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');
  const areaPath = pts.length > 0
    ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PT + plotH).toFixed(1)} Z`
    : '';

  const xTicks = pts.filter((_, i) => i % 5 === 0 || i === pts.length - 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f, idx) => ({ val: Math.round(max * f), y: PT + plotH - f * plotH, idx }));
  const tc = isDark ? '#4b5563' : '#d1d5db';
  const lc = isDark ? '#6b7280' : '#9ca3af';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="svgAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map(t => (
        <g key={`area-ytick-${t.idx}`}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke={tc} strokeWidth="0.5" strokeDasharray="3 3" />
          <text x={PL - 4} y={t.y + 3.5} textAnchor="end" fontSize="9" fill={lc}>{t.val}</text>
        </g>
      ))}
      {areaPath && <path d={areaPath} fill="url(#svgAreaGrad)" />}
      {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {xTicks.map(pt => (
        <text key={`x-${pt.label}`} x={pt.x} y={H - 6} textAnchor="middle" fontSize="9" fill={lc}>{pt.label}</text>
      ))}
      {pts.filter(p => p.value > 0).map(pt => (
        <circle key={`dot-${pt.label}`} cx={pt.x} cy={pt.y} r="2.5" fill="#10b981" />
      ))}
    </svg>
  );
}

function BarChart({ data, isDark }: { data: { label: string; added: number; done: number }[]; isDark: boolean }) {
  const W = 500, H = 180, PL = 32, PR = 12, PT = 12, PB = 28;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => [d.added, d.done]), 1);
  const barGroup = plotW / data.length;
  const barW = Math.max((barGroup - 4) / 2, 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f, idx) => ({ val: Math.round(maxVal * f), y: PT + plotH - f * plotH, idx }));
  const xTicks = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);
  const tc = isDark ? '#4b5563' : '#d1d5db';
  const lc = isDark ? '#6b7280' : '#9ca3af';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none">
      {yTicks.map(t => (
        <g key={`bar-ytick-${t.idx}`}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke={tc} strokeWidth="0.5" strokeDasharray="3 3" />
          <text x={PL - 4} y={t.y + 3.5} textAnchor="end" fontSize="9" fill={lc}>{t.val}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const groupX = PL + i * barGroup + 2;
        const addedH = (d.added / maxVal) * plotH;
        const doneH = (d.done / maxVal) * plotH;
        return (
          <g key={`bar-${d.label}-${i}`}>
            {d.added > 0 && <rect x={groupX} y={PT + plotH - addedH} width={barW} height={addedH} fill="#3b82f6" rx="2" opacity="0.85" />}
            {d.done > 0 && <rect x={groupX + barW + 1} y={PT + plotH - doneH} width={barW} height={doneH} fill="#10b981" rx="2" opacity="0.85" />}
          </g>
        );
      })}
      {xTicks.map((d, i) => {
        const idx = data.indexOf(d);
        const x = PL + idx * barGroup + barGroup / 2;
        return <text key={`xl-${d.label}-${i}`} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill={lc}>{d.label}</text>;
      })}
    </svg>
  );
}

function RadarChart({ data, isDark }: { data: { subject: string; all: number; done: number; ongoing: number }[]; isDark: boolean }) {
  const cx = 150, cy = 150, R = 100, n = data.length;
  if (n === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.all, d.done, d.ongoing]), 1);
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, val: number) => {
    const r = (val / maxVal) * R;
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };
  const polyPts = (key: 'all' | 'done' | 'ongoing') =>
    data.map((d, i) => pt(i, d[key])).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const tc = isDark ? '#374151' : '#e5e7eb';
  const lc = isDark ? '#6b7280' : '#9ca3af';

  return (
    <svg viewBox="0 0 300 300" className="w-full" style={{ maxHeight: 300 }}>
      {gridLevels.map(f => (
        <polygon key={f} points={data.map((_, i) => { const p = pt(i, maxVal * f); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')}
          fill="none" stroke={tc} strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const outer = pt(i, maxVal);
        return <line key={`axis-${i}`} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke={tc} strokeWidth="1" />;
      })}
      <polygon points={polyPts('all')}     fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" />
      <polygon points={polyPts('done')}    fill="#10b981" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.5" />
      <polygon points={polyPts('ongoing')} fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />
      {data.map((d, i) => {
        const labelR = R + 18;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        return (
          <text key={`lbl-${d.subject}`} x={lx.toFixed(1)} y={ly.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={lc}
            style={{ fontWeight: 500 }}>
            {d.subject.length > 10 ? d.subject.slice(0, 9) + '…' : d.subject}
          </text>
        );
      })}
    </svg>
  );
}

export function ProgressPage({ tasks, theme, categories }: ProgressPageProps) {
  const isDark = theme === 'dark';

  const tasksCompletedToday = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;
  }, [tasks]);

  const dailyStats = useMemo((): DailyStats[] => {
    const stats: DailyStats[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i); date.setHours(0, 0, 0, 0);
      const next = new Date(date); next.setDate(date.getDate() + 1);
      const completed = tasks.filter(t => { if (!t.completedAt) return false; const d = new Date(t.completedAt); return d >= date && d < next; }).length;
      const created = tasks.filter(t => { const d = new Date(t.createdAt); return d >= date && d < next; }).length;
      stats.push({ date: date.toISOString(), completed, created, displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    return stats;
  }, [tasks]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const check = new Date(today); check.setDate(today.getDate() - i); check.setHours(0, 0, 0, 0);
      const next = new Date(check); next.setDate(check.getDate() + 1);
      const has = tasks.some(t => { if (!t.completedAt) return false; const d = new Date(t.completedAt); return d >= check && d < next; });
      if (has) streak++; else break;
    }
    return streak;
  }, [tasks]);

  const weeklyAverage = useMemo(() => {
    const total = dailyStats.slice(-7).reduce((s, d) => s + d.completed, 0);
    return (total / 7).toFixed(1);
  }, [dailyStats]);

  const totalCompleted = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const bestDay = useMemo(() => {
    if (!dailyStats.length) return { date: '—', count: 0 };
    const best = dailyStats.reduce((m, d) => d.completed > m.completed ? d : m, dailyStats[0]);
    return { date: best.displayDate, count: best.completed };
  }, [dailyStats]);

  const monthTotal = dailyStats.reduce((s, d) => s + d.completed, 0);

  const radarData = useMemo(() => categories.map(cat => ({
    subject: cat.name, color: cat.color,
    all: tasks.filter(t => t.categoryId === cat.id).length,
    done: tasks.filter(t => t.completed && t.categoryId === cat.id).length,
    ongoing: tasks.filter(t => !t.completed && t.categoryId === cat.id).length,
  })), [tasks, categories]);

  const areaTrendData = useMemo(() => dailyStats.map(d => ({ label: d.displayDate, value: d.completed })), [dailyStats]);
  const barCompareData = useMemo(() => dailyStats.map(d => ({ label: d.displayDate, added: d.created, done: d.completed })), [dailyStats]);

  const statCards = [
    { title: 'Done Today',      value: tasksCompletedToday, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-400',  glow: isDark ? 'shadow-emerald-500/20' : 'shadow-emerald-200', ring: 'ring-emerald-500/20', suffix: tasksCompletedToday === 1 ? 'task' : 'tasks' },
    { title: 'Current Streak',  value: currentStreak,       icon: Flame,        gradient: 'from-orange-500 to-amber-400',   glow: isDark ? 'shadow-orange-500/20'  : 'shadow-orange-200',  ring: 'ring-orange-500/20',  suffix: currentStreak === 1 ? 'day' : 'days' },
    { title: 'Weekly Avg',      value: weeklyAverage,       icon: TrendingUp,   gradient: 'from-blue-500 to-cyan-400',      glow: isDark ? 'shadow-blue-500/20'    : 'shadow-blue-200',    ring: 'ring-blue-500/20',    suffix: 'per day' },
    { title: 'All Time',        value: totalCompleted,      icon: Trophy,       gradient: 'from-violet-500 to-purple-400',  glow: isDark ? 'shadow-violet-500/20'  : 'shadow-violet-200',  ring: 'ring-violet-500/20',  suffix: 'completed' },
  ];

  const card = `rounded-2xl p-6 ring-1 shadow-xl ${isDark ? 'bg-gray-900/70 ring-white/5 backdrop-blur-sm' : 'bg-white/80 ring-black/5 backdrop-blur-sm'}`;

  return (
    <div className="relative space-y-6">
      <AnimatedBackground theme={theme} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-center gap-4">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
          <BarChart3 className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
            Progress & Analytics
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your productivity story, visualised</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Live</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <MotivationalBanner theme={theme} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className={`relative overflow-hidden rounded-2xl p-5 ring-1 ${stat.ring} shadow-xl ${stat.glow} ${isDark ? 'bg-gray-900/70 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                <div className="relative flex items-start justify-between">
                  <div className="space-y-1">
                    <p className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <AnimatedCounter value={stat.value} />
                      </span>
                      {stat.suffix && <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.suffix}</span>}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <motion.div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${stat.gradient}`}
                  initial={{ width: '0%' }} animate={{ width: '100%' }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Completion Trend</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last 30 days</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</span>
              </div>
            </div>
            <AreaChart data={areaTrendData} isDark={isDark} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Created vs Completed</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last 30 days</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400" /><span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Created</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Done</span></div>
              </div>
            </div>
            <BarChart data={barCompareData} isDark={isDark} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className={card}>
          <h3 className={`font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex flex-col items-center gap-2">
              <CompletionRing rate={completionRate} theme={theme} />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completion rate</span>
            </div>
            {[
              { icon: Calendar, label: 'Best Day',    value: bestDay.date,   sub: `${bestDay.count} tasks`,  color: isDark ? 'text-blue-400'    : 'text-blue-600',    bg: isDark ? 'bg-blue-500/10'    : 'bg-blue-50' },
              { icon: Target,   label: 'This Month',  value: monthTotal,     sub: 'tasks completed',          color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
              { icon: Star,     label: 'Streak',      value: `${currentStreak}d`, sub: currentStreak > 0 ? 'keep it up!' : 'start today', color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
            ].map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div key={tile.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.08 }} whileHover={{ scale: 1.03 }}
                  className={`rounded-xl p-4 ${tile.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${tile.color}`} />
                    <span className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tile.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tile.value}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tile.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className={card}>
          <div className="mb-5">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Task Distribution by Category</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overview across all categories</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 text-xs mb-1">
                {[{ color: '#3b82f6', label: 'All' }, { color: '#10b981', label: 'Done' }, { color: '#f59e0b', label: 'Ongoing' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{l.label}</span>
                  </div>
                ))}
              </div>
              <RadarChart data={radarData} isDark={isDark} />
            </div>

            <div className="space-y-3">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category Breakdown</p>
              {radarData.map((data, i) => {
                const pct = data.all > 0 ? Math.round((data.done / data.all) * 100) : 0;
                return (
                  <motion.div key={data.subject} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.08 }} whileHover={{ x: 4 }}
                    className={`p-4 rounded-xl border transition-colors ${isDark ? 'bg-gray-800/50 border-gray-700/60 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{pct}%</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{data.all} total</span>
                      </div>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: data.color }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.7 + i * 0.1, ease: 'easeOut' }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{data.done} done</span></div>
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{data.ongoing} active</span></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
