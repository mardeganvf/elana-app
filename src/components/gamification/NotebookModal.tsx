import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { 
  X, 
  BookOpen, 
  Printer, 
  Edit3, 
  FileText
} from 'lucide-react';

interface NotebookModalProps {
  initialJourneyId?: string;
  onClose: () => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({ initialJourneyId, onClose }) => {
  const { user, saveLessonNote } = useAuth();
  
  // Available journeys user has notes or access for
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    initialJourneyId || (user?.purchasedJourneyIds[0] || JOURNEYS_DATA[0].id)
  );

  const selectedJourney = JOURNEYS_DATA.find(j => j.id === selectedJourneyId) || JOURNEYS_DATA[0];
  const userNotes = user?.lessonNotes || {};

  // Active editing note state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleStartEditing = (lessonId: string, currentNote: string) => {
    setEditingLessonId(lessonId);
    setEditingText(currentNote);
  };

  const handleSaveEdit = (lessonId: string) => {
    if (editingText.trim()) {
      saveLessonNote(lessonId, editingText.trim());
    }
    setEditingLessonId(null);
  };

  // Function to handle browser print / export to PDF
  const handleExportPDF = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white print:p-0 print:bg-white print:text-black">
      
      {/* Printable / Viewable Container */}
      <div className="bg-[#101B1E] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative space-y-6 m-auto max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black print:p-0 print:overflow-visible">
        
        {/* Top Header & Actions (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FF7F5B]/20 text-[#FF7F5B] rounded-2xl border border-[#FF7F5B]/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#FF7F5B] uppercase tracking-wider block">
                Bloco de Notas Pessoal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Minhas Anotações
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              title="Exportar em PDF ou Imprimir"
            >
              <Printer className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header strictly for PDF/Print */}
        <div className="hidden print:block text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Elana Academy — Minhas Anotações</h1>
          <p className="text-sm text-slate-600">Usuário(a): {user?.name} • Jornada: {selectedJourney.title}</p>
        </div>

        {/* Journey Selector Tabs (Hidden in Print) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
          {JOURNEYS_DATA.filter(j => user?.purchasedJourneyIds.includes(j.id)).map(j => (
            <button
              key={j.id}
              onClick={() => setSelectedJourneyId(j.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 border ${
                selectedJourneyId === j.id
                  ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-md'
                  : 'bg-[#070D0F] text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: j.themeColor }}></span>
              <span>{j.title}</span>
            </button>
          ))}
        </div>

        {/* Current Journey Name Banner */}
        <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 print:bg-slate-100 print:border-slate-300">
          <span className="text-[10px] font-extrabold text-[#FFD166] uppercase tracking-wider block print:text-slate-700">
            Jornada Selecionada:
          </span>
          <h3 className="text-lg font-black text-white print:text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {selectedJourney.title}
          </h3>
        </div>

        {/* Clean Lessons & User Notes List */}
        <div className="space-y-4 pt-1">
          {selectedJourney.modules.map(module => (
            <div key={module.id} className="space-y-3">
              {module.lessons.map(lesson => {
                const hasUserNote = !!userNotes[lesson.id];
                const isEditing = editingLessonId === lesson.id;

                return (
                  <div 
                    key={lesson.id} 
                    className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 space-y-2.5 print:bg-white print:border-slate-200 print:p-3"
                  >
                    {/* Content Title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FF7F5B] shrink-0" />
                        <h4 className="text-xs font-bold text-white print:text-slate-900">{lesson.title}</h4>
                      </div>

                      {!isEditing && (
                        <button
                          onClick={() => handleStartEditing(lesson.id, userNotes[lesson.id] || '')}
                          className="text-[10px] text-[#FF7F5B] hover:underline font-bold flex items-center gap-1 print:hidden"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{hasUserNote ? 'Editar' : '+ Anotar'}</span>
                        </button>
                      )}
                    </div>

                    {/* Respective User Note */}
                    {isEditing ? (
                      <div className="space-y-2 print:hidden">
                        <textarea
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          placeholder="Escreva sua anotação sobre este conteúdo..."
                          className="w-full p-3 bg-[#101B1E] border border-[#FF7F5B]/50 rounded-xl text-xs text-white focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingLessonId(null)}
                            className="text-xs text-slate-400 hover:text-white px-3 py-1"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(lesson.id)}
                            className="bg-[#FF7F5B] text-slate-950 font-bold text-xs px-3 py-1 rounded-lg"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed print:bg-white print:text-slate-800 print:border-slate-300">
                        {hasUserNote ? (
                          userNotes[lesson.id]
                        ) : (
                          <span className="text-slate-500 italic">Nenhuma anotação feita para este conteúdo.</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-slate-400">
            Anotações salvas automaticamente.
          </span>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
