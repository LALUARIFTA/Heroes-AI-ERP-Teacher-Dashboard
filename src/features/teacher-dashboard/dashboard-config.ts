import {
  BarChart3, BookMarked, BookOpen, Bot, Calendar, CalendarOff, ClipboardCheck,
  CreditCard, FileEdit, FileText, LayoutDashboard, Library, MessageSquare, PieChart,
  Settings, Sparkles, Users,
} from 'lucide-react';

export { ALL_QUICK_LINKS, DEFAULT_QUICK_LINK_IDS, NAV_ITEMS, STORAGE_KEY, THEME_PRESETS };

const STORAGE_KEY = 'heroes_ai_erp_2026_v3';

const THEME_PRESETS = {
  indigo: {
    name: 'Royal Indigo',
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primarySoft: '#EEF2FF',
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',
    gradient: 'from-indigo-600 to-violet-600',
    ring: 'focus:ring-indigo-500/30',
    text: 'text-indigo-600',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    bgSoft: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#059669',
    primaryDark: '#047857',
    primarySoft: '#ECFDF5',
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',
    gradient: 'from-emerald-600 to-teal-600',
    ring: 'focus:ring-emerald-500/30',
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgSoft: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  cyan: {
    name: 'Ocean Cyan',
    primary: '#0284C7',
    primaryDark: '#0369A1',
    primarySoft: '#F0F9FF',
    accent: '#8B5CF6',
    accentSoft: '#F3E8FF',
    gradient: 'from-sky-600 to-indigo-600',
    ring: 'focus:ring-sky-500/30',
    text: 'text-sky-600',
    bg: 'bg-sky-600',
    bgHover: 'hover:bg-sky-700',
    bgSoft: 'bg-sky-50',
    border: 'border-sky-200'
  },
  violet: {
    name: 'Electric Violet',
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primarySoft: '#F5F3FF',
    accent: '#EC4899',
    accentSoft: '#FCE7F3',
    gradient: 'from-violet-600 to-fuchsia-600',
    ring: 'focus:ring-violet-500/30',
    text: 'text-violet-600',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-700',
    bgSoft: 'bg-violet-50',
    border: 'border-violet-200'
  }
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'My Classes', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'lessons', label: 'Lesson Plans', icon: FileText },
  { id: 'assignments', label: 'Assignments', icon: FileEdit },
  { id: 'quiz', label: 'AI Quiz Builder', icon: Sparkles },
  { id: 'results', label: 'Results & Grades', icon: BarChart3 },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'homework', label: 'Homework', icon: BookMarked },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'reports', label: 'Reports & Analytics', icon: PieChart },
  { id: 'leaves', label: 'Leave Management', icon: CalendarOff },
  { id: 'fees', label: 'Fees (View)', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const ALL_QUICK_LINKS = [
  { id: 'students', label: 'Class Roster', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'timetable', label: 'Timetable', icon: Calendar, color: 'text-violet-600 bg-violet-50' },
  { id: 'lessons', label: 'Lesson Plans', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, color: 'text-sky-600 bg-sky-50' },
  { id: 'assignments', label: 'Assignments', icon: FileEdit, color: 'text-amber-600 bg-amber-50' },
  { id: 'results', label: 'Results', icon: BarChart3, color: 'text-teal-600 bg-teal-50' },
  { id: 'quiz', label: 'AI Quiz Builder', icon: Bot, color: 'text-purple-600 bg-purple-50' },
  { id: 'homework', label: 'Homework', icon: BookMarked, color: 'text-rose-600 bg-rose-50' },
  { id: 'library', label: 'Library', icon: Library, color: 'text-cyan-600 bg-cyan-50' },
  { id: 'leaves', label: 'Leave Requests', icon: CalendarOff, color: 'text-orange-600 bg-orange-50' }
];

const DEFAULT_QUICK_LINK_IDS = [
  'students',
  'timetable',
  'lessons',
  'attendance',
  'assignments',
  'results',
  'quiz'
];
