import React, { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  Zap,
  Clock,
} from 'lucide-react';
import { Task, Category } from '../types';

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface ProgressPageProps {
  tasks: Task[];
  theme: 'light' | 'dark';
  categories: Category[];
}

interface DailyStats {
  ts: number;
  completed: number;
  created: number;
  label: string;
}

type Range = 7 | 30 | 90;
const RANGES: Range[] = [7, 30, 90];
const DAY_MS = 86_400_000;

const QUOTES = [
  { text: 'Small steps every day lead to massive results.', author: '— Progress mindset' },
  { text: 'Done is better than perfect. Keep moving.', author: '— Ship it' },
  { text: 'Your future self is cheering you on right now.', author: '— Keep going' },
  { text: 'Consistency beats motivation every single time.', author: '— Daily discipline' },
  { text: 'Every task you finish is a vote for who you want to become.', author: '— Identity-based habits' },
  { text: 'The secret is to get started. The rest follows.', author: '— Mark Twain' },
];

/* ------------------------------------------------------------------ */
/* Date helpers (all local-time, DST-safe)                             */
/* ------------------------------------------------------------------ */

const startOfDay = (d: Date | string | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const addDays = (ts: number, n: number) => {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return d.getTime();
};

const fmtDay = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/* ------------------------------------------------------------------ */
/* Animated background (respects reduced motion, pauses when hidden)   */
/* ------------------------------------------------------------------ */

const AURORA = [
  { w: 700, h: 320, l: '-12%', t: '-8%', rgb: '59,130,246', a: [0.1, 0.08], dur: 20, dl: 0 },
  { w: 550, h: 280, l: '45%', t: '-6%', rgb: '139,92,246', a: [0.1, 0.07], dur: 27, dl: -6 },
  { w: 480, h: 480, l: '68%', t: '25%', rgb: '16,185,129', a: [0.08, 0.06], dur: 23, dl: -10 },
  { w: 500, h: 320, l: '-8%', t: '48%', rgb: '245,158,11', a: [0.07, 0.06], dur: 30, dl: -14 },
  { w: 400, h: 400, l: '28%', t: '58%', rgb: '236,72,153', a: [0.07, 0.06], dur: 19, dl: -4 },
];

const AnimatedBackground = memo(function AnimatedBackground({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const COLORS = isDark
      ? ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']
      : ['#6366f1', '#8b5cf6', '#059669', '#d97706', '#db2777', '#0891b2'];

    type P = { x: number; y: number; vx: number; vy: number; r: number; color: string; life: number; maxLife: number };
    const spawn = (anywhere = false): P => {
      const maxLife = 100 + Math.random() * 200;
      return {
        x: Math.random() * (w || 800),
        y: anywhere ? Math.random() * (h || 600) : (h || 600) + 10,
        vy: -(0.5 + Math.random() * 1.4),
        vx: (Math.random() - 0.5) * 0.7,
        r: 0.8 + Math.random() * 2.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: anywhere ? Math.random() * maxLife : 0,
        maxLife,
      };
    };
    const particles = Array.from({ length: 50 }, () => spawn(true));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        const alpha = t < 0.2 ? t / 0.2 : t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
        if (p.life >= p.maxLife || p.y < -10) Object.assign(p, spawn());

        ctx.globalAlpha = alpha * (isDark ? 0.75 : 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  }, [isDark, reduce]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {AURORA.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl will-change-transform"
          style={{
            width: o.w,
            height: o.h,
            left: o.l,
            top: o.t,
            background: `rgba(${o.rgb},${isDark ? o.a[0] : o.a[1]})`,
          }}
          animate={reduce ? undefined : { x: [0, 50, -35, 25, 0], y: [0, -35, 30, -18, 0], scale: [1, 1.18, 0.88, 1.1, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.dl }}
        />
      ))}
      {!reduce && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ value, decimals = 0, duration = 1.0 }: { value: number; decimals?: number; duration?: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const from = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / 1000 / duration, 1);
      setDisplay(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>;
}

function CompletionRing({ rate, theme }: { rate: number; theme: 'light' | 'dark' }) {
  const gid = useId();
  const r = 54;
  const circ = 2 * Math.PI * r;
  const isDark = theme === 'dark';
  return (
    <div
      className="relative flex h-36 w-36 items-center justify-center"
      role="img"
      aria-label={`Completion rate ${rate} percent`}
    >
      <svg width="144" height="144" className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="72" cy="72" r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="10" />
        <motion.circle
          cx="72" cy="72" r={r} fill="none" stroke={`url(#${gid})`} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (rate / 100) * circ }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{rate}%</span>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>done</span>
      </div>
    </div>
  );
}

function MotivationalBanner({ theme }: { theme: 'light' | 'dark' }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative overflow-hidden rounded-2xl px-8 py-6 ${
        isDark
          ? 'border border-white/5 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40'
          : 'border border-blue-100 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50'
      }`}
    >
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        />
      )}
      <div className="flex items-start gap-4">
        <Zap aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
        <div className="flex min-h-[52px] flex-col justify-center" aria-live="off">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className={`text-base font-medium leading-snug ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                “{QUOTES[idx].text}”
              </p>
              <p className={`mt-1 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{QUOTES[idx].author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 self-center">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show quote ${i + 1}`}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <motion.span
                className="block h-1.5 rounded-full"
                animate={{
                  width: i === idx ? 16 : 6,
                  backgroundColor:
                    i === idx ? (isDark ? '#818cf8' : '#6366f1') : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RangeToggle({ value, onChange, isDark }: { value: Range; onChange: (r: Range) => void; isDark: boolean }) {
  return (
    <div
      role="radiogroup"
      aria-label="Date range"
      className={`inline-flex rounded-xl p-1 ${isDark ? 'bg-gray-800/70' : 'bg-gray-100'}`}
    >
      {RANGES.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r)}
            className={`relative rounded-lg px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
              active ? 'text-white' : isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {active && (
              <motion.span
                layoutId="range-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{r}d</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Charts (interactive, no aspect-ratio distortion)                    */
/* ------------------------------------------------------------------ */

const W = 500, H = 200, PL = 30, PR = 12, PT = 14, PB = 28;
const plotW = W - PL - PR;
const plotH = H - PT - PB;

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function Grid({ max, isDark }: { max: number; isDark: boolean }) {
  const tc = isDark ? '#374151' : '#e5e7eb';
  const lc = isDark ? '#9ca3af' : '#6b7280';
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = PT + plotH - f * plotH;
        return (
          <g key={f}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={tc} strokeWidth="0.6" strokeDasharray="3 3" />
            <text x={PL - 5} y={y + 3} textAnchor="end" fontSize="9" fill={lc}>
              {Math.round(max * f)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function XLabels({ labels, xAt, isDark }: { labels: string[]; xAt: (i: number) => number; isDark: boolean }) {
  const step = Math.max(1, Math.ceil(labels.length / 6));
  const lc = isDark ? '#9ca3af' : '#6b7280';
  return (
    <>
      {labels.map((l, i) =>
        i % step === 0 || i === labels.length - 1 ? (
          <text key={i} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={lc}>
            {l}
          </text>
        ) : null,
      )}
    </>
  );
}

function Tooltip({ x, y, lines, isDark }: { x: number; y: number; lines: string[]; isDark: boolean }) {
  const width = Math.max(...lines.map((l) => l.length)) * 5.4 + 14;
  const height = lines.length * 13 + 8;
  const tx = Math.min(Math.max(x - width / 2, PL), W - PR - width);
  const ty = Math.max(y - height - 8, 2);
  return (
    <g pointerEvents="none">
      <rect x={tx} y={ty} width={width} height={height} rx="5" fill={isDark ? '#111827' : '#ffffff'} stroke={isDark ? '#374151' : '#d1d5db'} />
      {lines.map((l, i) => (
        <text key={i} x={tx + 7} y={ty + 14 + i * 13} fontSize="9.5" fill={isDark ? '#e5e7eb' : '#111827'} fontWeight={i === 0 ? 600 : 400}>
          {l}
        </text>
      ))}
    </g>
  );
}

function AreaChart({ data, isDark }: { data: { label: string; value: number }[]; isDark: boolean }) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const n = data.length;
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const xAt = (i: number) => PL + (i / Math.max(n - 1, 1)) * plotW;
  const yAt = (v: number) => PT + plotH - (v / max) * plotH;

  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));
  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)} ${cx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');
  const area = n ? `${line} L ${pts[n - 1].x.toFixed(1)} ${PT + plotH} L ${pts[0].x.toFixed(1)} ${PT + plotH} Z` : '';
  const colW = plotW / Math.max(n - 1, 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Completed tasks per day. ${data.reduce((s, d) => s + d.value, 0)} total over ${n} days.`}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Grid max={max} isDark={isDark} />
      {area && <path d={area} fill={`url(#${gid})`} />}
      {line && <path d={line} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      <XLabels labels={data.map((d) => d.label)} xAt={xAt} isDark={isDark} />
      {n <= 31 && pts.map((p, i) => data[i].value > 0 && <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#10b981" />)}
      {hover !== null && pts[hover] && (
        <>
          <line x1={pts[hover].x} x2={pts[hover].x} y1={PT} y2={PT + plotH} stroke="#10b981" strokeOpacity="0.4" strokeDasharray="3 3" />
          <circle cx={pts[hover].x} cy={pts[hover].y} r="4" fill="#10b981" stroke={isDark ? '#111827' : '#fff'} strokeWidth="1.5" />
          <Tooltip x={pts[hover].x} y={pts[hover].y} lines={[data[hover].label, `${data[hover].value} completed`]} isDark={isDark} />
        </>
      )}
      {data.map((_, i) => (
        <rect key={i} x={xAt(i) - colW / 2} y={PT} width={colW} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />
      ))}
    </svg>
  );
}

function BarChart({ data, isDark }: { data: { label: string; added: number; done: number }[]; isDark: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(data.length, 1);
  const max = niceMax(Math.max(...data.flatMap((d) => [d.added, d.done]), 0));
  const group = plotW / n;
  const barW = Math.max((group - 3) / 2, 1);
  const xAt = (i: number) => PL + i * group + group / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Tasks created versus completed per day over ${data.length} days.`}
      onMouseLeave={() => setHover(null)}
    >
      <Grid max={max} isDark={isDark} />
      {data.map((d, i) => {
        const gx = PL + i * group + 1.5;
        const ah = (d.added / max) * plotH;
        const dh = (d.done / max) * plotH;
        return (
          <g key={i} opacity={hover === null || hover === i ? 1 : 0.45}>
            {d.added > 0 && <rect x={gx} y={PT + plotH - ah} width={barW} height={ah} fill="#3b82f6" rx="1.5" />}
            {d.done > 0 && <rect x={gx + barW + 0.5} y={PT + plotH - dh} width={barW} height={dh} fill="#10b981" rx="1.5" />}
          </g>
        );
      })}
      <XLabels labels={data.map((d) => d.label)} xAt={xAt} isDark={isDark} />
      {hover !== null && data[hover] && (
        <Tooltip
          x={xAt(hover)}
          y={PT + plotH - (Math.max(data[hover].added, data[hover].done) / max) * plotH}
          lines={[data[hover].label, `${data[hover].added} created`, `${data[hover].done} completed`]}
          isDark={isDark}
        />
      )}
      {data.map((_, i) => (
        <rect key={i} x={PL + i * group} y={PT} width={group} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />
      ))}
    </svg>
  );
}

type RadarDatum = { subject: string; color: string; all: number; done: number; ongoing: number };

function RadarChart({ data, isDark }: { data: RadarDatum[]; isDark: boolean }) {
  const n = data.length;
  const cx = 150, cy = 150, R = 100;
  const maxVal = Math.max(...data.flatMap((d) => [d.all, d.done, d.ongoing]), 1);
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const r = (v / maxVal) * R;
    return `${(cx + r * Math.cos(angle(i))).toFixed(1)},${(cy + r * Math.sin(angle(i))).toFixed(1)}`;
  };
  const poly = (key: 'all' | 'done' | 'ongoing') => data.map((d, i) => pt(i, d[key])).join(' ');
  const tc = isDark ? '#374151' : '#e5e7eb';
  const lc = isDark ? '#9ca3af' : '#6b7280';

  // A radar needs at least 3 axes to be meaningful.
  if (n < 3) {
    return (
      <div className={`flex h-48 items-center justify-center rounded-xl border border-dashed text-center text-xs ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
        Add at least 3 categories to see the radar overview.
      </div>
    );
  }

  return (
    <svg viewBox="0 0 300 300" className="w-full" style={{ maxHeight: 300 }} role="img" aria-label="Radar chart of tasks per category">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={data.map((_, i) => pt(i, maxVal * f)).join(' ')} fill="none" stroke={tc} strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, maxVal).split(',');
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={tc} strokeWidth="1" />;
      })}
      <polygon points={poly('all')} fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" />
      <polygon points={poly('done')} fill="#10b981" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.5" />
      <polygon points={poly('ongoing')} fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" />
      {data.map((d, i) => {
        const lx = cx + (R + 18) * Math.cos(angle(i));
        const ly = cy + (R + 18) * Math.sin(angle(i));
        return (
          <text key={d.subject} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={lc} fontWeight={500}>
            {d.subject.length > 10 ? d.subject.slice(0, 9) + '…' : d.subject}
          </text>
        );
      })}
    </svg>
  );
}

function Delta({ current, previous, isDark }: { current: number; previous: number; isDark: boolean }) {
  if (previous === 0 && current === 0) return null;
  const pct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? 'text-emerald-500' : isDark ? 'text-red-400' : 'text-red-500'
      }`}
      title="Compared with the previous period of the same length"
    >
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {pct}%
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ProgressPage({ tasks, theme, categories }: ProgressPageProps) {
  const isDark = theme === 'dark';
  const [range, setRange] = useState<Range>(30);
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const strong = isDark ? 'text-white' : 'text-gray-900';

  /* One pass over tasks -> per-day buckets. Everything else reads from here. */
  const buckets = useMemo(() => {
    const map = new Map<number, { completed: number; created: number }>();
    const bump = (ts: number, key: 'completed' | 'created') => {
      const b = map.get(ts) ?? { completed: 0, created: 0 };
      b[key]++;
      map.set(ts, b);
    };
    for (const t of tasks) {
      if (t.createdAt) bump(startOfDay(t.createdAt), 'created');
      if (t.completedAt) bump(startOfDay(t.completedAt), 'completed');
    }
    return map;
  }, [tasks]);

  const todayTs = startOfDay(Date.now());

  const dailyStats = useMemo((): DailyStats[] => {
    const out: DailyStats[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const ts = addDays(todayTs, -i);
      const b = buckets.get(ts);
      out.push({ ts, completed: b?.completed ?? 0, created: b?.created ?? 0, label: fmtDay(ts) });
    }
    return out;
  }, [buckets, range, todayTs]);

  const previousTotal = useMemo(() => {
    let sum = 0;
    for (let i = range; i < range * 2; i++) sum += buckets.get(addDays(todayTs, -i))?.completed ?? 0;
    return sum;
  }, [buckets, range, todayTs]);

  const { currentStreak, longestStreak } = useMemo(() => {
    const days = [...buckets.entries()].filter(([, b]) => b.completed > 0).map(([ts]) => ts).sort((a, b) => a - b);
    let longest = 0;
    let run = 0;
    for (let i = 0; i < days.length; i++) {
      run = i > 0 && Math.round((days[i] - days[i - 1]) / DAY_MS) === 1 ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
    // Current streak: a streak stays alive until the end of today, so start from yesterday if today is empty.
    const set = new Set(days);
    let cursor = set.has(todayTs) ? todayTs : addDays(todayTs, -1);
    let current = 0;
    while (set.has(cursor)) {
      current++;
      cursor = addDays(cursor, -1);
    }
    return { currentStreak: current, longestStreak: longest };
  }, [buckets, todayTs]);

  const doneToday = buckets.get(todayTs)?.completed ?? 0;
  const periodTotal = dailyStats.reduce((s, d) => s + d.completed, 0);
  const avgPerDay = periodTotal / range;
  const totalCompleted = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const completionRate = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const bestDay = useMemo(() => {
    const best = dailyStats.reduce((m, d) => (d.completed > m.completed ? d : m), dailyStats[0]);
    return best && best.completed > 0 ? { label: best.label, count: best.completed } : { label: '—', count: 0 };
  }, [dailyStats]);

  const onTime = useMemo(() => {
    let withDue = 0;
    let ok = 0;
    for (const t of tasks) {
      if (t.completedAt && t.dueDate) {
        withDue++;
        if (new Date(t.completedAt).getTime() <= new Date(t.dueDate).getTime()) ok++;
      }
    }
    return withDue ? Math.round((ok / withDue) * 100) : null;
  }, [tasks]);

  const radarData = useMemo<RadarDatum[]>(() => {
    const counts = new Map<string, { all: number; done: number }>();
    for (const t of tasks) {
      if (!t.categoryId) continue;
      const c = counts.get(t.categoryId) ?? { all: 0, done: 0 };
      c.all++;
      if (t.completed) c.done++;
      counts.set(t.categoryId, c);
    }
    return categories.map((cat) => {
      const c = counts.get(cat.id) ?? { all: 0, done: 0 };
      return { subject: cat.name, color: cat.color, all: c.all, done: c.done, ongoing: c.all - c.done };
    });
  }, [tasks, categories]);

  const areaData = useMemo(() => dailyStats.map((d) => ({ label: d.label, value: d.completed })), [dailyStats]);
  const barData = useMemo(() => dailyStats.map((d) => ({ label: d.label, added: d.created, done: d.completed })), [dailyStats]);

  const statCards = [
    {
      title: 'Done Today', value: doneToday, decimals: 0, icon: CheckCircle2,
      gradient: 'from-emerald-500 to-green-400', glow: isDark ? 'shadow-emerald-500/20' : 'shadow-emerald-200',
      ring: 'ring-emerald-500/20', suffix: doneToday === 1 ? 'task' : 'tasks',
    },
    {
      title: 'Current Streak', value: currentStreak, decimals: 0, icon: Flame,
      gradient: 'from-orange-500 to-amber-400', glow: isDark ? 'shadow-orange-500/20' : 'shadow-orange-200',
      ring: 'ring-orange-500/20', suffix: `${currentStreak === 1 ? 'day' : 'days'} · best ${longestStreak}`,
    },
    {
      title: 'Daily Average', value: avgPerDay, decimals: 1, icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-400', glow: isDark ? 'shadow-blue-500/20' : 'shadow-blue-200',
      ring: 'ring-blue-500/20', suffix: `per day (${range}d)`,
      extra: <Delta current={periodTotal} previous={previousTotal} isDark={isDark} />,
    },
    {
      title: 'All Time', value: totalCompleted, decimals: 0, icon: Trophy,
      gradient: 'from-violet-500 to-purple-400', glow: isDark ? 'shadow-violet-500/20' : 'shadow-violet-200',
      ring: 'ring-violet-500/20', suffix: 'completed',
    },
  ];

  const card = `rounded-2xl p-6 ring-1 shadow-xl backdrop-blur-sm ${isDark ? 'bg-gray-900/70 ring-white/5' : 'bg-white/80 ring-black/5'}`;

  const insightTiles = [
    { icon: Calendar, label: 'Best Day', value: bestDay.label, sub: `${bestDay.count} ${bestDay.count === 1 ? 'task' : 'tasks'}`, color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { icon: Target, label: `Last ${range} days`, value: String(periodTotal), sub: 'tasks completed', color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50', extra: <Delta current={periodTotal} previous={previousTotal} isDark={isDark} /> },
    { icon: Clock, label: 'On Time', value: onTime === null ? '—' : `${onTime}%`, sub: onTime === null ? 'no due dates yet' : 'finished by due date', color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
  ];

  return (
    <div className="relative space-y-6">
      <AnimatedBackground theme={theme} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="relative flex flex-wrap items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 shadow-lg shadow-blue-500/30">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
            Progress & Analytics
          </h1>
          <p className={`text-sm ${muted}`}>Your productivity story, visualised</p>
        </div>
        <div className="ml-auto">
          <RangeToggle value={range} onChange={setRange} isDark={isDark} />
        </div>
      </motion.div>

      <motion.div className="relative" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <MotivationalBanner theme={theme} />
      </motion.div>

      {/* Stat cards */}
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={`relative overflow-hidden rounded-2xl p-5 shadow-xl ring-1 backdrop-blur-sm ${stat.ring} ${stat.glow} ${isDark ? 'bg-gray-900/70' : 'bg-white/80'}`}>
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />
                <div className="relative flex items-start justify-between">
                  <div className="space-y-1">
                    <p className={`text-xs font-medium uppercase tracking-widest ${muted}`}>{stat.title}</p>
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className={`text-3xl font-bold tabular-nums ${strong}`}>
                        <AnimatedCounter value={stat.value} decimals={stat.decimals} />
                      </span>
                      <span className={`text-xs ${muted}`}>{stat.suffix}</span>
                      {stat.extra}
                    </div>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${stat.gradient}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${strong}`}>Completion Trend</h3>
                <p className={`mt-0.5 text-xs ${muted}`}>Last {range} days</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className={`text-xs ${muted}`}>Completed</span>
              </div>
            </div>
            {periodTotal === 0 ? (
              <EmptyChart isDark={isDark} text="Complete a task to start your trend line." />
            ) : (
              <AreaChart data={areaData} isDark={isDark} />
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${strong}`}>Created vs Completed</h3>
                <p className={`mt-0.5 text-xs ${muted}`}>Last {range} days</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-400" /><span className={`text-xs ${muted}`}>Created</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className={`text-xs ${muted}`}>Done</span></div>
              </div>
            </div>
            {dailyStats.every((d) => d.created === 0 && d.completed === 0) ? (
              <EmptyChart isDark={isDark} text="No activity in this range yet." />
            ) : (
              <BarChart data={barData} isDark={isDark} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick insights */}
      <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className={card}>
          <h3 className={`mb-5 font-semibold ${strong}`}>Quick Insights</h3>
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center gap-2">
              <CompletionRing rate={completionRate} theme={theme} />
              <span className={`text-xs font-medium ${muted}`}>Completion rate</span>
            </div>
            {insightTiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.label}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ scale: 1.03 }}
                  className={`rounded-xl p-4 ${tile.bg}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${tile.color}`} />
                    <span className={`text-xs font-medium uppercase tracking-wide ${muted}`}>{tile.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${strong}`}>{tile.value}</p>
                  <p className={`mt-0.5 flex items-center gap-2 text-xs ${muted}`}>
                    {tile.sub}
                    {tile.extra}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Category distribution */}
      <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <div className={card}>
          <div className="mb-5">
            <h3 className={`font-semibold ${strong}`}>Task Distribution by Category</h3>
            <p className={`mt-0.5 text-xs ${muted}`}>Overview across all categories</p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="mb-1 flex items-center gap-4 text-xs">
                {[{ color: '#3b82f6', label: 'All' }, { color: '#10b981', label: 'Done' }, { color: '#f59e0b', label: 'Ongoing' }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className={muted}>{l.label}</span>
                  </div>
                ))}
              </div>
              <RadarChart data={radarData} isDark={isDark} />
            </div>

            <div className="space-y-3">
              <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${muted}`}>Category Breakdown</p>
              {radarData.length === 0 && <p className={`text-sm ${muted}`}>No categories yet.</p>}
              {radarData.map((d, i) => {
                const pct = d.all > 0 ? Math.round((d.done / d.all) * 100) : 0;
                return (
                  <motion.div
                    key={d.subject}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.06 }}
                    whileHover={{ x: 4 }}
                    className={`rounded-xl border p-4 transition-colors ${
                      isDark ? 'border-gray-700/60 bg-gray-800/50 hover:border-gray-600' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                        <span className={`text-sm font-medium ${strong}`}>{d.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{pct}%</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d.all} total</span>
                      </div>
                    </div>
                    <div
                      className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${d.subject} completion`}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.65 + i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                      <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className={muted}>{d.done} done</span></div>
                      <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className={muted}>{d.ongoing} active</span></div>
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

function EmptyChart({ isDark, text }: { isDark: boolean; text: string }) {
  return (
    <div
      className={`flex h-48 items-center justify-center rounded-xl border border-dashed text-sm ${
        isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'
      }`}
    >
      {text}
    </div>
  );
}
