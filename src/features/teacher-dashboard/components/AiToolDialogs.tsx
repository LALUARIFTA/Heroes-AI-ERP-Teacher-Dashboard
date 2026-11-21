import { Sparkles, Wand2, X } from 'lucide-react';
import { useState } from 'react';

export { AiContentGeneratorModal, AiLessonPlannerModal };

function AiLessonPlannerModal({ theme, onClose, onSave }) {
  const [topic, setTopic] = useState('Electromagnetic Induction');
  const [cls, setCls] = useState('10A');
  const [duration, setDuration] = useState('45 mins');
  const [generated, setGenerated] = useState('');

  const handleGenerate = () => {
    setGenerated(
      `Learning Objectives: Students will explain ${topic} principles, analyze real-world generator applications, and complete a guided Class ${cls} lab demonstration within ${duration}.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Lesson Planner</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lesson Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              >
                {['9C', '10A', '11B', '12A'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate AI Outline
          </button>

          {generated && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {generated}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                id: `LES-${Math.floor(1000 + Math.random() * 9000)}`,
                title: topic || 'Untitled AI Lesson',
                class: cls,
                subject: 'Physics',
                duration,
                date: '2026-05-28',
                status: 'Published',
                objectives:
                  generated || `AI-generated curriculum plan covering ${topic} for Class ${cls}.`
              })
            }
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          >
            Save to Lesson Plans
          </button>
        </div>
      </div>
    </div>
  );
}

function AiContentGeneratorModal({ theme, onClose, onSave }) {
  const [title, setTitle] = useState('Forces & Momentum Mastery Quiz');
  const [cls, setCls] = useState('10A');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(12);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Content &amp; Quiz Generator</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quiz / Worksheet Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
              >
                {['9C', '10A', '11B', '12A'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
              >
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Questions</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 5)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                id: `QZ-${Math.floor(1000 + Math.random() * 9000)}`,
                title: title || 'AI Generated Quiz',
                class: cls,
                topic: 'AI Synthesized Assessment',
                questionsCount: count,
                difficulty,
                avgScore: 86,
                status: 'Active'
              })
            }
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          >
            Generate & Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
