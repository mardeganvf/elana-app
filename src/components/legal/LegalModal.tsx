import React from 'react';
import { X, ShieldCheck, FileText, Lock, Heart, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'terms' | 'privacy' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#101B1E] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/10 my-8 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#070D0F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 flex items-center justify-center text-[#FF7F5B]">
              {isTerms ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {isTerms ? 'Termos de Uso' : 'Política de Privacidade & LGPD'}
              </h2>
              <p className="text-xs text-slate-400">
                Elana Academy • Última atualização: 18 de Setembro de 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          
          {isTerms ? (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7F5B]"></span>
                  1. Natureza do Serviço e Propósito Educativo
                </h3>
                <p>
                  A <strong>Elana Academy</strong> é uma plataforma dedicada à educação parental continuada, apoio emocional e convivência comunitária. Nossos cursos, trilhas, reflexões e conteúdos complementares têm finalidade estritamente orientativa e socioeducativa.
                </p>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                  <strong>Aviso Importante:</strong> Nossos conteúdos e ferramentas de acolhimento (incluindo o canal SOS) <em>não substituem</em> consultas médicas, psicológicas, psiquiátricas ou intervenções clínicas emergenciais. Em casos de risco iminente ou crises severas, procure imediatamente os serviços de saúde locais ou o Centro de Valorização da Vida (CVV - 188).
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7F5B]"></span>
                  2. Cadastro, Acesso e Responsabilidades
                </h3>
                <p>
                  O acesso à plataforma é pessoal e intransferível. O usuário compromete-se a fornecer informações verídicas e manter a confidencialidade de sua senha. É terminantemente proibido compartilhar credenciais ou gravar e redistribuir os materiais em vídeo e áudio sem autorização prévia por escrito.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7F5B]"></span>
                  3. Diretrizes de Convivência Comunitária
                </h3>
                <p>
                  A Comunidade Elana é um espaço seguro, acolhedor e livre de julgamentos. O usuário concorda em:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Tratar outros pais e cuidadores com empatia, delicadeza e respeito;</li>
                  <li>Não publicar conteúdos comerciais não autorizados (spam), discursos de ódio ou ofensas;</li>
                  <li>Respeitar o sigilo das experiências compartilhadas por outros membros;</li>
                  <li>Utilizar o Confessionário Anônimo de forma responsável para desabafo construtivo.</li>
                </ul>
                <p>
                  A equipe de moderação reserva-se o direito de advertir, moderar ou suspender contas que violem repetidamente as diretrizes da comunidade.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7F5B]"></span>
                  4. Garantia e Cancelamento de Compras
                </h3>
                <p>
                  Em conformidade com o Artigo 49 do Código de Defesa do Consumidor, garantimos o direito de arrependimento em até <strong>7 (sete) dias corridos</strong> após a aquisição de qualquer jornada paga, com reembolso integral processado via plataforma de venda (Kiwify/Hotmart).
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8A9A5B]" />
                  1. Compromisso com a Privacidade e LGPD
                </h3>
                <p>
                  A Elana Academy atua em total conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>. A proteção dos dados da sua família, das informações sobre seus filhos e do seu bem-estar emocional é prioridade máxima em nossa arquitetura de segurança.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8A9A5B]"></span>
                  2. Dados que Coletamos e Suas Finalidades
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li><strong>Dados Cadastrais:</strong> Nome, e-mail e telefone para autenticação segura, recuperação de senha e comunicações de serviço.</li>
                  <li><strong>Dados Familiares (Filhos):</strong> Nomes e idades dos filhos compartilhados voluntariamente para personalizar recomendações de desenvolvimento (tratados com consentimento específico sob o Artigo 14 da LGPD).</li>
                  <li><strong>Diário Emocional e Check-ins:</strong> Registros diários de sentimentos e reflexões, armazenados com criptografia e acesso restrito exclusivamente ao titular e administradores clínicos de apoio.</li>
                  <li><strong>Interações na Comunidade:</strong> Posts, comentários e dúvidas publicadas voluntariamente pelo usuário. Quando utilizado o modo anônimo, a autoria é desvinculada no banco de dados.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8A9A5B]"></span>
                  3. Direitos do Titular (Art. 18 da LGPD)
                </h3>
                <p>Você possui o direito de, a qualquer momento e sem custos:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#070D0F] border border-white/5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Confirmar a existência de tratamento e acessar seus dados.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070D0F] border border-white/5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Corrigir dados incompletos, inexatos ou desatualizados.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070D0F] border border-white/5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Revogar consentimentos concedidos anteriormente.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070D0F] border border-white/5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Excluir permanentemente sua conta e histórico de dados</strong> através do botão de exclusão no seu perfil.</span>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8A9A5B]"></span>
                  4. Segurança das Informações e Não Compartilhamento
                </h3>
                <p>
                  Nunca vendemos, alugamos ou comercializamos dados de alunos ou de seus filhos para terceiros ou anunciantes. O compartilhamento ocorre estritamente com processadores essenciais para a operação do serviço (provedor de nuvem Supabase, plataforma de vídeo Panda Video e processadores de pagamento homologados).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#E66795]" />
                  5. Contato com o Encarregado de Dados (DPO)
                </h3>
                <p>
                  Para dúvidas, solicitações ou exercício de direitos referentes à privacidade, entre em contato diretamente pelo e-mail oficial: <a href="mailto:privacidade@elana.app.br" className="text-[#FF7F5B] underline">privacidade@elana.app.br</a>.
                </p>
              </section>
            </>
          )}

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-white/10 bg-[#070D0F] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Entendido e Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
