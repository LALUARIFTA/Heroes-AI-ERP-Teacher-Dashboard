import { useEffect, useState } from 'react';

export { CountUp, HeroesBrandLogo, HeroBotIllustration, SafeAvatar, Sparkline, StatusBadge };

type StatusBadgeProps = {
  status: string;
  onClick?: () => void;
  title?: string;
};

function SafeAvatar({ src, name, className = 'w-9 h-9 rounded-full' }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || 'HA')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-xs shrink-0 select-none`}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`${className} object-cover shrink-0`}
    />
  );
}

function CountUp({ value, duration = 650 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = 0;
    const end = Number(value) || 0;
    if (end === 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(end);
      return;
    }
    const startTime = performance.now();
    let frameId;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);
  return <>{display}</>;
}

function Sparkline({ color = '#4F46E5', data = [20, 35, 28, 45, 38, 60, 52, 72] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 26 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 30" className="w-24 h-7 overflow-visible" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function HeroesBrandLogo({ primary = '#4F46E5' }) {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0" fill="none">
      <rect width="40" height="40" rx="11" fill={primary} />
      <path
        d="M11 26.5V13.5L20 10L29 13.5V26.5L20 30L11 26.5Z"
        fill="white"
        fillOpacity="0.16"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 15V25M24.5 15V25M15.5 20H24.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="30.5" cy="9.5" r="3" fill="#F59E0B" />
    </svg>
  );
}

function HeroBotIllustration() {
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0 drop-shadow-sm" fill="none">
      <circle cx="32" cy="34" r="24" fill="#EEF2FF" />
      <rect x="17" y="16" width="30" height="24" rx="10" fill="white" stroke="#4F46E5" strokeWidth="2.2" />
      <rect x="22" y="22" width="20" height="11" rx="5" fill="#1E1B4B" />
      <circle cx="27.5" cy="27.5" r="2.2" fill="#38BDF8" />
      <circle cx="36.5" cy="27.5" r="2.2" fill="#38BDF8" />
      <path d="M32 10V16" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="8.5" r="2.5" fill="#F59E0B" />
      <rect x="21" y="42" width="22" height="12" rx="6" fill="#4F46E5" />
      <path d="M27 48H37" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ status, onClick, title }: StatusBadgeProps) {
  const map = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Graded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-slate-100 text-slate-600 border-slate-200',
    Read: 'bg-slate-100 text-slate-600 border-slate-200',
    'Low Risk': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Live Now': 'bg-indigo-600 text-white border-indigo-600',
    Featured: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
    Upcoming: 'bg-sky-50 text-sky-700 border-sky-200',
    Unread: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'Pending Grading': 'bg-amber-50 text-amber-700 border-amber-200',
    Draft: 'bg-amber-50 text-amber-700 border-amber-200',
    Partial: 'bg-amber-50 text-amber-700 border-amber-200',
    Late: 'bg-amber-50 text-amber-700 border-amber-200',
    Monitoring: 'bg-amber-50 text-amber-700 border-amber-200',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
    'Medium Risk': 'bg-amber-50 text-amber-700 border-amber-200',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    'High Risk': 'bg-rose-50 text-rose-700 border-rose-200',
    'Needs Attention': 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const cls = map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const baseClass = `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition ${cls}`;

  if (!onClick) {
    return (
      <span title={title} className={`${baseClass} cursor-default`}>
        {status}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || 'Click to cycle status'}
      className={`${baseClass} cursor-pointer hover:brightness-95 active:scale-95`}
    >
      {status}
    </button>
  );
}
