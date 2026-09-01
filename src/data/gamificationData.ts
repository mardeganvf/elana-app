import { Badge, UserLevel } from '../types';

export const ALL_BADGES: Badge[] = [
  // 1. 🌿 Primeiros Passos (3 Conquistas)
  { id: 'b1', title: 'Semente Plantada', icon: '🌱', category: 'Primeiros Passos', rewardXp: 25, description: 'Que bom que você chegou! Sua caminhada com a gente começa agora.' },
  { id: 'b2', title: 'Criando Raízes', icon: '🪵', category: 'Primeiros Passos', rewardXp: 25, description: 'Perfil pronto com a sua cara e com a realidade da sua casa.' },
  { id: 'b3', title: 'Sempre Alerta', icon: '🔔', category: 'Primeiros Passos', rewardXp: 10, description: 'Notificações ligadas pra gente te lembrar de respirar no meio da correria.' },

  // 2. ▶️ Jornadas de Conhecimento (7 Conquistas)
  { id: 'b4', title: 'Minha Jornada', icon: '▶️', category: 'Jornadas de Conhecimento', rewardXp: 25, description: 'Você deu o play no primeiro vídeo. Sem pressa, no seu próprio ritmo.' },
  { id: 'b5', title: 'Passos Seguros', icon: '🐾', category: 'Jornadas de Conhecimento', rewardXp: 15, targetCount: 25, unitLabel: '%', description: '25% da trilha já foi! Um passinho de cada vez e as coisas vão clareando.' },
  { id: 'b6', title: 'Chegando Lá!', icon: '🧗', category: 'Jornadas de Conhecimento', rewardXp: 15, targetCount: 50, unitLabel: '%', description: 'Metade do curso concluído. Respira fundo e olha o quanto você já aprendeu!' },
  { id: 'b7', title: 'Caminho Iluminado', icon: '💡', category: 'Jornadas de Conhecimento', rewardXp: 50, targetCount: 100, unitLabel: '%', description: 'Jornada completa! Mais leveza e confiança pra viver a sua rotina.' },
  { id: 'b8', title: 'Pausa para Ouvir', icon: '🎧', category: 'Jornadas de Conhecimento', rewardXp: 10, description: 'Colocou o fone e aproveitou uma brecha no dia pra escutar uma aula.' },
  { id: 'b9', title: 'Minhas Reflexões', icon: '📝', category: 'Jornadas de Conhecimento', rewardXp: 10, description: 'Aquela ideia boa que não podia se perder ficou anotada com carinho.' },
  { id: 'b10', title: 'Buscando Respostas', icon: '🔍', category: 'Jornadas de Conhecimento', rewardXp: 10, description: 'Bateu uma dúvida e você foi atrás. O conhecimento traz paz.' },

  // 3. 💗 Cuidando de Quem Cuida (13 Conquistas)
  { id: 'b11', title: 'Sinal de Cuidado', icon: '💗', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Fez o seu primeiro check-in. É muito bom saber como você está hoje!' },
  { id: 'b12', title: 'Tudo Bem Parar', icon: '🛑', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Bateria no fim? Acolha o cansaço. Por aqui, ninguém precisa dar conta de tudo.' },
  { id: 'b13', title: 'Luz no Caminho', icon: '🌅', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Dia de esperança no peito! Que essa leveza acompanhe a sua casa hoje.' },
  { id: 'b14', title: 'Pequenas Vitórias', icon: '🎉', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Dia de comemorar! Toda conquista na rotina familiar merece festa.' },
  { id: 'b15', title: 'Pedido de Colo', icon: '🤝', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'O dia tá pesado? Valeu a coragem de pedir um apoio. A gente tá junto nessa.' },
  { id: 'b16', title: 'Escuta Interna', icon: '🗓️', category: 'Cuidando de Quem Cuida', rewardXp: 15, targetCount: 10, unitLabel: 'check-ins', description: '10 check-ins emocionais realizados no aplicativo! Ouvir o que o seu coração sente é um ato de amor.' },
  { id: 'b17', title: 'Olhar Acolhedor', icon: '🔄', category: 'Cuidando de Quem Cuida', rewardXp: 25, targetCount: 20, unitLabel: 'check-ins', description: '20 check-ins emocionais realizados! Você aprendeu a acolher suas fases sem julgamentos.' },
  { id: 'b18', title: 'Cuidador de Si', icon: '💖', category: 'Cuidando de Quem Cuida', rewardXp: 40, targetCount: 30, unitLabel: 'check-ins', description: '30 check-ins emocionais realizados! Seu bem-estar e autoconhecimento em primeiro lugar.' },
  { id: 'b19', title: 'Consciência Plena', icon: '🧘', category: 'Cuidando de Quem Cuida', rewardXp: 60, targetCount: 60, unitLabel: 'check-ins', description: '60 check-ins emocionais realizados! Parar para registrar seu sentir virou um hábito gostoso.' },
  { id: 'b20', title: 'Guardião do Coração', icon: '👑', category: 'Cuidando de Quem Cuida', rewardXp: 100, targetCount: 90, unitLabel: 'check-ins', description: '90 check-ins emocionais realizados! Um marco gigante de autocompaixão e equilíbrio.' },
  { id: 'b21', title: 'Olhar Para Dentro', icon: '🪞', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Foi espiar seu histórico de emoções. Se conhecer é um baita ato de carinho.' },
  { id: 'b22', title: 'Farol Noturno', icon: '🕯️', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Luz suave ligada pra te acompanhar naquele despertar das 3h da manhã.' },
  { id: 'b23', title: 'Pausa Necessária', icon: '🌬️', category: 'Cuidando de Quem Cuida', rewardXp: 10, description: 'Um minutinho de respiro guiado só pra colocar a cabeça no lugar.' },

  // 4. ⚡ Evolução Constante (5 Conquistas)
  { id: 'b24', title: 'Passos no Seu Ritmo', icon: '🐾', category: 'Evolução Constante', rewardXp: 15, targetCount: 10, unitLabel: 'dias', description: 'Acessou a plataforma em 10 dias diferentes. Cada retorno é um passo valioso!' },
  { id: 'b25', title: 'Caminhada Acolhedora', icon: '⚡', category: 'Evolução Constante', rewardXp: 25, targetCount: 20, unitLabel: 'dias', description: 'Acessou a plataforma em 20 dias diferentes. Estar presente com frequência constrói uma rede forte.' },
  { id: 'b26', title: 'Presença Constante', icon: '🌳', category: 'Evolução Constante', rewardXp: 40, targetCount: 30, unitLabel: 'dias', description: 'Acessou a plataforma em 30 dias diferentes. Suas raízes familiares estão ficando cada vez mais firmes.' },
  { id: 'b27', title: 'Trilha da Constância', icon: '🗺️', category: 'Evolução Constante', rewardXp: 60, targetCount: 60, unitLabel: 'dias', description: 'Acessou a plataforma em 60 dias diferentes. Uma caminhada sólida de aprendizado e troca.' },
  { id: 'b28', title: 'Raízes Profundas', icon: '🌲', category: 'Evolução Constante', rewardXp: 100, targetCount: 90, unitLabel: 'dias', description: 'Acessou a plataforma em 90 dias diferentes. Sua presença ilumina toda a nossa comunidade!' },

  // 5. 💬 Espaços de Troca (7 Conquistas)
  { id: 'b29', title: 'Voz de Coragem', icon: '🗣️', category: 'Espaços de Troca', rewardXp: 10, description: 'Primeiro post no ar! Dividir o que a gente vive sempre ajuda a acolher o outro.' },
  { id: 'b30', title: 'Confissão Liberta', icon: '🕊️', category: 'Espaços de Troca', rewardXp: 10, description: 'Desabafou no confessionário anônimo. Aqui você pode tirar o peso das costas sem julgamentos.' },
  { id: 'b31', title: 'Roda de Conversa', icon: '☕', category: 'Espaços de Troca', rewardXp: 15, description: 'Puxou uma cadeira pra conversar no Cantinho da Mel. Esse espaço é todinho seu!' },
  { id: 'b32', title: 'Ponte a Dois', icon: '🌉', category: 'Espaços de Troca', rewardXp: 15, description: 'Cuidou de quem divide a caminhada com você no Espaço a Dois. A parceria agradece!' },
  { id: 'b33', title: 'Máscara de Oxigênio', icon: '🛟', category: 'Espaços de Troca', rewardXp: 15, description: 'Passou no Cuidando de Quem Cuida. Lembrar de você não é capricho, é essencial!' },
  { id: 'b34', title: 'Explorador da Comunidade', icon: '🧭', category: 'Espaços de Troca', rewardXp: 25, description: 'Andou por todas as 4 salas de apoio. Essa rede existe pra te segurar quando precisar.' },
  { id: 'b35', title: 'Acolhimento Pleno', icon: '🌺', category: 'Espaços de Troca', rewardXp: 15, description: 'Você já experimentou todas as nossas reações. Acolher de todo jeito faz bem!' },

  // 6. 🤝 Rede de Apoio (6 Conquistas)
  { id: 'b36', title: 'Primeiro Acolhimento', icon: '🤲', category: 'Rede de Apoio', rewardXp: 10, description: 'Estendeu a mão pra alguém da comunidade pela primeira vez. Que gesto bonito!' },
  { id: 'b37', title: 'Mão Estendida', icon: '🤝', category: 'Rede de Apoio', rewardXp: 10, targetCount: 5, unitLabel: 'usuários', description: 'Já são 5 usuários que ganharam um quentinho no coração com as suas respostas.' },
  { id: 'b38', title: 'Guia de Acolhimento', icon: '⚓', category: 'Rede de Apoio', rewardXp: 25, targetCount: 25, unitLabel: 'vezes', description: '25 vezes em que uma palavra sua trouxe alívio pra quem tava aflito.' },
  { id: 'b39', title: 'Pilar da Comunidade', icon: '🏛️', category: 'Rede de Apoio', rewardXp: 50, targetCount: 100, unitLabel: 'usuários', description: 'Apoiou 100 usuários! Você virou um porto seguro pra muita gente por aqui.' },
  { id: 'b40', title: 'Abraço Coletivo', icon: '🤗', category: 'Rede de Apoio', rewardXp: 100, targetCount: 250, unitLabel: 'usuários', description: '250 usuários acolhidos. Seu carinho transforma este app numa comunidade de verdade.' },
  { id: 'b41', title: 'Farol da Comunidade', icon: '🏮', category: 'Rede de Apoio', rewardXp: 200, targetCount: 500, unitLabel: 'vidas', description: '500 vidas tocadas! Sua empatia ilumina o caminho de todo mundo ao redor.' },

  // 7. 🗳️ Sua Voz Importa (6 Conquistas)
  { id: 'b42', title: 'Primeiro Palpite', icon: '🗳️', category: 'Sua Voz Importa', rewardXp: 10, description: 'Deixou seu voto na primeira enquete. Sua vivência ajuda a guiar nossa conversa!' },
  { id: 'b43', title: 'Voz Ativa', icon: '📣', category: 'Sua Voz Importa', rewardXp: 10, targetCount: 5, unitLabel: 'enquetes', description: '5 enquetes respondidas. Adoramos saber o que se passa aí na sua rotina!' },
  { id: 'b44', title: 'Opinião que Conta', icon: '💭', category: 'Sua Voz Importa', rewardXp: 15, targetCount: 10, unitLabel: 'votos', description: '10 votos em enquetes. Construindo junto com a gente a sabedoria da nossa rede.' },
  { id: 'b45', title: 'Ouvinte Fiel', icon: '👂', category: 'Sua Voz Importa', rewardXp: 25, targetCount: 25, unitLabel: 'enquetes', description: '25 enquetes participadas! Você tá sempre de olho nos dilemas da nossa comunidade.' },
  { id: 'b46', title: 'Conselheiro Frequente', icon: '📜', category: 'Sua Voz Importa', rewardXp: 35, targetCount: 50, unitLabel: 'enquetes', description: '50 enquetes! Sua participação deixa os nossos debates muito mais ricos.' },
  { id: 'b47', title: 'Sabedoria da Tribo', icon: '🦉', category: 'Sua Voz Importa', rewardXp: 50, targetCount: 100, unitLabel: 'enquetes', description: '100 enquetes! Veterano em dividir como a vida real funciona por aí.' },

  // 8. 💖 Acolhimento (10 Conquistas)
  { id: 'b48', title: 'Não Estamos Sós', icon: '💖', category: 'Acolhimento', rewardXp: 10, description: 'Alguém leu o seu post e mandou um abraço em forma de reação.' },
  { id: 'b49', title: 'Eco de Afeto', icon: '📣', category: 'Acolhimento', rewardXp: 5, targetCount: 50, unitLabel: 'reações', description: '50 reações recebidas. O que você compartilha toca fundo em outros pais e mães.' },
  { id: 'b50', title: 'Vizinhança Segura', icon: '🏡', category: 'Acolhimento', rewardXp: 25, targetCount: 250, unitLabel: 'reações', description: '250 reações nos seus posts. A turma se sente muito compreendida por você!' },
  { id: 'b51', title: 'Centelha Compartilhada', icon: '✨', category: 'Acolhimento', rewardXp: 40, targetCount: 500, unitLabel: 'carinhos', description: '500 carinhos recebidos. Suas partilhas fazem diferença de verdade no dia de alguém.' },
  { id: 'b52', title: 'Presença Luminosa', icon: '🌟', category: 'Acolhimento', rewardXp: 70, targetCount: 1000, unitLabel: 'reações', description: '1.000 reações! Você espalha tanta verdade que todo mundo quer te ouvir.' },
  { id: 'b53', title: 'Coração da Comunidade', icon: '👑', category: 'Acolhimento', rewardXp: 150, targetCount: 2500, unitLabel: 'reações', description: '2.500 reações! Um marco gigante de conexão, afeto e presença viva.' },
  { id: 'b54', title: 'Novo Laço', icon: '🎀', category: 'Acolhimento', rewardXp: 15, description: 'Começou a acompanhar a jornada de alguém. É assim que a gente se fortalece!' },
  { id: 'b55', title: 'Laço Retribuído', icon: '🔁', category: 'Acolhimento', rewardXp: 15, description: 'Alguém quis acompanhar seus passos de perto. Sinal de que sua história inspira!' },
  { id: 'b56', title: 'Palavra de Carinho', icon: '💌', category: 'Acolhimento', rewardXp: 15, description: 'Deixou um recado afetuoso no mural de alguém. Gentileza puxa leveza!' },
  { id: 'b57', title: 'Afeto Recebido', icon: '🎁', category: 'Acolhimento', rewardXp: 15, description: 'Ganhou um depoimento carinhoso! Que delícia saber que você é importantíssimo pra alguém.' }
];

export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: 'Semente', minXp: 0, maxXp: 59, icon: '🌱', description: 'Você está iniciando uma nova jornada. Uma semente que carrega dentro dela tudo o que vai se desenvolver.' },
  { level: 2, title: 'Raiz', minXp: 60, maxXp: 139, icon: '🌿', description: 'A casquinha rompeu! Você começou a se movimentar, abrir espaço na rotina e dar os primeiros passos no seu próprio ritmo.' },
  { level: 3, title: 'Broto', minXp: 140, maxXp: 239, icon: '☘️', description: 'Seu primeiro impulso em direção à luz. Aquelas pequenas pausas e respiros que você tirou já começam a clarear o seu dia a dia.' },
  { level: 4, title: 'Folha', minXp: 240, maxXp: 359, icon: '🪴', description: 'Suas primeiras folhinhas se abriram para o mundo. Você começou a interagir, trocar na nossa comunidade e colocar o aprendizado pra fora.' },
  { level: 5, title: 'Muda', minXp: 360, maxXp: 499, icon: '🌾', description: 'Você já tem raiz e caule firmes! Encontrou seu próprio espaço no chão e agora caminha com mais segurança e força própria.' },
  { level: 6, title: 'Pitangueira', minXp: 500, maxXp: 669, icon: '🍒', description: 'Como uma pitangueira cheia de frescor, você traz leveza pro cotidiano e começa a colher os primeiros frutos doces da convivência.' },
  { level: 7, title: 'Jabuticabeira', minXp: 670, maxXp: 859, icon: '🍇', description: 'Na jabuticabeira, os frutos nascem coladinhos ao tronco. É o seu cuidado brotando direto da intimidade e do coração da sua família.' },
  { level: 8, title: 'Manacá', minXp: 860, maxXp: 1069, icon: '🌸', description: 'O manacá muda de cor conforme amadurece. Você aprendeu a ser flexível e a acolher com carinho cada nova fase que seu filho vive.' },
  { level: 9, title: 'Ipê', minXp: 1070, maxXp: 1279, icon: '🌼', description: 'O ipê floresce com tudo mesmo no tempo seco. Você descobriu que tem força e esperança pra florir até nos dias mais difíceis da rotina.' },
  { level: 10, title: 'Jacarandá', minXp: 1280, maxXp: 1449, icon: '🪻', description: 'Raízes fundas e presença marcante. Você construiu uma calma bonita que ajuda a segurar a onda quando aparecem as tempestades da criação.' },
  { level: 11, title: 'Flamboyant', minXp: 1450, maxXp: 1619, icon: '🌺', description: 'Galhos largos e copa aberta. Sua presença espalha uma energia calorosa e cria uma sombra gostosa pra quem divide a vida com você.' },
  { level: 12, title: 'Pau-Brasil', minXp: 1620, maxXp: 1779, icon: '🪵', description: 'Madeira nobre e firme. Você virou aquela base sólida que sustenta a caminhada da casa com constância, afeto verdadeiro e sem placar.' },
  { level: 13, title: 'Carvalho', minXp: 1780, maxXp: 1899, icon: '🌲', description: 'O carvalho não se abala com vento forte. Você conquistou a maturidade de quem não perde o prumo diante dos imprevistos da vida real.' },
  { level: 14, title: 'Jequitibá', minXp: 1900, maxXp: 1999, icon: '🌳', description: 'O gigante da floresta! Sua caminhada é tão profunda e cheia de história que virou um ponto de apoio seguro pra quem tá começando agora.' },
  { level: 15, title: 'Baobá', minXp: 2000, maxXp: 999999, icon: '👑', description: 'A árvore ancestral da vida. Você é o porto seguro da nossa comunidade: guarda memórias, acolhe todo mundo sob seus galhos e transborda sabedoria.' }
];

export function getLevelFromXP(xp: number) {
  const levelObj = USER_LEVELS.find(l => xp >= l.minXp && xp <= l.maxXp) || USER_LEVELS[USER_LEVELS.length - 1];
  
  const isMaxLevel = levelObj.level === 15;
  const nextLevel = isMaxLevel ? null : USER_LEVELS.find(l => l.level === levelObj.level + 1);
  const nextLevelXp = nextLevel ? nextLevel.minXp : levelObj.maxXp;
  
  const xpInCurrentLevel = xp - levelObj.minXp;
  const rangeInCurrentLevel = Math.max(1, (nextLevel ? nextLevel.minXp : levelObj.maxXp + 1) - levelObj.minXp);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / rangeInCurrentLevel) * 100)));

  return {
    level: levelObj.level,
    title: levelObj.title,
    icon: levelObj.icon,
    description: levelObj.description,
    minXp: levelObj.minXp,
    maxXp: levelObj.maxXp,
    nextLevelXp,
    progressPercent,
    isMaxLevel,
    nextLevelTitle: nextLevel ? nextLevel.title : null
  };
}
