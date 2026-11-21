import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TeacherDashboard from './features/teacher-dashboard/TeacherDashboard';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeacherDashboard />
  </StrictMode>,
);
