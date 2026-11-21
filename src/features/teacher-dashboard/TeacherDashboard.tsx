import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle, Award, Bell, Bot, Calendar, CalendarOff, CheckCircle2, CheckSquare,
  ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Download, FileEdit,
  GraduationCap, Menu, MessageSquare, Printer, RotateCcw, Search, Send, Settings,
  ShieldAlert, Sparkles, Square, Trash2, TrendingUp, UserCheck, Users, UserX, Wand2, X,
} from 'lucide-react';
import { ALL_QUICK_LINKS, NAV_ITEMS, STORAGE_KEY, THEME_PRESETS } from './dashboard-config';
import { INITIAL_DATA } from './demo-data';
import { AiContentGeneratorModal, AiLessonPlannerModal } from './components/AiToolDialogs';
import { CountUp, HeroesBrandLogo, HeroBotIllustration, SafeAvatar, Sparkline, StatusBadge } from './components/DashboardVisuals';
import InteractiveDataTable from './components/InteractiveDataTable';

export default function TeacherDashboard() {
  // Persistent State Loader
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_DATA, ...parsed };
      }
    } catch {
      // Fallback to default
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors
    }
  }, [data]);

  const theme = THEME_PRESETS[data.themeKey] || THEME_PRESETS.indigo;

  // Navigation & UI States
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState({ year: 2026, month: 4 }); // May 2026 (0-indexed)
  const [selectedDay, setSelectedDay] = useState(20);
  const [perfPeriod, setPerfPeriod] = useState('This Month');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Overlays & Interactive Modals
  const [toasts, setToasts] = useState([]);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Ms. Clara! I am Hero AI, your teaching assistant. Ask me to draft a Physics lesson plan, check at-risk students, or generate quiz questions.'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isLessonPlannerOpen, setIsLessonPlannerOpen] = useState(false);
  const [isContentGenOpen, setIsContentGenOpen] = useState(false);
  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // CRUD Modal & Detail Drawer
  const [crudModal, setCrudModal] = useState(null); // { moduleKey, mode: 'create'|'edit', item, fields, title }
  const [crudForm, setCrudForm] = useState<Record<string, string | number>>({});
  const [detailDrawer, setDetailDrawer] = useState(null); // { title, subtitle, item, avatar, type }
  const [deleteTarget, setDeleteTarget] = useState(null); // { moduleKey, ids, label }
  const [riskStudent, setRiskStudent] = useState(null);
  const [reportCardStudent, setReportCardStudent] = useState(null);

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  // Global Cmd+K Shortcut
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdOpen(false);
        setIsNotifDropdownOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Computed Real-time Dashboard Metrics
  const stats = useMemo(() => {
    const todaysClasses = data.schedule.length;
    const studentCount = data.students.length > 8 ? data.students.length : 120 + data.students.length;
    const assignmentsToGrade = data.assignments.reduce((sum, a) => sum + (Number(a.toGrade) || 0), 0);
    const pendingLeaves = data.leaves.filter((l) => l.status === 'Pending').length;
    const hwTotal = data.homework.length;
    const hwSubmitted = data.homework.filter((h) => h.status === 'Submitted').length;
    const hwPending = data.homework.filter((h) => h.status === 'Pending').length;
    const hwOverdue = data.homework.filter((h) => h.status === 'Overdue').length;
    const hwPercent = hwTotal > 0 ? Math.round((hwSubmitted / hwTotal) * 100) : 0;
    const unreadNotifs = data.notifications.filter((n) => n.unread).length;
    const pendingTasksTotal = assignmentsToGrade;
    return {
      todaysClasses,
      studentCount,
      assignmentsToGrade,
      pendingLeaves,
      hwTotal,
      hwSubmitted,
      hwPending,
      hwOverdue,
      hwPercent,
      unreadNotifs,
      pendingTasksTotal
    };
  }, [data]);

  // CSV Export Utility
  const exportToCSV = (rows, filename = 'heroes-erp-export.csv') => {
    if (!rows || rows.length === 0) {
      addToast('No data available to export', 'info');
      return;
    }
    const keys = Object.keys(rows[0]).filter((k) => k !== 'avatar' && k !== 'cover');
    const csv = [
      keys.join(','),
      ...rows.map((r) =>
        keys
          .map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${rows.length} rows to ${filename}`, 'success');
  };

  // Generic CRUD Helpers
  const openCreateModal = (moduleKey, title, fields, defaults = {}) => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.key] = defaults[f.key] !== undefined ? defaults[f.key] : f.defaultValue ?? '';
    });
    setCrudForm(initial);
    setCrudModal({ moduleKey, mode: 'create', title, fields });
  };

  const openEditModal = (moduleKey, title, fields, item) => {
    setCrudForm({ ...item });
    setCrudModal({ moduleKey, mode: 'edit', title, fields, item });
  };

  const handleSaveCrud = (e) => {
    e.preventDefault();
    if (!crudModal) return;
    const { moduleKey, mode, fields } = crudModal;
    // Validate required fields
    for (const f of fields) {
      if (f.required && !String(crudForm[f.key] ?? '').trim()) {
        addToast(`Please fill in ${f.label}`, 'error');
        return;
      }
    }

    // Parse numeric fields
    const payload = { ...crudForm };
    fields.forEach((f) => {
      if (f.type === 'number') {
        payload[f.key] = Number(payload[f.key]) || 0;
      }
    });

    if (mode === 'create') {
      const prefix = moduleKey.slice(0, 3).toUpperCase();
      payload.id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      setData((prev) => ({
        ...prev,
        [moduleKey]: [payload, ...prev[moduleKey]]
      }));
      addToast(`Created new entry successfully`, 'success');
    } else {
      setData((prev) => ({
        ...prev,
        [moduleKey]: prev[moduleKey].map((row) => (row.id === payload.id ? payload : row))
      }));
      addToast(`Updated entry successfully`, 'success');
    }
    setCrudModal(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { moduleKey, ids } = deleteTarget;
    setData((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].filter((item) => !ids.includes(item.id))
    }));
    addToast(`Deleted ${ids.length} item(s)`, 'info');
    setDeleteTarget(null);
  };

  const handleBulkStatus = (moduleKey, ids, newStatus) => {
    setData((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].map((item) =>
        ids.includes(item.id) ? { ...item, status: newStatus } : item
      )
    }));
    addToast(`Updated ${ids.length} item(s) to "${newStatus}"`, 'success');
  };

  const cycleRowStatus = (moduleKey, id, options) => {
    setData((prev) => ({
      ...prev,
      [moduleKey]: prev[moduleKey].map((item) => {
        if (item.id !== id) return item;
        const idx = options.indexOf(item.status);
        const nextStatus = options[(idx + 1) % options.length];
        return { ...item, status: nextStatus };
      })
    }));
    addToast('Status updated', 'success');
  };

  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(INITIAL_DATA);
    setIsResetConfirmOpen(false);
    addToast('All ERP data reset to factory defaults', 'info');
  };

  // Hero AI Contextual Chat Handler
  const handleSendAiChat = (e: FormEvent<HTMLFormElement> | null, customPrompt = '') => {
    if (e) e.preventDefault();
    const prompt = (customPrompt || aiInput).trim();
    if (!prompt) return;

    const userMsg = { id: Date.now(), sender: 'user', text: prompt };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');

    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let reply = `I analyzed your Heroes AI ERP workspace: you currently have ${stats.todaysClasses} classes today, ${stats.assignmentsToGrade} assignments pending grading, and ${stats.pendingLeaves} leave requests waiting for review. Would you like me to draft a lesson plan or summarize student risks?`;

      if (lower.includes('risk') || lower.includes('rohan') || lower.includes('student')) {
        const highRisk = data.students.filter((s) => s.risk === 'High Risk');
        reply = `Currently ${highRisk.length} student(s) are flagged as High Risk: ${highRisk
          .map((s) => `${s.name} (${s.class} - ${s.score}%)`)
          .join(', ')}. I recommend scheduling a 15-minute lab review and sending an automated progress alert to their parents.`;
      } else if (lower.includes('lesson') || lower.includes('plan')) {
        reply = `Here is a quick 45-minute Physics outline for Class 10A:\n• 0–10m: Interactive Demo (Inclined Plane Friction)\n• 10–25m: Guided Free-Body Diagram Lab\n• 25–40m: Pair Problem Solving\n• 40–45m: 3-Question Exit Ticket.\nClick "AI Lesson Planner" on the Dashboard to save it directly into Lesson Plans!`;
      } else if (lower.includes('quiz') || lower.includes('question')) {
        reply = `I drafted 3 sample MCQs for Class 10A Physics:\n1. What is the SI unit of Impulse? (N·s)\n2. When net force is zero, acceleration is...? (0 m/s²)\n3. Which law explains rocket propulsion? (Newton's 3rd Law)\nYou can open the AI Quiz Builder tab to publish this quiz!`;
      }
      setAiMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    }, 450);
  };

  // Calendar Generator
  const calendarGrid = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, current: true });
    }
    const remaining = 42 - cells.length;
    for (let r = 1; r <= remaining; r++) {
      cells.push({ day: r, current: false });
    }
    return cells.slice(0, 35);
  }, [calendarMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ============================================================================
  // 5. MODULE VIEWS (ALL 16 NAVIGATION ITEMS 100% FUNCTIONAL)
  // ============================================================================

  const renderMainContent = () => {
    switch (activeNav) {
      // ------------------------------------------------------------------------
      // 1. DASHBOARD (1:1 PIXEL-PERFECT CLONE OF SCREENSHOT)
      // ------------------------------------------------------------------------
      case 'dashboard': {
        const perfData = data.performance[perfPeriod] || data.performance['This Month'];
        const quickLinks = ALL_QUICK_LINKS.filter((q) => data.quickLinkIds.includes(q.id));
        const donutRadius = 38;
        const donutCirc = 2 * Math.PI * donutRadius;
        const donutOffset = donutCirc - (stats.hwPercent / 100) * donutCirc;

        return (
          <div className="space-y-5 animate-fadeIn">
            {/* Section Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Teacher Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Demo <span className="hidden sm:inline">• {monthNames[calendarMonth.month]} {selectedDay}, {calendarMonth.year}</span>
              </span>
            </div>

            {/* ROW 1: Hero Welcome Banner (2/3) + Stacked AI Action Cards (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Hero Welcome Banner */}
              <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EEF2FF] via-[#F5F7FF] to-[#E0E7FF]/70 border border-indigo-100/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 shadow-[0_2px_12px_rgba(79,70,229,0.05)] group">
                {/* Subtle academic watermark shapes */}
                <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-200/25 blur-2xl" />
                <div className="pointer-events-none absolute right-24 bottom-2 opacity-15 text-indigo-600">
                  <GraduationCap className="w-20 h-20" />
                </div>

                {/* HD Teacher Portrait */}
                <div className="relative shrink-0 w-32 h-36 sm:w-36 sm:h-40 rounded-2xl overflow-hidden shadow-md ring-4 ring-white/80 transition-transform duration-300 group-hover:scale-[1.02]">
                  <SafeAvatar
                    src={data.teacher.heroPortrait}
                    name={data.teacher.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Greeting Copy & CTA */}
                <div className="flex-1 text-center sm:text-left relative z-10">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Good morning, {data.teacher.name}! <span className="inline-block animate-bounce">👋</span>
                  </h2>
                  <p className="text-sm text-slate-600 font-medium mt-1">
                    Empower minds. Inspire futures.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    You have <strong className="text-slate-800">{stats.todaysClasses} classes today</strong> and{' '}
                    <button
                      type="button"
                      onClick={() => setActiveNav('assignments')}
                      style={{ color: theme.primary }}
                      className="font-bold underline decoration-indigo-300 underline-offset-2 hover:brightness-90"
                    >
                      {stats.pendingTasksTotal} pending tasks.
                    </button>
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveNav('classes')}
                      style={{ backgroundColor: theme.primary }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                      <span>View My Classes</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stacked AI Tool Cards */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 justify-between">
                {/* AI Lesson Planner Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">AI Lesson Planner</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Draft a lesson outline from a sample template.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLessonPlannerOpen(true)}
                    className="mt-3 w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 text-xs font-semibold text-indigo-700 transition"
                  >
                    <span>Create Lesson Plan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI Content Generator Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:border-violet-200 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">AI Content Generator</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Set up a sample quiz without an AI account.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsContentGenOpen(true)}
                    className="mt-3 w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-violet-100 bg-violet-50/40 hover:bg-violet-50 text-xs font-semibold text-violet-700 transition"
                  >
                    <span>Generate Content</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: 4 KPI Stat Cards with Count-Up & Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {/* KPI 1 */}
              <div
                onClick={() => setActiveNav('timetable')}
                className="cursor-pointer bg-gradient-to-br from-indigo-50/70 to-white rounded-2xl border border-indigo-100/90 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-700">Today's Classes</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      <CountUp value={stats.todaysClasses} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="text-[11px] text-slate-500 leading-tight">
                    <p className="font-semibold text-slate-700">Next: Physics - 10A</p>
                    <p className="mt-0.5">09:30 AM - 10:15 AM</p>
                  </div>
                  <Sparkline color="#4F46E5" data={[18, 25, 22, 34, 30, 42, 39]} />
                </div>
              </div>

              {/* KPI 2 */}
              <div
                onClick={() => setActiveNav('students')}
                className="cursor-pointer bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl border border-emerald-100/90 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Student Count</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      <CountUp value={stats.studentCount} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-[11px] text-slate-600 font-medium">
                    Across {data.classes.length} Classes
                  </p>
                  <Sparkline color="#059669" data={[32, 38, 35, 48, 45, 58, 62]} />
                </div>
              </div>

              {/* KPI 3 */}
              <div
                onClick={() => setActiveNav('assignments')}
                className="cursor-pointer bg-gradient-to-br from-violet-50/70 to-white rounded-2xl border border-violet-100/90 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-violet-700">Assignments to Grade</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      <CountUp value={stats.assignmentsToGrade} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-100/80 text-violet-600 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-[11px] text-slate-600 font-medium">Due within 3 days</p>
                  <Sparkline color="#7C3AED" data={[45, 39, 44, 30, 34, 28, 36]} />
                </div>
              </div>

              {/* KPI 4 */}
              <div
                onClick={() => setActiveNav('leaves')}
                className="cursor-pointer bg-gradient-to-br from-amber-50/80 to-white rounded-2xl border border-amber-100/90 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Pending Leave Requests</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      <CountUp value={stats.pendingLeaves} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
                    <CalendarOff className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-[11px] text-slate-600 font-medium">Requires your approval</p>
                  <Sparkline color="#D97706" data={[12, 22, 16, 26, 20, 32, 28]} />
                </div>
              </div>
            </div>

            {/* ROW 3: Quick Links Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Quick Links</h3>
                <button
                  type="button"
                  onClick={() => setIsQuickLinkModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  <span>Customize</span>
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {quickLinks.map((ql) => {
                  const Icon = ql.icon;
                  return (
                    <button
                      key={ql.id}
                      type="button"
                      onClick={() => setActiveNav(ql.id)}
                      className="bg-white rounded-xl border border-slate-200/80 py-3.5 px-2 flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ql.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">
                        {ql.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 4: Lower 3-Column Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Col 1: Upcoming Activities */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Activities</h3>
                    <button
                      type="button"
                      onClick={() => setActiveNav('timetable')}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.activities.map((act) => {
                      const badgeColor =
                        act.color === 'indigo'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : act.color === 'violet'
                          ? 'bg-violet-50 text-violet-700 border-violet-100'
                          : act.color === 'sky'
                          ? 'bg-sky-50 text-sky-700 border-sky-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      return (
                        <div
                          key={act.id}
                          onClick={() => setActiveNav('timetable')}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                        >
                          <div className={`w-11 py-1.5 rounded-xl border text-center shrink-0 ${badgeColor}`}>
                            <div className="text-[9px] font-bold uppercase tracking-wider">{act.month}</div>
                            <div className="text-sm font-extrabold leading-tight">{act.day}</div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{act.meta}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav('timetable')}
                  className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Full Calendar</span>
                </button>
              </div>

              {/* Col 2: Homework Submissions + AI Student Risk Alerts */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Homework Submissions Donut Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Homework Submissions</h3>
                    <button
                      type="button"
                      onClick={() => setActiveNav('homework')}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Animated SVG Donut */}
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle
                          cx="48"
                          cy="48"
                          r={donutRadius}
                          fill="none"
                          stroke="#EEF2FF"
                          strokeWidth="10"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r={donutRadius}
                          fill="none"
                          stroke={theme.primary}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={donutCirc}
                          strokeDashoffset={donutOffset}
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-slate-900 leading-none">
                          {stats.hwPercent}%
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5">Submitted</span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Assigned</span>
                        <span className="font-bold text-slate-900">{stats.hwTotal}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Submitted</span>
                        <span className="font-bold text-emerald-600">{stats.hwSubmitted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pending</span>
                        <span className="font-bold text-amber-600">{stats.hwPending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Overdue</span>
                        <span className="font-bold text-rose-600">{stats.hwOverdue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Student Risk Alerts */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <h3 className="text-sm font-bold text-slate-900">AI Student Risk Alerts</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('students')}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {data.students.slice(0, 3).map((stu) => (
                      <div
                        key={stu.id}
                        onClick={() => setRiskStudent(stu)}
                        className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SafeAvatar src={stu.avatar} name={stu.name} className="w-9 h-9 rounded-full" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {stu.name} <span className="text-slate-500 font-medium">({stu.class})</span>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{stu.reason}</p>
                          </div>
                        </div>
                        <StatusBadge status={stu.risk} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 3: Student Performance Overview + Notifications */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Grouped Bar Chart Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">Student Performance</h3>
                    <select
                      value={perfPeriod}
                      onChange={(e) => setPerfPeriod(e.target.value)}
                      className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {Object.keys(data.performance).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Interactive Bars */}
                  <div className="h-36 flex items-end justify-between gap-2 pt-4 pb-1 px-1 relative">
                    {perfData.map((bar) => (
                      <div
                        key={bar.cls}
                        onMouseEnter={() => setHoveredBar(bar)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                      >
                        {hoveredBar?.cls === bar.cls && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap z-20">
                            Avg {bar.avg}% • Top {bar.top}%
                          </div>
                        )}
                        <div className="w-full flex items-end justify-center gap-1 h-24">
                          <div
                            style={{ height: `${bar.avg}%`, backgroundColor: theme.primary }}
                            className="w-3 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                          />
                          <div
                            style={{ height: `${bar.top}%` }}
                            className="w-3 rounded-t-md bg-indigo-200 transition-all duration-500 group-hover:bg-amber-400"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{bar.cls}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span style={{ backgroundColor: theme.primary }} className="w-2.5 h-2.5 rounded-xs" />
                      Class Average %
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200" />
                      Top Score %
                    </span>
                  </div>
                </div>

                {/* Notifications Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          notifications: prev.notifications.map((n) => ({ ...n, unread: false }))
                        }));
                        addToast('All notifications marked as read', 'info');
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Mark Read
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {data.notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() =>
                          setData((prev) => ({
                            ...prev,
                            notifications: prev.notifications.map((x) =>
                              x.id === n.id ? { ...x, unread: false } : x
                            )
                          }))
                        }
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.type === 'indigo'
                              ? 'bg-indigo-50 text-indigo-600'
                              : n.type === 'emerald'
                              ? 'bg-emerald-50 text-emerald-600'
                              : n.type === 'teal'
                              ? 'bg-teal-50 text-teal-600'
                              : 'bg-violet-50 text-violet-600'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.desc}</p>
                        </div>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 2. MY CLASSES
      // ------------------------------------------------------------------------
      case 'classes': {
        const fields = [
          { key: 'name', label: 'Class Name', required: true, placeholder: 'e.g., Class 10B' },
          { key: 'subject', label: 'Subject', required: true, placeholder: 'e.g., Applied Physics' },
          { key: 'room', label: 'Room / Lab', required: true, placeholder: 'e.g., Room 208' },
          { key: 'studentsCount', label: 'Enrolled Students', type: 'number', defaultValue: 30 },
          { key: 'avgScore', label: 'Average Score (%)', type: 'number', defaultValue: 82 },
          { key: 'schedule', label: 'Schedule', required: true, placeholder: 'Mon, Wed • 10:00 AM' },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Draft'], defaultValue: 'Active' }
        ];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Total Classes</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.classes.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Total Seats</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                  {data.classes.reduce((s, c) => s + Number(c.studentsCount || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Mean Score</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {Math.round(
                    data.classes.reduce((s, c) => s + Number(c.avgScore || 0), 0) /
                      Math.max(1, data.classes.length)
                  )}
                  %
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                <p className="text-xs text-slate-500 font-medium">Active Sections</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {data.classes.filter((c) => c.status === 'Active').length}
                </p>
              </div>
            </div>

            <InteractiveDataTable
              title="My Classes & Sections"
              subtitle="Manage assigned teaching batches, rooms, and syllabus averages."
              data={data.classes}
              filterKey="status"
              addLabel="Add Class"
              theme={theme}
              onAdd={() => openCreateModal('classes', 'Create New Class', fields)}
              onEdit={(row) => openEditModal('classes', 'Edit Class', fields, row)}
              onView={(row) => setDetailDrawer({ title: row.name, subtitle: row.subject, item: row })}
              onDelete={(row) => setDeleteTarget({ moduleKey: 'classes', ids: [row.id], label: row.name })}
              onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'classes', ids, label: `${ids.length} classes` })}
              onBulkStatus={(ids, st) => handleBulkStatus('classes', ids, st)}
              bulkStatusOptions={['Active', 'Completed']}
              onExportCSV={(rows) => exportToCSV(rows, 'heroes-classes.csv')}
              columns={[
                {
                  key: 'name',
                  label: 'Class',
                  render: (r) => (
                    <div>
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-500">{r.subject}</p>
                    </div>
                  )
                },
                { key: 'room', label: 'Room' },
                { key: 'schedule', label: 'Schedule' },
                { key: 'studentsCount', label: 'Students', render: (r) => <span className="font-semibold">{r.studentsCount}</span> },
                {
                  key: 'avgScore',
                  label: 'Avg Score',
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${r.avgScore}%`, backgroundColor: theme.primary }} className="h-full rounded-full" />
                      </div>
                      <span className="font-bold text-slate-700">{r.avgScore}%</span>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (
                    <StatusBadge
                      status={r.status}
                      onClick={() => cycleRowStatus('classes', r.id, ['Active', 'Completed', 'Draft'])}
                    />
                  )
                }
              ]}
            />
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 3. STUDENTS
      // ------------------------------------------------------------------------
      case 'students': {
        const fields = [
          { key: 'name', label: 'Student Full Name', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'roll', label: 'Roll Number', type: 'number', defaultValue: 1 },
          { key: 'attendance', label: 'Attendance (%)', type: 'number', defaultValue: 92 },
          { key: 'score', label: 'Academic Score (%)', type: 'number', defaultValue: 85 },
          { key: 'risk', label: 'AI Risk Level', type: 'select', options: ['Low Risk', 'Medium Risk', 'High Risk'], defaultValue: 'Low Risk' },
          { key: 'parent', label: 'Guardian Name', required: true },
          { key: 'email', label: 'Guardian Email', required: true },
          { key: 'reason', label: 'AI Observation Note', defaultValue: 'Steady academic progress' },
          { key: 'avatar', label: 'Photo URL (Optional)', placeholder: 'https://...' }
        ];
        return (
          <InteractiveDataTable
            title="Student Directory & AI Risk Monitor"
            subtitle="Complete student roster with real-time attendance, scores, and printable report cards."
            data={data.students}
            filterKey="risk"
            filterLabel="Risk Level"
            addLabel="Add Student"
            theme={theme}
            onAdd={() => openCreateModal('students', 'Enroll New Student', fields)}
            onEdit={(row) => openEditModal('students', 'Edit Student Profile', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.name, subtitle: `Class ${row.class} • Roll #${row.roll}`, item: row, avatar: row.avatar })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'students', ids: [row.id], label: row.name })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'students', ids, label: `${ids.length} students` })}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-students.csv')}
            columns={[
              {
                key: 'name',
                label: 'Student',
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <SafeAvatar src={r.avatar} name={r.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-500">Roll #{String(r.roll).padStart(2, '0')} • {r.parent}</p>
                    </div>
                  </div>
                )
              },
              { key: 'class', label: 'Class', render: (r) => <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{r.class}</span> },
              { key: 'attendance', label: 'Attendance', render: (r) => <span className="font-semibold">{r.attendance}%</span> },
              { key: 'score', label: 'Avg Score', render: (r) => <span className="font-bold text-slate-900">{r.score}%</span> },
              {
                key: 'risk',
                label: 'AI Risk',
                render: (r) => (
                  <StatusBadge
                    status={r.risk}
                    onClick={() => setRiskStudent(r)}
                    title="Inspect AI Risk Intervention"
                  />
                )
              },
              {
                key: 'report',
                label: 'Report Card',
                sortable: false,
                render: (r) => (
                  <button
                    type="button"
                    onClick={() => setReportCardStudent(r)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    <Printer className="w-3 h-3" />
                    Report
                  </button>
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 4. ATTENDANCE (INTERACTIVE 1-CLICK ROLL-CALL MATRIX + TABLE)
      // ------------------------------------------------------------------------
      case 'attendance': {
        const fields = [
          { key: 'studentName', label: 'Student Name', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'date', label: 'Date', type: 'date', defaultValue: '2026-05-20' },
          { key: 'status', label: 'Status', type: 'select', options: ['Present', 'Late', 'Absent'], defaultValue: 'Present' },
          { key: 'note', label: 'Remarks', defaultValue: 'On time' }
        ];
        const presentCount = data.attendanceRecords.filter((a) => a.status === 'Present').length;
        const absentCount = data.attendanceRecords.filter((a) => a.status === 'Absent').length;
        const lateCount = data.attendanceRecords.filter((a) => a.status === 'Late').length;

        const markAllPresent = () => {
          setData((prev) => ({
            ...prev,
            attendanceRecords: prev.attendanceRecords.map((a) => ({ ...a, status: 'Present' }))
          }));
          addToast('Marked all students as Present', 'success');
        };

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                  <UserCheck className="w-4 h-4" /> Present: {presentCount}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4" /> Late: {lateCount}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl">
                  <UserX className="w-4 h-4" /> Absent: {absentCount}
                </span>
              </div>
              <button
                type="button"
                onClick={markAllPresent}
                style={{ backgroundColor: theme.primary }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
              >
                Mark All Present
              </button>
            </div>

            <InteractiveDataTable
              title="Daily Roll-Call & Attendance Ledger"
              subtitle="Click any status badge to toggle Present → Late → Absent instantaneously."
              data={data.attendanceRecords}
              filterKey="status"
              addLabel="Log Attendance"
              theme={theme}
              onAdd={() => openCreateModal('attendanceRecords', 'Add Attendance Log', fields)}
              onEdit={(row) => openEditModal('attendanceRecords', 'Edit Attendance Log', fields, row)}
              onView={(row) => setDetailDrawer({ title: row.studentName, subtitle: `${row.class} • ${row.date}`, item: row })}
              onDelete={(row) => setDeleteTarget({ moduleKey: 'attendanceRecords', ids: [row.id], label: row.studentName })}
              onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'attendanceRecords', ids, label: `${ids.length} logs` })}
              onBulkStatus={(ids, st) => handleBulkStatus('attendanceRecords', ids, st)}
              bulkStatusOptions={['Present', 'Late', 'Absent']}
              onExportCSV={(rows) => exportToCSV(rows, 'heroes-attendance.csv')}
              columns={[
                { key: 'studentName', label: 'Student', render: (r) => <span className="font-bold text-slate-900">{r.studentName}</span> },
                { key: 'class', label: 'Class' },
                { key: 'date', label: 'Date' },
                {
                  key: 'status',
                  label: 'Attendance Status',
                  render: (r) => (
                    <StatusBadge
                      status={r.status}
                      onClick={() => cycleRowStatus('attendanceRecords', r.id, ['Present', 'Late', 'Absent'])}
                    />
                  )
                },
                { key: 'note', label: 'Note' }
              ]}
            />
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 5. LESSON PLANS
      // ------------------------------------------------------------------------
      case 'lessons': {
        const fields = [
          { key: 'title', label: 'Lesson Topic', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'subject', label: 'Subject', required: true, defaultValue: 'Physics' },
          { key: 'duration', label: 'Duration', required: true, defaultValue: '45 mins' },
          { key: 'date', label: 'Scheduled Date', type: 'date', defaultValue: '2026-05-26' },
          { key: 'status', label: 'Status', type: 'select', options: ['Published', 'Draft'], defaultValue: 'Published' },
          { key: 'objectives', label: 'Learning Objectives', type: 'textarea', required: true }
        ];
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-300" /> AI Smart Lesson Studio
                </h2>
                <p className="text-xs text-indigo-100 mt-1">
                  Generate standards-aligned lesson plans with objectives and activities in one click.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLessonPlannerOpen(true)}
                className="px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 transition shrink-0"
              >
                Open AI Planner
              </button>
            </div>

            <InteractiveDataTable
              title="Curriculum Lesson Plans"
              subtitle="Organize, publish, and reuse structured lesson modules across your classes."
              data={data.lessons}
              filterKey="status"
              addLabel="New Lesson"
              theme={theme}
              onAdd={() => openCreateModal('lessons', 'Create Lesson Plan', fields)}
              onEdit={(row) => openEditModal('lessons', 'Edit Lesson Plan', fields, row)}
              onView={(row) => setDetailDrawer({ title: row.title, subtitle: `${row.class} • ${row.subject}`, item: row })}
              onDelete={(row) => setDeleteTarget({ moduleKey: 'lessons', ids: [row.id], label: row.title })}
              onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'lessons', ids, label: `${ids.length} lessons` })}
              onBulkStatus={(ids, st) => handleBulkStatus('lessons', ids, st)}
              bulkStatusOptions={['Published', 'Draft']}
              onExportCSV={(rows) => exportToCSV(rows, 'heroes-lessons.csv')}
              columns={[
                {
                  key: 'title',
                  label: 'Lesson Topic',
                  render: (r) => (
                    <div>
                      <p className="font-bold text-slate-900">{r.title}</p>
                      <p className="text-[11px] text-slate-500 max-w-xs truncate">{r.objectives}</p>
                    </div>
                  )
                },
                { key: 'class', label: 'Class' },
                { key: 'duration', label: 'Duration' },
                { key: 'date', label: 'Date' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (
                    <StatusBadge
                      status={r.status}
                      onClick={() => cycleRowStatus('lessons', r.id, ['Published', 'Draft'])}
                    />
                  )
                }
              ]}
            />
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 6. ASSIGNMENTS
      // ------------------------------------------------------------------------
      case 'assignments': {
        const fields = [
          { key: 'title', label: 'Assignment Title', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'dueDate', label: 'Due Date', type: 'date', defaultValue: '2026-05-28' },
          { key: 'submitted', label: 'Submitted Count', type: 'number', defaultValue: 0 },
          { key: 'total', label: 'Total Students', type: 'number', defaultValue: 32 },
          { key: 'toGrade', label: 'Pending Grading', type: 'number', defaultValue: 0 },
          { key: 'status', label: 'Status', type: 'select', options: ['Pending Grading', 'Graded', 'Draft'], defaultValue: 'Pending Grading' }
        ];
        return (
          <InteractiveDataTable
            title="Assignments & Grading Queue"
            subtitle="Changes to 'Pending Grading' sync directly with the main Dashboard KPI counter."
            data={data.assignments}
            filterKey="status"
            addLabel="Create Assignment"
            theme={theme}
            onAdd={() => openCreateModal('assignments', 'New Assignment', fields)}
            onEdit={(row) => openEditModal('assignments', 'Edit Assignment', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.title, subtitle: `Class ${row.class} • Due ${row.dueDate}`, item: row })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'assignments', ids: [row.id], label: row.title })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'assignments', ids, label: `${ids.length} assignments` })}
            onBulkStatus={(ids, st) => handleBulkStatus('assignments', ids, st)}
            bulkStatusOptions={['Graded', 'Pending Grading']}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-assignments.csv')}
            columns={[
              { key: 'title', label: 'Assignment', render: (r) => <span className="font-bold text-slate-900">{r.title}</span> },
              { key: 'class', label: 'Class' },
              { key: 'dueDate', label: 'Due Date' },
              {
                key: 'submitted',
                label: 'Submissions',
                render: (r) => (
                  <span className="font-semibold text-slate-700">
                    {r.submitted} / {r.total}
                  </span>
                )
              },
              {
                key: 'toGrade',
                label: 'To Grade',
                render: (r) => (
                  <span className={`font-bold ${r.toGrade > 0 ? 'text-violet-600' : 'text-emerald-600'}`}>
                    {r.toGrade}
                  </span>
                )
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('assignments', r.id, ['Pending Grading', 'Graded', 'Draft'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 7. AI QUIZ BUILDER
      // ------------------------------------------------------------------------
      case 'quiz': {
        const fields = [
          { key: 'title', label: 'Quiz Title', required: true },
          { key: 'class', label: 'Target Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'topic', label: 'Topic / Chapter', required: true },
          { key: 'questionsCount', label: 'Questions Count', type: 'number', defaultValue: 10 },
          { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], defaultValue: 'Medium' },
          { key: 'avgScore', label: 'Avg Score (%)', type: 'number', defaultValue: 80 },
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Scheduled', 'Draft'], defaultValue: 'Active' }
        ];
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-indigo-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Instant AI Question Synthesizer</h2>
                  <p className="text-xs text-slate-500">Auto-create auto-graded MCQs, rubrics, and lab worksheets.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContentGenOpen(true)}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
              >
                Generate AI Quiz
              </button>
            </div>

            <InteractiveDataTable
              title="AI Quiz Repository"
              subtitle="Manage active, scheduled, and draft quizzes generated with Hero AI."
              data={data.quizzes}
              filterKey="difficulty"
              filterLabel="Difficulty"
              addLabel="Manual Quiz"
              theme={theme}
              onAdd={() => openCreateModal('quizzes', 'Create Quiz', fields)}
              onEdit={(row) => openEditModal('quizzes', 'Edit Quiz', fields, row)}
              onView={(row) => setDetailDrawer({ title: row.title, subtitle: `${row.class} • ${row.topic}`, item: row })}
              onDelete={(row) => setDeleteTarget({ moduleKey: 'quizzes', ids: [row.id], label: row.title })}
              onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'quizzes', ids, label: `${ids.length} quizzes` })}
              onBulkStatus={(ids, st) => handleBulkStatus('quizzes', ids, st)}
              bulkStatusOptions={['Active', 'Scheduled', 'Draft']}
              onExportCSV={(rows) => exportToCSV(rows, 'heroes-quizzes.csv')}
              columns={[
                {
                  key: 'title',
                  label: 'Quiz Title',
                  render: (r) => (
                    <div>
                      <p className="font-bold text-slate-900">{r.title}</p>
                      <p className="text-[11px] text-slate-500">{r.topic}</p>
                    </div>
                  )
                },
                { key: 'class', label: 'Class' },
                { key: 'questionsCount', label: 'Questions', render: (r) => `${r.questionsCount} Qs` },
                { key: 'difficulty', label: 'Difficulty' },
                { key: 'avgScore', label: 'Avg Score', render: (r) => <span className="font-bold">{r.avgScore}%</span> },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (
                    <StatusBadge
                      status={r.status}
                      onClick={() => cycleRowStatus('quizzes', r.id, ['Active', 'Scheduled', 'Draft'])}
                    />
                  )
                }
              ]}
            />
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 8. RESULTS & GRADES
      // ------------------------------------------------------------------------
      case 'results': {
        const fields = [
          { key: 'studentName', label: 'Student Name', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'exam', label: 'Examination', required: true, defaultValue: 'Midterm Physics' },
          { key: 'score', label: 'Score', type: 'number', defaultValue: 85 },
          { key: 'maxScore', label: 'Max Score', type: 'number', defaultValue: 100 },
          { key: 'grade', label: 'Grade', type: 'select', options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'], defaultValue: 'A' },
          { key: 'status', label: 'Status', type: 'select', options: ['Published', 'Pending', 'Under Review'], defaultValue: 'Published' }
        ];
        return (
          <InteractiveDataTable
            title="Results & Academic Gradebook"
            subtitle="Review exam scores, publish official transcripts, and inspect grading distributions."
            data={data.results}
            filterKey="status"
            addLabel="Add Grade"
            theme={theme}
            onAdd={() => openCreateModal('results', 'Record Exam Grade', fields)}
            onEdit={(row) => openEditModal('results', 'Edit Grade', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.studentName, subtitle: `${row.exam} • Grade ${row.grade}`, item: row })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'results', ids: [row.id], label: row.studentName })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'results', ids, label: `${ids.length} grades` })}
            onBulkStatus={(ids, st) => handleBulkStatus('results', ids, st)}
            bulkStatusOptions={['Published', 'Under Review']}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-results.csv')}
            columns={[
              { key: 'studentName', label: 'Student', render: (r) => <span className="font-bold text-slate-900">{r.studentName}</span> },
              { key: 'class', label: 'Class' },
              { key: 'exam', label: 'Assessment' },
              {
                key: 'score',
                label: 'Score',
                render: (r) => (
                  <span className="font-bold text-slate-800">
                    {r.score} / {r.maxScore}
                  </span>
                )
              },
              {
                key: 'grade',
                label: 'Grade',
                render: (r) => (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                    {r.grade}
                  </span>
                )
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('results', r.id, ['Published', 'Pending', 'Under Review'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 9. TIMETABLE
      // ------------------------------------------------------------------------
      case 'timetable': {
        const fields = [
          { key: 'day', label: 'Day', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], defaultValue: 'Wednesday' },
          { key: 'startTime', label: 'Start Time', required: true, defaultValue: '03:00 PM' },
          { key: 'endTime', label: 'End Time', required: true, defaultValue: '03:45 PM' },
          { key: 'title', label: 'Class & Subject', required: true, placeholder: 'Class 10A - Physics' },
          { key: 'room', label: 'Room / Venue', required: true, defaultValue: 'Room 205' },
          { key: 'status', label: 'Status', type: 'select', options: ['Upcoming', 'Live Now', 'Completed'], defaultValue: 'Upcoming' }
        ];
        return (
          <InteractiveDataTable
            title="Master Teaching Timetable"
            subtitle="All changes sync automatically with the right-hand Today's Schedule widget."
            data={data.schedule}
            filterKey="day"
            filterLabel="Day"
            addLabel="Add Slot"
            theme={theme}
            onAdd={() => openCreateModal('schedule', 'Add Schedule Slot', fields)}
            onEdit={(row) => openEditModal('schedule', 'Edit Schedule Slot', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.title, subtitle: `${row.day} • ${row.startTime} - ${row.endTime}`, item: row })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'schedule', ids: [row.id], label: row.title })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'schedule', ids, label: `${ids.length} slots` })}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-timetable.csv')}
            columns={[
              { key: 'day', label: 'Day', render: (r) => <span className="font-semibold">{r.day}</span> },
              {
                key: 'startTime',
                label: 'Time Slot',
                render: (r) => (
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                    {r.startTime} – {r.endTime}
                  </span>
                )
              },
              { key: 'title', label: 'Session', render: (r) => <span className="font-bold text-slate-900">{r.title}</span> },
              { key: 'room', label: 'Room' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('schedule', r.id, ['Upcoming', 'Live Now', 'Completed'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 10. HOMEWORK
      // ------------------------------------------------------------------------
      case 'homework': {
        const fields = [
          { key: 'title', label: 'Homework Title', required: true },
          { key: 'studentName', label: 'Student Name', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'dueDate', label: 'Due Date', type: 'date', defaultValue: '2026-05-24' },
          { key: 'status', label: 'Status', type: 'select', options: ['Submitted', 'Pending', 'Overdue'], defaultValue: 'Pending' }
        ];
        return (
          <InteractiveDataTable
            title="Homework Submission Tracker"
            subtitle="Updating submission status recalculates the Dashboard Homework Donut Chart live."
            data={data.homework}
            filterKey="status"
            addLabel="Assign Homework"
            theme={theme}
            onAdd={() => openCreateModal('homework', 'Assign Homework', fields)}
            onEdit={(row) => openEditModal('homework', 'Edit Homework', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.title, subtitle: `${row.studentName} • ${row.class}`, item: row })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'homework', ids: [row.id], label: row.title })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'homework', ids, label: `${ids.length} homework items` })}
            onBulkStatus={(ids, st) => handleBulkStatus('homework', ids, st)}
            bulkStatusOptions={['Submitted', 'Pending', 'Overdue']}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-homework.csv')}
            columns={[
              { key: 'title', label: 'Homework', render: (r) => <span className="font-bold text-slate-900">{r.title}</span> },
              { key: 'studentName', label: 'Student' },
              { key: 'class', label: 'Class' },
              { key: 'dueDate', label: 'Due Date' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('homework', r.id, ['Submitted', 'Pending', 'Overdue'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 11. COMMUNICATION
      // ------------------------------------------------------------------------
      case 'communication': {
        const fields = [
          { key: 'sender', label: 'Recipient / Contact', required: true },
          { key: 'role', label: 'Role', required: true, defaultValue: 'Parent' },
          { key: 'subject', label: 'Subject', required: true },
          { key: 'preview', label: 'Message Body', type: 'textarea', required: true },
          { key: 'time', label: 'Timestamp', defaultValue: 'Just now' },
          { key: 'status', label: 'Status', type: 'select', options: ['Unread', 'Read'], defaultValue: 'Read' }
        ];
        return (
          <InteractiveDataTable
            title="Parent & Faculty Communication Hub"
            subtitle="Send announcements, review parent messages, and keep audit logs of discussions."
            data={data.messages}
            filterKey="status"
            addLabel="Compose Message"
            theme={theme}
            onAdd={() => openCreateModal('messages', 'Compose New Message', fields)}
            onEdit={(row) => openEditModal('messages', 'Edit Message', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.subject, subtitle: `${row.sender} (${row.role})`, item: row, avatar: row.avatar })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'messages', ids: [row.id], label: row.subject })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'messages', ids, label: `${ids.length} messages` })}
            onBulkStatus={(ids, st) => handleBulkStatus('messages', ids, st)}
            bulkStatusOptions={['Read', 'Unread']}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-messages.csv')}
            columns={[
              {
                key: 'sender',
                label: 'Contact',
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <SafeAvatar src={r.avatar} name={r.sender} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-bold text-slate-900">{r.sender}</p>
                      <p className="text-[11px] text-slate-500">{r.role}</p>
                    </div>
                  </div>
                )
              },
              {
                key: 'subject',
                label: 'Subject & Preview',
                render: (r) => (
                  <div className="max-w-xs">
                    <p className="font-bold text-slate-800 truncate">{r.subject}</p>
                    <p className="text-[11px] text-slate-500 truncate">{r.preview}</p>
                  </div>
                )
              },
              { key: 'time', label: 'Time' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('messages', r.id, ['Read', 'Unread'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 12. LIBRARY
      // ------------------------------------------------------------------------
      case 'library': {
        const fields = [
          { key: 'title', label: 'Resource Title', required: true },
          { key: 'category', label: 'Category', type: 'select', options: ['Textbook', 'Lab Guide', 'Video Series', 'Worksheet'], defaultValue: 'Textbook' },
          { key: 'author', label: 'Author / Source', required: true },
          { key: 'format', label: 'Format', required: true, defaultValue: 'PDF' },
          { key: 'downloads', label: 'Downloads', type: 'number', defaultValue: 0 },
          { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Featured'], defaultValue: 'Available' },
          { key: 'cover', label: 'Cover Image URL', placeholder: 'https://...' }
        ];
        return (
          <InteractiveDataTable
            title="Digital Academic Library"
            subtitle="Curated textbooks, lab manuals, and interactive study assets for Heroes Academy."
            data={data.library}
            filterKey="category"
            filterLabel="Category"
            addLabel="Add Resource"
            theme={theme}
            onAdd={() => openCreateModal('library', 'Upload Library Resource', fields)}
            onEdit={(row) => openEditModal('library', 'Edit Resource', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.title, subtitle: `${row.category} • ${row.author}`, item: row, avatar: row.cover })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'library', ids: [row.id], label: row.title })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'library', ids, label: `${ids.length} resources` })}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-library.csv')}
            columns={[
              {
                key: 'title',
                label: 'Resource',
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <SafeAvatar src={r.cover} name={r.title} className="w-10 h-10 rounded-xl" />
                    <div>
                      <p className="font-bold text-slate-900">{r.title}</p>
                      <p className="text-[11px] text-slate-500">{r.author}</p>
                    </div>
                  </div>
                )
              },
              { key: 'category', label: 'Category' },
              { key: 'format', label: 'Format' },
              { key: 'downloads', label: 'Downloads', render: (r) => <span className="font-bold">{r.downloads}</span> },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('library', r.id, ['Available', 'Featured'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 13. REPORTS & ANALYTICS
      // ------------------------------------------------------------------------
      case 'reports': {
        const avgAttendance = Math.round(
          data.students.reduce((s, st) => s + Number(st.attendance || 0), 0) / Math.max(1, data.students.length)
        );
        const avgScore = Math.round(
          data.students.reduce((s, st) => s + Number(st.score || 0), 0) / Math.max(1, data.students.length)
        );
        const highRiskCount = data.students.filter((s) => s.risk === 'High Risk').length;

        return (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Reports & Academic Analytics</h1>
                <p className="text-xs text-slate-500">Real-time institutional KPIs computed from live ERP records.</p>
              </div>
              <button
                type="button"
                onClick={() => exportToCSV(data.students, 'heroes-full-analytics-report.csv')}
                style={{ backgroundColor: theme.primary }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export Analytics CSV
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Mean Attendance</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{avgAttendance}%</p>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div style={{ width: `${avgAttendance}%` }} className="h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Cohort Mastery Score</span>
                  <Award className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{avgScore}%</p>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div style={{ width: `${avgScore}%`, backgroundColor: theme.primary }} className="h-full rounded-full" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">High Risk Interventions</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-3xl font-extrabold text-rose-600 mt-2">{highRiskCount}</p>
                <p className="text-[11px] text-slate-500 mt-2">Students flagged by Hero AI engine</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Class-by-Class Comparative Benchmark</h3>
              <div className="space-y-4">
                {data.performance['This Month'].map((row) => (
                  <div key={row.cls} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Class {row.cls}</span>
                      <span className="text-slate-500">
                        Average: <strong className="text-slate-900">{row.avg}%</strong> • Top Score:{' '}
                        <strong className="text-indigo-600">{row.top}%</strong>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${row.avg}%`, backgroundColor: theme.primary }} className="h-full transition-all duration-700" />
                      <div style={{ width: `${Math.max(0, row.top - row.avg)}%` }} className="h-full bg-indigo-200 transition-all duration-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 14. LEAVE MANAGEMENT
      // ------------------------------------------------------------------------
      case 'leaves': {
        const fields = [
          { key: 'applicant', label: 'Applicant Name', required: true },
          { key: 'role', label: 'Class / Role', required: true, defaultValue: 'Student (10A)' },
          { key: 'type', label: 'Leave Type', type: 'select', options: ['Medical Leave', 'Family Event', 'Sports Representation', 'Personal'], defaultValue: 'Medical Leave' },
          { key: 'dates', label: 'Date Range', required: true, defaultValue: 'May 26 - May 27' },
          { key: 'days', label: 'Days', type: 'number', defaultValue: 1 },
          { key: 'reason', label: 'Reason', type: 'textarea', required: true },
          { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'], defaultValue: 'Pending' }
        ];
        return (
          <InteractiveDataTable
            title="Leave Management & Approvals"
            subtitle="Approving or rejecting requests immediately updates the Pending Leave Requests card on the Dashboard."
            data={data.leaves}
            filterKey="status"
            addLabel="Add Leave Request"
            theme={theme}
            onAdd={() => openCreateModal('leaves', 'Submit Leave Request', fields)}
            onEdit={(row) => openEditModal('leaves', 'Edit Leave Request', fields, row)}
            onView={(row) => setDetailDrawer({ title: row.applicant, subtitle: `${row.type} • ${row.dates}`, item: row })}
            onDelete={(row) => setDeleteTarget({ moduleKey: 'leaves', ids: [row.id], label: row.applicant })}
            onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'leaves', ids, label: `${ids.length} leave requests` })}
            onBulkStatus={(ids, st) => handleBulkStatus('leaves', ids, st)}
            bulkStatusOptions={['Approved', 'Rejected', 'Pending']}
            onExportCSV={(rows) => exportToCSV(rows, 'heroes-leaves.csv')}
            columns={[
              {
                key: 'applicant',
                label: 'Applicant',
                render: (r) => (
                  <div>
                    <p className="font-bold text-slate-900">{r.applicant}</p>
                    <p className="text-[11px] text-slate-500">{r.role}</p>
                  </div>
                )
              },
              { key: 'type', label: 'Type' },
              { key: 'dates', label: 'Dates' },
              { key: 'days', label: 'Days', render: (r) => `${r.days}d` },
              { key: 'reason', label: 'Reason', render: (r) => <span className="max-w-[180px] block truncate">{r.reason}</span> },
              {
                key: 'status',
                label: 'Approval Status',
                render: (r) => (
                  <StatusBadge
                    status={r.status}
                    onClick={() => cycleRowStatus('leaves', r.id, ['Pending', 'Approved', 'Rejected'])}
                  />
                )
              }
            ]}
          />
        );
      }

      // ------------------------------------------------------------------------
      // 15. FEES (VIEW)
      // ------------------------------------------------------------------------
      case 'fees': {
        const fields = [
          { key: 'studentName', label: 'Student Name', required: true },
          { key: 'class', label: 'Class', type: 'select', options: ['9C', '10A', '11B', '12A'], defaultValue: '10A' },
          { key: 'term', label: 'Billing Term', required: true, defaultValue: 'Term 2 - 2026' },
          { key: 'amount', label: 'Total Fee ($)', type: 'number', defaultValue: 1450 },
          { key: 'paid', label: 'Paid Amount ($)', type: 'number', defaultValue: 1450 },
          { key: 'dueDate', label: 'Due Date', type: 'date', defaultValue: '2026-05-30' },
          { key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Partial', 'Overdue'], defaultValue: 'Paid' }
        ];
        const totalExpected = data.fees.reduce((s, f) => s + Number(f.amount || 0), 0);
        const totalCollected = data.fees.reduce((s, f) => s + Number(f.paid || 0), 0);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <p className="text-xs text-slate-500">Total Billed</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">${totalExpected.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <p className="text-xs text-slate-500">Collected</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalCollected.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <p className="text-xs text-slate-500">Outstanding Balance</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">
                  ${Math.max(0, totalExpected - totalCollected).toLocaleString()}
                </p>
              </div>
            </div>

            <InteractiveDataTable
              title="Student Tuition & Fee Ledger"
              subtitle="Read-and-manage institutional tuition status across your assigned classes."
              data={data.fees}
              filterKey="status"
              addLabel="Add Fee Record"
              theme={theme}
              onAdd={() => openCreateModal('fees', 'Add Fee Entry', fields)}
              onEdit={(row) => openEditModal('fees', 'Edit Fee Entry', fields, row)}
              onView={(row) => setDetailDrawer({ title: row.studentName, subtitle: `${row.term} • Class ${row.class}`, item: row })}
              onDelete={(row) => setDeleteTarget({ moduleKey: 'fees', ids: [row.id], label: row.studentName })}
              onBulkDelete={(ids) => setDeleteTarget({ moduleKey: 'fees', ids, label: `${ids.length} fee records` })}
              onBulkStatus={(ids, st) => handleBulkStatus('fees', ids, st)}
              bulkStatusOptions={['Paid', 'Partial', 'Overdue']}
              onExportCSV={(rows) => exportToCSV(rows, 'heroes-fees.csv')}
              columns={[
                { key: 'studentName', label: 'Student', render: (r) => <span className="font-bold text-slate-900">{r.studentName}</span> },
                { key: 'class', label: 'Class' },
                { key: 'term', label: 'Term' },
                { key: 'amount', label: 'Amount', render: (r) => `$${Number(r.amount).toLocaleString()}` },
                { key: 'paid', label: 'Paid', render: (r) => <span className="font-semibold text-emerald-700">${Number(r.paid).toLocaleString()}</span> },
                { key: 'dueDate', label: 'Due Date' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => (
                    <StatusBadge
                      status={r.status}
                      onClick={() => cycleRowStatus('fees', r.id, ['Paid', 'Partial', 'Overdue'])}
                    />
                  )
                }
              ]}
            />
          </div>
        );
      }

      // ------------------------------------------------------------------------
      // 16. SETTINGS (PROFILE, LIVE ACCENT THEME SWITCHER & DATA RESET)
      // ------------------------------------------------------------------------
      case 'settings': {
        return (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Workspace Settings & Preferences</h1>
              <p className="text-xs text-slate-500">Customize Heroes AI ERP branding colors, profile details, and local storage persistence.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Profile Editor */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Teacher Profile</h3>
                <div className="flex items-center gap-4">
                  <SafeAvatar src={data.teacher.avatar} name={data.teacher.name} className="w-16 h-16 rounded-2xl ring-4 ring-indigo-50" />
                  <div>
                    <p className="font-bold text-slate-900">{data.teacher.fullName}</p>
                    <p className="text-xs text-slate-500">{data.teacher.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={data.teacher.name}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, name: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={data.teacher.role}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, role: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={data.teacher.email}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          teacher: { ...prev.teacher, email: e.target.value }
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Profile preferences saved locally', 'success')}
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
                >
                  Save Profile
                </button>
              </div>

              {/* Theme Palette & Data Persistence */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Brand Accent Theme</h3>
                  <p className="text-xs text-slate-500">Switch the active primary palette across the entire Heroes AI ERP interface.</p>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setData((prev) => ({ ...prev, themeKey: key }));
                          addToast(`Theme switched to ${preset.name}`, 'success');
                        }}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                          data.themeKey === key
                            ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span style={{ backgroundColor: preset.primary }} className="w-6 h-6 rounded-full shrink-0 shadow-xs" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{preset.name}</p>
                          <p className="text-[10px] text-slate-500">{preset.primary}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-rose-50/60 rounded-2xl border border-rose-200/80 p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">Reset Default ERP Data</h3>
                    <p className="text-xs text-rose-700/80 mt-0.5">
                      Clear all locally saved edits and restore the original Heroes AI ERP 2026 seed dataset.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ============================================================================
  // 6. FULL 3-COLUMN LAYOUT SHELL (LEFT SIDEBAR + STICKY TOPBAR + CENTER + RIGHT SIDEBAR)
  // ============================================================================

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <HeroesBrandLogo primary={theme.primary} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-extrabold text-slate-900 tracking-tight truncate">
              Heroes AI
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              ERP
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight truncate">
            Smart Education with AI
          </p>
        </div>
      </div>

      {/* Active Edition Banner Pill (Matches Screenshot) */}
      <div className="px-3.5 mb-3">
        <div
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
          className="rounded-xl px-3.5 py-2.5 text-white flex items-center gap-2.5 shadow-md shadow-indigo-500/20"
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">Heroes AI ERP</p>
            <p className="text-[10px] text-white/80 font-medium">2026 Edition</p>
          </div>
        </div>
      </div>

      {/* 16 Menu Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar pb-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveNav(item.id);
                setMobileMenuOpen(false);
              }}
              style={active ? { backgroundColor: theme.primarySoft, color: theme.primary } : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-all relative ${
                active
                  ? 'shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              {active && (
                <span
                  style={{ backgroundColor: theme.primary }}
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.id === 'leaves' && stats.pendingLeaves > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {stats.pendingLeaves}
                </span>
              )}
            </button>
          );
        })}

        {/* Bottom Meet Hero AI Card (Matches Screenshot) */}
        <div className="pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/90 to-sky-50/70 border border-indigo-100 p-3.5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-indigo-900">Meet Hero AI</p>
                <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                  Your AI Teaching Assistant for smarter & faster teaching.
                </p>
              </div>
              <HeroBotIllustration />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAiChatOpen(true);
                setMobileMenuOpen(false);
              }}
              style={{ backgroundColor: theme.primary }}
              className="mt-3 w-full py-2 rounded-xl text-[11px] font-bold text-white shadow-sm hover:brightness-110 transition"
            >
              Chat with Hero AI
            </button>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="h-dvh w-full bg-[#F8FAFC] text-slate-900 flex overflow-hidden font-sans antialiased">

      {/* Desktop Left Sidebar (244px Fixed, Independent Scroll) */}
      <aside className="hidden lg:flex lg:w-[244px] shrink-0 bg-white border-r border-slate-200/80 flex-col h-full">
        {renderSidebar()}
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[260px] max-w-[82vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebar()}
          </aside>
        </div>
      )}

      {/* Right Main Area (Sticky Topbar + Independent Scrolling Workspace + Right Utility Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Sticky Topbar (64px) */}
        <header className="h-[64px] shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Spotlight Search Bar */}
            <button
              type="button"
              onClick={() => setIsCmdOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs text-slate-400 transition"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Search students, classes, assignments, resources...</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md shrink-0">
                ⌘ K
              </kbd>
            </button>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotifDropdownOpen((v) => !v);
                  setIsProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {stats.unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {stats.unreadNotifs}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          notifications: prev.notifications.map((n) => ({ ...n, unread: false }))
                        }));
                        setIsNotifDropdownOpen(false);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {data.notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl hover:bg-slate-50 text-xs">
                        <p className="font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages Shortcut */}
            <button
              type="button"
              onClick={() => setActiveNav('communication')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Teacher Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen((v) => !v);
                  setIsNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100/80 transition"
              >
                <SafeAvatar src={data.teacher.avatar} name={data.teacher.name} className="w-8 h-8 rounded-full ring-2 ring-indigo-100" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{data.teacher.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{data.teacher.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 animate-fadeIn text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    <Settings className="w-3.5 h-3.5" /> Profile & Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiChatOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-indigo-600 font-semibold"
                  >
                    <Bot className="w-3.5 h-3.5" /> Open Hero AI
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetConfirmOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Data Default
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body Split: Independent Scroll Main Canvas + Right Utility Sidebar (Calendar, Schedule, Smart Reminders) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Scrollable Main Workspace */}
          <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-4 sm:p-5 lg:p-6">
            {renderMainContent()}
          </main>

          {/* Right Utility Sidebar (300px on xl+, Independent Scroll — Exact 1:1 Match to Screenshot) */}
          <aside className="hidden xl:block w-[300px] shrink-0 border-l border-slate-200/80 bg-white overflow-y-auto custom-scrollbar p-4 space-y-5">
            {/* Calendar Widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((prev) =>
                        prev.month === 0
                          ? { year: prev.year - 1, month: 11 }
                          : { ...prev, month: prev.month - 1 }
                      )
                    }
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 min-w-[78px] text-center">
                    {monthNames[calendarMonth.month].slice(0, 3)} {calendarMonth.year}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth((prev) =>
                        prev.month === 11
                          ? { year: prev.year + 1, month: 0 }
                          : { ...prev, month: prev.month + 1 }
                      )
                    }
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1.5">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {calendarGrid.map((cell, idx) => {
                  const isSelected = cell.current && cell.day === selectedDay;
                  const hasDot = cell.current && [21, 22, 23, 24].includes(cell.day);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!cell.current}
                      onClick={() => cell.current && setSelectedDay(cell.day)}
                      style={isSelected ? { backgroundColor: theme.primary } : undefined}
                      className={`relative mx-auto w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center transition ${
                        !cell.current
                          ? 'text-slate-300 cursor-default'
                          : isSelected
                          ? 'text-white shadow-sm'
                          : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      {cell.day}
                      {hasDot && !isSelected && (
                        <span
                          style={{ backgroundColor: theme.primary }}
                          className="absolute bottom-0.5 w-1 h-1 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
                <button
                  type="button"
                  onClick={() => setActiveNav('timetable')}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  View Timetable
                </button>
              </div>
              <div className="space-y-2.5">
                {data.schedule.map((slot) => {
                  const isNow = slot.status === 'Live Now' || slot.isNow;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setActiveNav('timetable')}
                      className={`cursor-pointer rounded-xl p-2.5 border transition flex items-center gap-3 relative overflow-hidden ${
                        isNow
                          ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: isNow ? theme.primary : '#94A3B8' }}
                        className="absolute left-0 top-0 bottom-0 w-1"
                      />
                      <div className="text-[10px] font-bold text-slate-500 pl-1.5 leading-tight shrink-0 w-14">
                        <div>{slot.startTime}</div>
                        <div className="text-slate-400 font-medium">{slot.endTime}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{slot.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{slot.room}</p>
                      </div>
                      {isNow && (
                        <span
                          style={{ backgroundColor: theme.primary }}
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0"
                        >
                          Now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Smart Reminders */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Smart Reminders</h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setActiveNav('timetable')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-violet-50/60 hover:bg-violet-50 border border-violet-100/80 text-left transition"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Upcoming Lecture</p>
                    <p className="text-[10px] text-slate-500 truncate">Class 10A - Physics in 15 mins</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveNav('assignments')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100/80 text-left transition"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Pending Evaluations</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {stats.assignmentsToGrade} assignments to grade
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveNav('timetable')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100/80 text-left transition"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Next Free Slot</p>
                    <p className="text-[10px] text-slate-500 truncate">Today 12:00 PM - 02:00 PM</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActiveNav('timetable')}
                className="mt-3 w-full text-center text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                View All Reminders
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ========================================================================
          7. MODALS, SLIDE-OVER DRAWERS & TOAST SYSTEM
         ======================================================================== */}

      {/* Spotlight Command Palette (Cmd+K) */}
      {isCmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4"
          onClick={() => setIsCmdOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-indigo-600" />
              <input
                autoFocus
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Jump to module, student, or action..."
                className="flex-1 text-sm focus:outline-none text-slate-800"
              />
              <button
                type="button"
                onClick={() => setIsCmdOpen(false)}
                className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-200"
              >
                ESC
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(cmdQuery.toLowerCase())).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setIsCmdOpen(false);
                      setCmdQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span>Go to {item.label}</span>
                  </button>
                );
              })}
              {data.students
                .filter((s) => s.name.toLowerCase().includes(cmdQuery.toLowerCase()))
                .slice(0, 4)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setRiskStudent(s);
                      setIsCmdOpen(false);
                      setCmdQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-xs"
                  >
                    <span className="flex items-center gap-2.5 font-semibold text-slate-800">
                      <SafeAvatar src={s.avatar} name={s.name} className="w-6 h-6 rounded-full" />
                      {s.name} ({s.class})
                    </span>
                    <StatusBadge status={s.risk} />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero AI Chat Assistant Slide-Over Drawer */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAiChatOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-fadeIn">
            <div
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
              className="p-4 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Hero AI Teaching Assistant</h3>
                  <p className="text-[11px] text-white/80">Connected to live ERP context</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAiChatOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 custom-scrollbar">
              {aiMessages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    style={m.sender === 'user' ? { backgroundColor: theme.primary } : undefined}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed shadow-2xs ${
                      m.sender === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {['Analyze high-risk students', 'Draft 10A Physics lesson', 'Generate 3 quiz MCQs'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSendAiChat(null, chip)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSendAiChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask Hero AI anything..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-indigo-400"
                />
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="p-2.5 rounded-xl text-white shadow-sm hover:brightness-110 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Lesson Planner Modal */}
      {isLessonPlannerOpen && (
        <AiLessonPlannerModal
          theme={theme}
          onClose={() => setIsLessonPlannerOpen(false)}
          onSave={(newLesson) => {
            setData((prev) => ({ ...prev, lessons: [newLesson, ...prev.lessons] }));
            addToast(`AI Lesson "${newLesson.title}" added to Lesson Plans`, 'success');
            setIsLessonPlannerOpen(false);
            setActiveNav('lessons');
          }}
        />
      )}

      {/* AI Content / Quiz Generator Modal */}
      {isContentGenOpen && (
        <AiContentGeneratorModal
          theme={theme}
          onClose={() => setIsContentGenOpen(false)}
          onSave={(newQuiz) => {
            setData((prev) => ({ ...prev, quizzes: [newQuiz, ...prev.quizzes] }));
            addToast(`AI Quiz "${newQuiz.title}" saved to AI Quiz Builder`, 'success');
            setIsContentGenOpen(false);
            setActiveNav('quiz');
          }}
        />
      )}

      {/* Quick Links Customizer Modal */}
      {isQuickLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Customize Quick Links</h3>
              <button type="button" onClick={() => setIsQuickLinkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Select shortcuts to display on your Teacher Dashboard strip.</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {ALL_QUICK_LINKS.map((ql) => {
                const checked = data.quickLinkIds.includes(ql.id);
                return (
                  <button
                    key={ql.id}
                    type="button"
                    onClick={() => {
                      setData((prev) => {
                        const exists = prev.quickLinkIds.includes(ql.id);
                        const next = exists
                          ? prev.quickLinkIds.filter((x) => x !== ql.id)
                          : [...prev.quickLinkIds, ql.id];
                        return { ...prev, quickLinkIds: next.length ? next : prev.quickLinkIds };
                      });
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                      checked ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {checked ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{ql.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsQuickLinkModalOpen(false);
                  addToast('Quick Links updated', 'success');
                }}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Create / Edit CRUD Modal */}
      {crudModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{crudModal.title}</h3>
              <button type="button" onClick={() => setCrudModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCrud} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {crudModal.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select
                      value={crudForm[f.key] ?? ''}
                      onChange={(e) => setCrudForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
                    >
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={crudForm[f.key] ?? ''}
                      onChange={(e) => setCrudForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={crudForm[f.key] ?? ''}
                      onChange={(e) => setCrudForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
                    />
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCrudModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
                >
                  {crudModal.mode === 'create' ? 'Create Entry' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Slide-Over Drawer */}
      {detailDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDetailDrawer(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {detailDrawer.avatar && (
                  <SafeAvatar src={detailDrawer.avatar} name={detailDrawer.title} className="w-11 h-11 rounded-xl" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{detailDrawer.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{detailDrawer.subtitle}</p>
                </div>
              </div>
              <button type="button" onClick={() => setDetailDrawer(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {Object.entries(detailDrawer.item)
                .filter(([k]) => !['avatar', 'cover', 'isNow'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-1 break-words">{String(v)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Student Risk Intervention Drawer */}
      {riskStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setRiskStudent(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SafeAvatar src={riskStudent.avatar} name={riskStudent.name} className="w-11 h-11 rounded-full" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{riskStudent.name}</h3>
                  <p className="text-xs text-slate-500">Class {riskStudent.class} • Guardian: {riskStudent.parent}</p>
                </div>
              </div>
              <button type="button" onClick={() => setRiskStudent(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">AI Risk Assessment</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{riskStudent.reason}</p>
                </div>
                <StatusBadge status={riskStudent.risk} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[11px] text-indigo-700 font-semibold">Attendance</p>
                  <p className="text-2xl font-extrabold text-indigo-900 mt-1">{riskStudent.attendance}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[11px] text-amber-700 font-semibold">Average Score</p>
                  <p className="text-2xl font-extrabold text-amber-900 mt-1">{riskStudent.score}%</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 space-y-2">
                <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Hero AI Recommended Plan
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>Schedule 20-minute after-class Physics Mechanics recap.</li>
                  <li>Assign targeted interactive worksheet with guided hints.</li>
                  <li>Notify {riskStudent.parent} with weekly milestone tracker.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setData((prev) => ({
                    ...prev,
                    messages: [
                      {
                        id: `MSG-${Date.now()}`,
                        sender: riskStudent.parent,
                        role: `Parent (${riskStudent.name})`,
                        subject: `AI Support Plan for ${riskStudent.name}`,
                        time: 'Just now',
                        status: 'Read',
                        preview: `Sent automated Hero AI progress intervention plan for ${riskStudent.name}.`
                      },
                      ...prev.messages
                    ]
                  }));
                  addToast(`Parent outreach logged for ${riskStudent.parent}`, 'success');
                  setRiskStudent(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:brightness-110 transition"
              >
                Send Parent Intervention
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportCardStudent(riskStudent);
                  setRiskStudent(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Report Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Student Report Card Modal */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
              className="p-5 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <HeroesBrandLogo primary="#1E1B4B" />
                <div>
                  <h3 className="text-sm font-extrabold">Heroes International Academy</h3>
                  <p className="text-[11px] text-white/80">Official Academic Progress Transcript • 2026</p>
                </div>
              </div>
              <button type="button" onClick={() => setReportCardStudent(null)} className="p-1 rounded-lg hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <SafeAvatar src={reportCardStudent.avatar} name={reportCardStudent.name} className="w-12 h-12 rounded-xl" />
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{reportCardStudent.name}</p>
                    <p className="text-slate-500">Class {reportCardStudent.class} • Roll #{reportCardStudent.roll}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Overall Grade</p>
                  <p className="text-xl font-extrabold text-indigo-600">
                    {reportCardStudent.score >= 90 ? 'A+' : reportCardStudent.score >= 80 ? 'A' : reportCardStudent.score >= 70 ? 'B' : 'C+'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-slate-500">Physics & Lab Average</p>
                  <p className="text-lg font-extrabold text-slate-900">{reportCardStudent.score}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <p className="text-slate-500">Term Attendance</p>
                  <p className="text-lg font-extrabold text-emerald-600">{reportCardStudent.attendance}%</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <p className="font-bold text-indigo-900">Faculty Remarks ({data.teacher.name})</p>
                <p className="text-slate-600 mt-1">{reportCardStudent.reason}.</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportCardStudent(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    addToast('Opened print preview for Report Card', 'info');
                  }}
                  style={{ backgroundColor: theme.primary }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (No browser confirm()) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete <strong>{deleteTarget.label}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset All ERP Data?</h3>
                <p className="text-xs text-slate-500">Restores default Heroes AI ERP 2026 data.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All custom records, attendance changes, and theme selections saved in your browser storage will be reset.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Stack */}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-fadeIn ${
              t.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : t.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-white text-slate-800 border-emerald-200'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                t.type === 'error' ? 'text-white' : t.type === 'info' ? 'text-indigo-400' : 'text-emerald-500'
              }`}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
