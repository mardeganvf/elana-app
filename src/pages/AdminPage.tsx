import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LifeBuoy, 
  Upload, 
  Video, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  Send, 
  AlertTriangle,
  Heart
} from 'lucide-react';

// Types for Admin Data
interface SOSTicket {
  id: string;
  userName: string;
  userAvatar: string;
  urgency: 'alta' | 'media' | 'baixa';
  message: string;
  createdAt: string;
  status: 'pendente' | 'atendido';
}

interface ModerationItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  roomName: string;
  content: string;
  flagReason: string;
  createdAt: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface MemberUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'membro' | 'guia';
  levelTitle: string;
  levelIcon: string;
  xp: number;
  joinedDays: number;
}

import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { replySosTicket } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'sos' | 'moderation' | 'analytics' | 'content' | 'users'>('sos');

  // 🛟 SOS Tickets State
  const [sosTickets, setSosTickets] = useState<SOSTicket[]>([
    {
      id: 'sos-1',
      userName: 'Camila Ferreira',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      urgency: 'alta',
      message: 'Meu bebê não para de chorar há 3 horas e estou sozinha em casa. Sinto que vou surtar de exaustão.',
      createdAt: 'Há 12 min',
      status: 'pendente'
    },
    {
      id: 'sos-2',
      userName: 'Renata Vasconcelos',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      urgency: 'media',
      message: 'Preciso de ajuda com o sono de 4 meses. Não durmo mais do que 1 hora seguida há semanas.',
      createdAt: 'Há 45 min',
      status: 'pendente'
    }
  ]);

  const [selectedSosTicket, setSelectedSosTicket] = useState<SOSTicket | null>(null);
  const [sosReplyText, setSosReplyText] = useState('');

  // 🛡️ Moderation Items State
  const [modItems, setModItems] = useState<ModerationItem[]>([
    {
      id: 'mod-1',
      authorName: 'Patrícia L.',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      roomName: 'Cantinho da Mel',
      content: 'Você deveria dar mamadeira de uma vez, isso é falta de pulso firme com a criança!',
      flagReason: 'IA Antijulgamento: Palavra-chave de julgamento materno ("falta de pulso")',
      createdAt: 'Há 20 min',
      status: 'pendente'
    },
    {
      id: 'mod-2',
      authorName: 'Mãe Anônima',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roomName: 'Confessionário',
      content: 'Às vezes sinto vontade de sumir por uns dias e deixar meu marido sozinho cuidando de tudo.',
      flagReason: 'Confessionário Anônimo: Verificação preventiva de segurança emocional',
      createdAt: 'Há 1 hora',
      status: 'pendente'
    }
  ]);

  // 👥 Members State
  const [members, setMembers] = useState<MemberUser[]>([
    {
      id: 'm1',
      name: 'Mariana Santos',
      email: 'mariana.santos@email.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'guia',
      levelTitle: 'Jacarandá',
      levelIcon: '🪻',
      xp: 1350,
      joinedDays: 42
    },
    {
      id: 'm2',
      name: 'Helena Souza',
      email: 'helena@elana.com.br',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'membro',
      levelTitle: 'Raiz',
      levelIcon: '🌿',
      xp: 120,
      joinedDays: 5
    },
    {
      id: 'm3',
      name: 'Carla Mendes',
      email: 'carla.mendes@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'membro',
      levelTitle: 'Jabuticabeira',
      levelIcon: '🍇',
      xp: 720,
      joinedDays: 28
    }
  ]);

  // 🎬 Upload Form State
  const [selectedArea, setSelectedArea] = useState('Comunicação Não-Violenta');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [rewardPoints, setRewardPoints] = useState(15);
  const [hasCertificate, setHasCertificate] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // SOS Reply Handlers
  const handleSendSosReply = () => {
    if (!selectedSosTicket || !sosReplyText.trim()) return;
    replySosTicket(sosReplyText.trim());
    setSosTickets(prev => prev.map(t => t.id === selectedSosTicket.id ? { ...t, status: 'atendido' } : t));
    setSelectedSosTicket(null);
    setSosReplyText('');
  };

  const handleApplyQuickTemplate = (templateText: string) => {
    setSosReplyText(templateText);
  };

  // Moderation Handlers
  const handleModerateItem = (id: string, newStatus: 'aprovado' | 'rejeitado') => {
    setModItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // Role Toggle Handler
  const handleToggleRole = (userId: string) => {
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: m.role === 'guia' ? 'membro' : 'guia' } : m));
  };

  // Upload Submit Handler
  const handlePublishLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setLessonTitle('');
      setLessonDesc('');
      setVideoFile(null);
      setPdfFile(null);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-6xl mx-auto text-white -mt-4">
      
      {/* Admin Header Hero */}
      <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#FF7F5B]/20 text-[#FF7F5B] rounded-2xl border border-[#FF7F5B]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Painel do Administrador & Guardião
              </h1>
              <span className="bg-[#FF7F5B] text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Elana Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Central de Acolhimento SOS, Moderação Antijulgamento, Gestão de Áreas e Saúde da Comunidade.
            </p>
          </div>
        </div>

        {/* Quick SOS Badge Counter */}
        <div className="flex items-center gap-3 bg-[#070D0F] px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <LifeBuoy className="w-5 h-5 text-[#FF7F5B] animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chamados SOS Pendentes</span>
            <span className="text-sm font-black text-amber-400">
              {sosTickets.filter(t => t.status === 'pendente').length} aguardando suporte
            </span>
          </div>
        </div>
      </section>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('sos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'sos'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Central SOS ({sosTickets.filter(t => t.status === 'pendente').length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'moderation'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Moderação Antijulgamento ({modItems.filter(m => m.status === 'pendente').length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'analytics'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Termômetro Emocional</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('content')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'content'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload de Aulas & Áreas</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'users'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão de Membros ({members.length})</span>
        </button>
      </div>

      {/* TAB 1: 🛟 CENTRAL SOS */}
      {activeAdminTab === 'sos' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <LifeBuoy className="w-5 h-5 text-[#FF7F5B]" />
                Atendimento Emergencial SOS
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Responda com carinho aos chamados confidenciais enviados por pais em momentos de exaustão.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets List */}
            <div className="space-y-3">
              {sosTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedSosTicket(ticket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    selectedSosTicket?.id === ticket.id
                      ? 'bg-[#162327] border-[#FF7F5B] shadow-xl'
                      : ticket.status === 'atendido'
                      ? 'bg-[#070D0F]/60 border-white/5 opacity-60'
                      : 'bg-[#070D0F] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={ticket.userAvatar} alt={ticket.userName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{ticket.userName}</h4>
                        <span className="text-[10px] text-slate-400">{ticket.createdAt}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      ticket.urgency === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {ticket.urgency === 'alta' ? '🔴 Urgência Alta' : '🟡 Suporte Geral'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 italic bg-[#101B1E] p-3 rounded-xl border border-white/5">
                    "{ticket.message}"
                  </p>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className={ticket.status === 'atendido' ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-amber-400 font-bold'}>
                      {ticket.status === 'atendido' ? '✓ Atendido' : '⏱️ Aguardando suporte'}
                    </span>
                    <span className="text-[#FF7F5B] font-bold">Clique para atender →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ticket Reply Modal Box */}
            {selectedSosTicket ? (
              <div className="bg-[#070D0F] p-6 rounded-2xl border border-[#FF7F5B]/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={selectedSosTicket.userAvatar} alt={selectedSosTicket.userName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedSosTicket.userName}</h3>
                      <span className="text-[10px] text-slate-400">Chamado aberto {selectedSosTicket.createdAt}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSosTicket(null)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#101B1E] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mensagem da Família:</span>
                  <p className="text-xs text-slate-100 italic leading-relaxed">
                    "{selectedSosTicket.message}"
                  </p>
                </div>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#FF7F5B] uppercase tracking-wider block">
                    Respostas Acolhedoras Pré-aprovadas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApplyQuickTemplate('Olá querida! Respira fundo. Você não está sozinha nessa. Estamos aqui com você!')}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300"
                    >
                      💖 Respiro e Acolhimento
                    </button>
                    <button
                      onClick={() => handleApplyQuickTemplate('Oi! Entendo perfeitamente esse cansaço extremo. Que tal pausar 5 minutos e tomarmos uma água juntas?')}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300"
                    >
                      ☕ Convite para Pausa
                    </button>
                  </div>
                </div>

                <textarea
                  value={sosReplyText}
                  onChange={(e) => setSosReplyText(e.target.value)}
                  placeholder="Escreva uma mensagem empática para enviar à família..."
                  rows={4}
                  className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                />

                <button
                  onClick={handleSendSosReply}
                  disabled={!sosReplyText.trim()}
                  className="w-full py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Acolhimento Privado</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#070D0F] p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <LifeBuoy className="w-12 h-12 text-[#FF7F5B]/40" />
                <p className="text-xs">Selecione um chamado SOS da lista ao lado para responder e dar suporte privado.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: 🛡️ MODERAÇÃO ANTIJULGAMENTO */}
      {activeAdminTab === 'moderation' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <ShieldCheck className="w-5 h-5 text-[#8A9A5B]" />
                Fila de Moderação Antijulgamento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Avalie os alertas da IA Antijulgamento para manter a comunidade livre de julgamentos e cobranças.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {modItems.map(item => (
              <div key={item.id} className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={item.authorAvatar} alt={item.authorName} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.authorName}</h4>
                      <span className="text-[10px] text-[#FF7F5B] font-bold">Sala: {item.roomName} • {item.createdAt}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {item.flagReason}
                  </span>
                </div>

                <div className="bg-[#101B1E] p-3.5 rounded-xl border border-white/5 text-xs text-slate-200 italic leading-relaxed">
                  "{item.content}"
                </div>

                {item.status === 'pendente' ? (
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => handleModerateItem(item.id, 'rejeitado')}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Remover Post</span>
                    </button>

                    <button
                      onClick={() => handleModerateItem(item.id, 'aprovado')}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar Publicação</span>
                    </button>
                  </div>
                ) : (
                  <span className={`text-xs font-bold flex items-center gap-1 justify-end ${item.status === 'aprovado' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.status === 'aprovado' ? '✓ Aprovado e Mantido na Comunidade' : '✕ Removido por infringir diretrizes de acolhimento'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: 📊 TERMÔMETRO EMOCIONAL DA ALDEIA */}
      {activeAdminTab === 'analytics' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <TrendingUp className="w-5 h-5 text-[#FFD166]" />
                Termômetro Emocional da Aldeia (Saúde da Comunidade)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o estado emocional predominante dos pais para planejar novos conteúdos e encontros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuários Ativos</span>
              <span className="text-2xl font-black text-[#FF7F5B]">1.248</span>
              <span className="text-[10px] text-emerald-400 block">+14% este mês</span>
            </div>

            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pontos de Afeto Distribuídos</span>
              <span className="text-2xl font-black text-[#FFD166]">184.920</span>
              <span className="text-[10px] text-slate-400 block">Recompensas acumuladas</span>
            </div>

            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acolhimentos na Comunidade</span>
              <span className="text-2xl font-black text-[#8A9A5B]">8.410</span>
              <span className="text-[10px] text-emerald-400 block">Reações de carinho trocadas</span>
            </div>
          </div>

          {/* Emotional Breakdown Progress */}
          <div className="bg-[#070D0F] p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#E66795]" />
              Sentimentos Mais Registrados nos Check-ins (Últimos 7 dias)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-amber-300">😫 Cansaço & Exaustão</span>
                  <span className="text-slate-300">42% (524 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-300">🌅 Esperança & Leveza</span>
                  <span className="text-slate-300">28% (349 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-rose-300">🛑 Sobrecarga Materna/Paternal</span>
                  <span className="text-slate-300">18% (224 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#FFD166]">🌸 Gratidão & Conexão</span>
                  <span className="text-slate-300">12% (151 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFD166] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: 🎬 UPLOAD DE AULAS & ÁREAS */}
      {activeAdminTab === 'content' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Upload className="w-5 h-5 text-[#FF7F5B]" />
                Upload de Vídeo-Aulas & Cadastro de Áreas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adicione novos conteúdos pedagógicos, defina recompensas em pontos e anexe PDFs de apoio.
              </p>
            </div>
          </div>

          <form onSubmit={handlePublishLesson} className="bg-[#070D0F] p-6 rounded-2xl border border-white/10 space-y-5">
            {/* Step 1: Area Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FF7F5B] uppercase tracking-wider block">
                1. Selecione a Área / Trilha Temática:
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
              >
                <option value="Comunicação Não-Violenta">Comunicação Não-Violenta e Birras Infantis</option>
                <option value="Sono do Bebê">Sono do Bebê e Rotinas Noturnas</option>
                <option value="Espaço a Dois">Espaço a Dois & Parceria no Lar</option>
                <option value="Introdução Alimentar">Introdução Alimentar com Leveza</option>
              </select>
            </div>

            {/* Step 2: Lesson Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Título da Vídeo-Aula:</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ex: O que acontece durante o pico da birra?"
                  className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Pontos Concedidos ao Assistir:</label>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Descrição Resumida da Aula:</label>
              <textarea
                value={lessonDesc}
                onChange={(e) => setLessonDesc(e.target.value)}
                placeholder="Descreva brevemente o que os pais vão aprender nesta aula..."
                rows={3}
                className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
              />
            </div>

            {/* Step 3: Video & PDF Upload Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Video Drag Drop Zone */}
              <div className="border-2 border-dashed border-white/15 p-5 rounded-2xl bg-[#101B1E] text-center space-y-2 cursor-pointer hover:border-[#FF7F5B]/50 transition-colors">
                <Video className="w-8 h-8 text-[#FF7F5B] mx-auto" />
                <span className="text-xs font-bold text-white block">Upload do Vídeo da Aula (MP4/WebM)</span>
                <span className="text-[10px] text-slate-400 block">Arraste o arquivo ou selecione no seu computador</span>
                <button type="button" onClick={() => setVideoFile('aula_birras_modulo1.mp4')} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg">
                  {videoFile ? `✓ Vídeo Selecionado: ${videoFile}` : 'Selecionar Arquivo de Vídeo'}
                </button>
              </div>

              {/* PDF Attachment Zone */}
              <div className="border-2 border-dashed border-white/15 p-5 rounded-2xl bg-[#101B1E] text-center space-y-2 cursor-pointer hover:border-[#FFD166]/50 transition-colors">
                <FileText className="w-8 h-8 text-[#FFD166] mx-auto" />
                <span className="text-xs font-bold text-white block">Anexar Material de Apoio em PDF</span>
                <span className="text-[10px] text-slate-400 block">Checklists, resumos práticos e guias</span>
                <button type="button" onClick={() => setPdfFile('guia_pratico_birras.pdf')} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg">
                  {pdfFile ? `✓ PDF Anetado: ${pdfFile}` : 'Selecionar PDF de Apoio'}
                </button>
              </div>
            </div>

            {/* Certificate Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="certCheck"
                checked={hasCertificate}
                onChange={(e) => setHasCertificate(e.target.checked)}
                className="w-4 h-4 accent-[#FF7F5B] rounded cursor-pointer"
              />
              <label htmlFor="certCheck" className="text-xs text-slate-300 font-bold cursor-pointer">
                Concluir esta aula/trilha gera Certificado Digital de Conclusão para o aluno
              </label>
            </div>

            {/* Success Notification */}
            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Vídeo-aula publicada com sucesso na área "{selectedArea}"!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Publicar Vídeo-Aula na Trilha</span>
            </button>
          </form>
        </section>
      )}

      {/* TAB 5: 👥 GESTÃO DE MEMBROS */}
      {activeAdminTab === 'users' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Users className="w-5 h-5 text-[#FF7F5B]" />
                Gestão de Membros & Guia de Acolhimento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Atribua o selo especial de Guia & Mentora para membros experientes e acompanhe a pontuação.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E66795]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <span className="bg-[#FF7F5B]/20 text-[#FF7F5B] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#FF7F5B]/30 flex items-center gap-1">
                        <span>{member.levelIcon}</span>
                        <span>{member.levelTitle}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {member.email} • {member.joinedDays} dias conosco • {member.xp} pontos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === 'guia' ? (
                    <span className="text-[10px] font-extrabold bg-[#8A9A5B]/20 text-[#8A9A5B] border border-[#8A9A5B]/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Guia & Mentora Oficial
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full">
                      Membro da Aldeia
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleRole(member.id)}
                    className="text-xs font-bold text-[#FF7F5B] hover:text-[#FFD166] bg-[#FF7F5B]/10 hover:bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 px-3 py-1.5 rounded-xl transition-all"
                  >
                    {member.role === 'guia' ? 'Remover Selo Guia' : 'Conceder Selo Guia'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
