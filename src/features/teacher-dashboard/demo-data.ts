import { DEFAULT_QUICK_LINK_IDS } from './dashboard-config';

export const INITIAL_DATA = {
  themeKey: 'indigo',
  teacher: {
    name: 'Ms. Clara',
    fullName: 'Clara Vance, M.Sc.',
    role: 'Senior Teacher',
    department: 'Applied Sciences & Physics',
    email: 'clara.vance@heroes-erp.edu',
    phone: '+62 812-3456-7890',
    school: 'Heroes International Academy',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=320',
    heroPortrait: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=500'
  },
  quickLinkIds: DEFAULT_QUICK_LINK_IDS,
  classes: [
    { id: 'CLS-101', name: 'Class 9C', subject: 'Physics Fundamentals', room: 'Room 204', studentsCount: 30, avgScore: 81, schedule: 'Mon, Wed, Fri • 08:30 AM', status: 'Active' },
    { id: 'CLS-102', name: 'Class 10A', subject: 'Physics - Mechanics', room: 'Room 205', studentsCount: 34, avgScore: 86, schedule: 'Mon - Thu • 09:30 AM', status: 'Active' },
    { id: 'CLS-103', name: 'Class 11B', subject: 'Physics Lab & Optics', room: 'Lab 1', studentsCount: 32, avgScore: 79, schedule: 'Tue, Thu • 11:15 AM', status: 'Active' },
    { id: 'CLS-104', name: 'Class 12A', subject: 'AP Physics & Quantum', room: 'Room 206', studentsCount: 32, avgScore: 89, schedule: 'Mon, Wed, Fri • 02:00 PM', status: 'Active' }
  ],
  students: [
    { id: 'STU-1001', name: 'Rohan Mehta', class: '10A', roll: 12, attendance: 76, score: 62, risk: 'High Risk', reason: 'Declining in Physics & Maths', parent: 'Dr. Vikram Mehta', email: 'v.mehta@heroes-erp.edu', status: 'Needs Attention', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1002', name: 'Aisha Khan', class: '11B', roll: 4, attendance: 84, score: 71, risk: 'Medium Risk', reason: 'Low assignment submission', parent: 'Farhan Khan', email: 'f.khan@heroes-erp.edu', status: 'Monitoring', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1003', name: 'Karan Verma', class: '9C', roll: 19, attendance: 89, score: 77, risk: 'Low Risk', reason: 'Needs improvement in Tests', parent: 'Anil Verma', email: 'a.verma@heroes-erp.edu', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1004', name: 'Sophia Chen', class: '10A', roll: 18, attendance: 98, score: 96, risk: 'Low Risk', reason: 'Top performer in AP Physics', parent: 'Mei-Ling Chen', email: 'm.chen@heroes-erp.edu', status: 'Active', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1005', name: 'Lucas Miller', class: '12A', roll: 22, attendance: 74, score: 65, risk: 'High Risk', reason: 'Missed 2 lab evaluations', parent: 'Robert Miller', email: 'r.miller@heroes-erp.edu', status: 'Needs Attention', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1006', name: 'Emma Watson', class: '10A', roll: 8, attendance: 94, score: 91, risk: 'Low Risk', reason: 'Consistent lab leadership', parent: 'James Watson', email: 'j.watson@heroes-erp.edu', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1007', name: 'Arjun Singh', class: '10A', roll: 3, attendance: 91, score: 85, risk: 'Low Risk', reason: 'Strong analytical problem solving', parent: 'Rajesh Singh', email: 'r.singh@heroes-erp.edu', status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
    { id: 'STU-1008', name: 'Nadia Putri', class: '11B', roll: 11, attendance: 96, score: 92, risk: 'Low Risk', reason: 'Excellent optics lab reports', parent: 'Hendra Wijaya', email: 'h.wijaya@heroes-erp.edu', status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }
  ],
  attendanceRecords: [
    { id: 'ATT-1', studentId: 'STU-1001', studentName: 'Rohan Mehta', class: '10A', date: '2026-05-20', status: 'Absent', note: 'Parent notified via SMS' },
    { id: 'ATT-2', studentId: 'STU-1002', studentName: 'Aisha Khan', class: '11B', date: '2026-05-20', status: 'Late', note: 'Arrived 10 mins late' },
    { id: 'ATT-3', studentId: 'STU-1003', studentName: 'Karan Verma', class: '9C', date: '2026-05-20', status: 'Present', note: 'On time' },
    { id: 'ATT-4', studentId: 'STU-1004', studentName: 'Sophia Chen', class: '10A', date: '2026-05-20', status: 'Present', note: 'Lab monitor' },
    { id: 'ATT-5', studentId: 'STU-1005', studentName: 'Lucas Miller', class: '12A', date: '2026-05-20', status: 'Present', note: 'Submitted medical slip' },
    { id: 'ATT-6', studentId: 'STU-1006', studentName: 'Emma Watson', class: '10A', date: '2026-05-20', status: 'Present', note: 'On time' },
    { id: 'ATT-7', studentId: 'STU-1007', studentName: 'Arjun Singh', class: '10A', date: '2026-05-20', status: 'Present', note: 'On time' },
    { id: 'ATT-8', studentId: 'STU-1008', studentName: 'Nadia Putri', class: '11B', date: '2026-05-20', status: 'Present', note: 'On time' }
  ],
  lessons: [
    { id: 'LES-201', title: 'Newtonian Laws & Friction', class: '10A', subject: 'Physics', duration: '45 mins', date: '2026-05-21', status: 'Published', objectives: 'Analyze free-body diagrams and compute static vs kinetic friction.' },
    { id: 'LES-202', title: 'Wave Optics & Interference', class: '11B', subject: 'Physics', duration: '60 mins', date: '2026-05-22', status: 'Published', objectives: 'Demonstrate Young double-slit diffraction patterns in Lab 1.' },
    { id: 'LES-203', title: 'Thermodynamics: Entropy', class: '12A', subject: 'AP Physics', duration: '50 mins', date: '2026-05-24', status: 'Draft', objectives: 'Evaluate Carnot engine efficiency and second law implications.' },
    { id: 'LES-204', title: 'Kinematics Graphs Workshop', class: '9C', subject: 'Physics', duration: '45 mins', date: '2026-05-25', status: 'Published', objectives: 'Interpret velocity-time and acceleration-time slope areas.' }
  ],
  assignments: [
    { id: 'ASG-301', title: 'Physics Motion Worksheet #4', class: '10A', dueDate: '2026-05-22', submitted: 28, total: 34, toGrade: 6, status: 'Pending Grading' },
    { id: 'ASG-302', title: 'Optics Refraction Lab Report', class: '11B', dueDate: '2026-05-23', submitted: 26, total: 32, toGrade: 4, status: 'Pending Grading' },
    { id: 'ASG-303', title: 'Quantum Photoelectric Set', class: '12A', dueDate: '2026-05-24', submitted: 30, total: 32, toGrade: 2, status: 'Pending Grading' },
    { id: 'ASG-304', title: 'Vectors & Scalars Diagnostic', class: '9C', dueDate: '2026-05-18', submitted: 30, total: 30, toGrade: 0, status: 'Graded' }
  ],
  quizzes: [
    { id: 'QZ-401', title: 'Kinematics Rapid Check', class: '10A', topic: 'Motion in 1D & 2D', questionsCount: 10, difficulty: 'Medium', status: 'Active', avgScore: 84 },
    { id: 'QZ-402', title: 'Chemistry Stoichiometry Quiz', class: '11B', topic: 'Molarity & Reactions', questionsCount: 15, difficulty: 'Hard', status: 'Scheduled', avgScore: 78 },
    { id: 'QZ-403', title: 'Electromagnetism Mastery', class: '12A', topic: 'Faraday & Lenz Law', questionsCount: 12, difficulty: 'Hard', status: 'Draft', avgScore: 88 }
  ],
  results: [
    { id: 'RES-501', studentName: 'Sophia Chen', class: '10A', exam: 'Midterm Physics', score: 96, maxScore: 100, grade: 'A+', status: 'Published' },
    { id: 'RES-502', studentName: 'Emma Watson', class: '10A', exam: 'Midterm Physics', score: 91, maxScore: 100, grade: 'A', status: 'Published' },
    { id: 'RES-503', studentName: 'Arjun Singh', class: '10A', exam: 'Midterm Physics', score: 85, maxScore: 100, grade: 'A-', status: 'Published' },
    { id: 'RES-504', studentName: 'Rohan Mehta', class: '10A', exam: 'Midterm Physics', score: 62, maxScore: 100, grade: 'C', status: 'Under Review' },
    { id: 'RES-505', studentName: 'Nadia Putri', class: '11B', exam: 'Optics Lab Exam', score: 92, maxScore: 100, grade: 'A', status: 'Published' },
    { id: 'RES-506', studentName: 'Aisha Khan', class: '11B', exam: 'Optics Lab Exam', score: 71, maxScore: 100, grade: 'B-', status: 'Pending' },
    { id: 'RES-507', studentName: 'Lucas Miller', class: '12A', exam: 'Quantum Assessment', score: 65, maxScore: 100, grade: 'C+', status: 'Under Review' }
  ],
  schedule: [
    { id: 'SCH-1', day: 'Wednesday', startTime: '08:30 AM', endTime: '09:15 AM', title: 'Class 9C - Physics', room: 'Room 204', status: 'Completed', isNow: false },
    { id: 'SCH-2', day: 'Wednesday', startTime: '09:30 AM', endTime: '10:15 AM', title: 'Class 10A - Physics', room: 'Room 205', status: 'Live Now', isNow: true },
    { id: 'SCH-3', day: 'Wednesday', startTime: '11:15 AM', endTime: '12:00 PM', title: 'Class 11B - Physics', room: 'Lab 1', status: 'Upcoming', isNow: false },
    { id: 'SCH-4', day: 'Wednesday', startTime: '02:00 PM', endTime: '02:45 PM', title: 'Class 12A - Physics', room: 'Room 206', status: 'Upcoming', isNow: false }
  ],
  activities: [
    { id: 'ACT-1', month: 'MAY', day: '21', title: 'Physics Practical - Lab Session', meta: 'Class 10A • 09:30 AM - 11:00 AM', color: 'indigo' },
    { id: 'ACT-2', month: 'MAY', day: '22', title: 'Chemistry Quiz', meta: 'Class 11B • 10:30 AM - 11:00 AM', color: 'violet' },
    { id: 'ACT-3', month: 'MAY', day: '23', title: 'Maths Worksheet Discussion', meta: 'Class 9C • 11:15 AM - 12:00 PM', color: 'sky' },
    { id: 'ACT-4', month: 'MAY', day: '24', title: 'Parent-Teacher Meeting', meta: 'Virtual • 04:00 PM - 06:00 PM', color: 'emerald' }
  ],
  homework: [
    { id: 'HW-601', title: 'Chapter 5: Work & Energy Problems', class: '10A', dueDate: '2026-05-21', status: 'Submitted', studentName: 'Sophia Chen' },
    { id: 'HW-602', title: 'Chapter 5: Work & Energy Problems', class: '10A', dueDate: '2026-05-21', status: 'Submitted', studentName: 'Emma Watson' },
    { id: 'HW-603', title: 'Chapter 5: Work & Energy Problems', class: '10A', dueDate: '2026-05-21', status: 'Pending', studentName: 'Rohan Mehta' },
    { id: 'HW-604', title: 'Snell Law Refraction Exercises', class: '11B', dueDate: '2026-05-20', status: 'Overdue', studentName: 'Aisha Khan' },
    { id: 'HW-605', title: 'Snell Law Refraction Exercises', class: '11B', dueDate: '2026-05-20', status: 'Submitted', studentName: 'Nadia Putri' },
    { id: 'HW-606', title: 'Wave-Particle Duality Essay', class: '12A', dueDate: '2026-05-19', status: 'Overdue', studentName: 'Lucas Miller' },
    { id: 'HW-607', title: 'Kinematics Graph Sheet', class: '9C', dueDate: '2026-05-22', status: 'Submitted', studentName: 'Karan Verma' },
    { id: 'HW-608', title: 'Kinematics Graph Sheet', class: '9C', dueDate: '2026-05-22', status: 'Pending', studentName: 'Arjun Singh' }
  ],
  messages: [
    { id: 'MSG-701', sender: 'Dr. Vikram Mehta', role: 'Parent (Rohan 10A)', subject: 'Request for Extra Physics Tutoring', time: '15 mins ago', status: 'Unread', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', preview: 'Hello Ms. Clara, could we schedule a 15-minute call regarding Rohan recent lab score?' },
    { id: 'MSG-702', sender: 'Principal Elena Ross', role: 'Administration', subject: 'STEM Fair Judge Allocation', time: '1 hr ago', status: 'Read', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', preview: 'Thank you for leading the Physics division for the upcoming May STEM exhibition.' },
    { id: 'MSG-703', sender: 'Sophia Chen', role: 'Student (10A)', subject: 'Question on AP Physics Lab #4', time: '3 hrs ago', status: 'Unread', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', preview: 'Ms. Clara, should we include uncertainty error bars on graph 2?' }
  ],
  library: [
    { id: 'LIB-801', title: 'University Physics with Modern Physics', category: 'Textbook', author: 'Young & Freedman', format: 'PDF • 24 MB', downloads: 142, status: 'Available', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300' },
    { id: 'LIB-802', title: 'Interactive Optics Lab Manual 2026', category: 'Lab Guide', author: 'Heroes Science Dept', format: 'Interactive Pack', downloads: 98, status: 'Available', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=300' },
    { id: 'LIB-803', title: 'Quantum Mechanics Visualized', category: 'Video Series', author: 'Dr. Clara Vance', format: 'HD Video • 12 Clips', downloads: 215, status: 'Featured', cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300' },
    { id: 'LIB-804', title: 'Calculus-Based Mechanics Problem Bank', category: 'Worksheet', author: 'Heroes AI Curated', format: 'DOCX / PDF', downloads: 176, status: 'Available', cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=300' }
  ],
  leaves: [
    { id: 'LV-901', applicant: 'Rohan Mehta', role: 'Student (10A)', type: 'Medical Leave', dates: 'May 21 - May 22', days: 2, reason: 'Recovering from seasonal flu', status: 'Pending' },
    { id: 'LV-902', applicant: 'Aisha Khan', role: 'Student (11B)', type: 'Family Event', dates: 'May 25', days: 1, reason: 'Sibling graduation ceremony', status: 'Pending' },
    { id: 'LV-903', applicant: 'Karan Verma', role: 'Student (9C)', type: 'Sports Representation', dates: 'May 14 - May 15', days: 2, reason: 'Regional Inter-school Athletics', status: 'Approved' },
    { id: 'LV-904', applicant: 'Lucas Miller', role: 'Student (12A)', type: 'Medical Leave', dates: 'May 10', days: 1, reason: 'Dental appointment', status: 'Approved' }
  ],
  fees: [
    { id: 'FEE-101', studentName: 'Sophia Chen', class: '10A', term: 'Term 2 - 2026', amount: 1450, paid: 1450, dueDate: '2026-05-01', status: 'Paid' },
    { id: 'FEE-102', studentName: 'Rohan Mehta', class: '10A', term: 'Term 2 - 2026', amount: 1450, paid: 950, dueDate: '2026-05-15', status: 'Partial' },
    { id: 'FEE-103', studentName: 'Aisha Khan', class: '11B', term: 'Term 2 - 2026', amount: 1550, paid: 1550, dueDate: '2026-05-01', status: 'Paid' },
    { id: 'FEE-104', studentName: 'Lucas Miller', class: '12A', term: 'Term 2 - 2026', amount: 1650, paid: 0, dueDate: '2026-05-10', status: 'Overdue' },
    { id: 'FEE-105', studentName: 'Emma Watson', class: '10A', term: 'Term 2 - 2026', amount: 1450, paid: 1450, dueDate: '2026-05-01', status: 'Paid' },
    { id: 'FEE-106', studentName: 'Nadia Putri', class: '11B', term: 'Term 2 - 2026', amount: 1550, paid: 1550, dueDate: '2026-05-01', status: 'Paid' }
  ],
  notifications: [
    { id: 'NOT-1', title: 'New assignment submitted', desc: 'Arjun Singh submitted Physics Worksheet', time: '10 min ago', type: 'indigo', unread: true },
    { id: 'NOT-2', title: 'Leave request received', desc: '2 leave requests need your approval', time: '1 hr ago', type: 'emerald', unread: true },
    { id: 'NOT-3', title: 'Grades are ready to publish', desc: 'Chemistry Quiz results are ready', time: '2 hr ago', type: 'teal', unread: false },
    { id: 'NOT-4', title: 'Timetable updated', desc: 'New schedule published for Class 10A', time: '3 hr ago', type: 'violet', unread: false }
  ],
  performance: {
    'This Month': [
      { cls: '10A', avg: 80, top: 96 },
      { cls: '10B', avg: 68, top: 88 },
      { cls: '11A', avg: 84, top: 94 },
      { cls: '11B', avg: 78, top: 92 },
      { cls: '12A', avg: 82, top: 97 }
    ],
    'Last Month': [
      { cls: '10A', avg: 76, top: 92 },
      { cls: '10B', avg: 64, top: 84 },
      { cls: '11A', avg: 79, top: 91 },
      { cls: '11B', avg: 73, top: 89 },
      { cls: '12A', avg: 78, top: 94 }
    ],
    'This Semester': [
      { cls: '10A', avg: 82, top: 98 },
      { cls: '10B', avg: 71, top: 90 },
      { cls: '11A', avg: 86, top: 96 },
      { cls: '11B', avg: 80, top: 93 },
      { cls: '12A', avg: 85, top: 98 }
    ]
  }
};
