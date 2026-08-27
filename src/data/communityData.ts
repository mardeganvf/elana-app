import { BrandReaction, CommunityPost } from '../types';

export interface TransversalRoomDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isAnonymous: boolean;
  sensitivityLevel: 'padrao' | 'elevado' | 'critico';
}

export interface AgeBracketRoomDef {
  id: string;
  name: string;
  range: string;
  description: string;
}

export const BRAND_REACTIONS: BrandReaction[] = [
  {
    id: 'estou_aqui',
    label: 'Estou Aqui',
    useCase: 'Presença, acompanhamento silencioso — a mais neutra, sempre apropriada',
    iconName: 'Heart',
    color: '#B87353' // Terracota Suave
  },
  {
    id: 'vai_dar_certo',
    label: 'Vai Dar Certo',
    useCase: 'Esperança, ânimo — mesmo tom do nascer do sol da jornada Pais Recém-Nascidos',
    iconName: 'Sun',
    color: '#FFD166' // Ouro Solar
  },
  {
    id: 'que_alivio',
    label: 'Que Alívio',
    useCase: 'Quando algo pesado passa ou se resolve — ondas suaves de respiro',
    iconName: 'Waves',
    color: '#8A9A5B' // Verde Sálvia
  },
  {
    id: 'aqui_tambem',
    label: 'Aqui Também!',
    useCase: 'Identificação, solidariedade — "também vivi isso"',
    iconName: 'CircleDot',
    color: '#F0A8C3' // Rosa Claro
  },
  {
    id: 'mandou_bem',
    label: 'Mandou Bem',
    useCase: 'Reconhecimento, conquista, orgulho',
    iconName: 'Star',
    color: '#FF7F5B' // Coral Vibrante
  },
  {
    id: 'ajudou_muito',
    label: 'Ajudou Muito!',
    useCase: 'Utilidade prática de uma resposta ou conselho',
    iconName: 'Lightbulb',
    color: '#2DD4BF' // Vibrant Teal (visible on dark background)
  },
  {
    id: 'alegria',
    label: 'Fiquei Feliz',
    useCase: 'Leveza, sorriso — sem ser humor/deboche',
    iconName: 'Flower2',
    color: '#E66795' // Rosa Acolhedor
  }
];

export const EMOTIONAL_INTENTIONS = [
  {
    id: 'ajuda',
    badge: '🆘 Preciso de ajuda',
    label: 'Preciso de ajuda',
    description: 'Bateu uma dúvida na prática? Pergunta aqui que a gente troca ideias e caminhos com carinho.',
    color: '#FF7F5B'
  },
  {
    id: 'desabafar',
    badge: '💧 Preciso desabafar',
    label: 'Preciso desabafar',
    description: 'Aqui você só precisa colocar pra fora. Ninguém vai te julgar ou dar palpite sem pedir — só acolher.',
    color: '#8A9A5B'
  },
  {
    id: 'celebrar',
    badge: '🎉 Preciso celebrar',
    label: 'Preciso celebrar',
    description: 'Conquista pequena também é vitória gigante! Vem dividir pra gente comemorar junto com você.',
    color: '#FFD166'
  }
] as const;

export const TRANSVERSAL_ROOMS: TransversalRoomDef[] = [
  {
    id: 'boas-vindas',
    name: 'Boas-Vindas',
    emoji: '👋',
    description: 'Que bom que você chegou! Aqui a gente se apresenta, lê os combinados da casa e dá o primeiro abraço em quem tá chegando.',
    isAnonymous: false,
    sensitivityLevel: 'padrao'
  },
  {
    id: 'confessionario',
    name: 'Confessionário',
    emoji: '🕯️',
    description: 'Um cantinho 100% anônimo pra desabafar aquilo que você não tem coragem de falar em voz alta. Sem julgamentos, só alívio.',
    isAnonymous: true,
    sensitivityLevel: 'critico'
  },
  {
    id: 'cantinho-mel',
    name: 'Cantinho da Mel',
    emoji: '🍯',
    description: 'Nossa roda de conversa oficial. Aqui tem enquetes gostosas, respostas das nossas especialistas e novidades pra sua rotina.',
    isAnonymous: false,
    sensitivityLevel: 'padrao'
  },
  {
    id: 'espaco-dois',
    name: 'Espaço a Dois',
    emoji: '💖',
    description: 'Porque criar filhos a dois tem seus desafios. Um lugar leve pra falar sobre parceria, amor e vida a dois sem tabus.',
    isAnonymous: false,
    sensitivityLevel: 'elevado'
  },
  {
    id: 'cuidando-quem-cuida',
    name: 'Cuidando de Quem Cuida',
    emoji: '🌱',
    description: 'Lembrar de você não é capricho, é essencial. Um respiro dedicado a cuidar de quem cuida da casa inteira.',
    isAnonymous: false,
    sensitivityLevel: 'padrao'
  }
];

export const AGE_BRACKET_ROOMS: AgeBracketRoomDef[] = [
  { id: '0-2', name: '0–2 anos', range: 'Bebês e Primeiríssima Infância', description: 'Sono, amamentação, introdução alimentar e aqueles primeiros passos que dão um quentinho no coração.' },
  { id: '3-6', name: '3–6 anos', range: 'Primeira Infância', description: 'Lidando com as birras, o desfralde, a ida pra escola e essa fase cheia de descobertas e imaginação.' },
  { id: '7-10', name: '7–10 anos', range: 'Fase Escolar', description: 'Lição de casa, amizades, os primeiros limites e a autonomia que vai nascendo no dia a dia.' },
  { id: '11-14', name: '11–14 anos', range: 'Pré-Adolescência', description: 'Mudanças no corpo, primeiros celulares e a transição da infância pra um novo mundo.' },
  { id: '14-19', name: '14–19 anos', range: 'Adolescência e Transição', description: 'Diálogos abertos sobre o futuro, independência, vestibulares e como manter a ponte estendida.' },
  { id: '20-plus', name: '20+ anos', range: 'Jovens Adultos & Ninho Vazio', description: 'Novos ciclos na família, filhos alando voo e o reencontro com a sua própria caminhada.' }
];

export const INITIAL_POSTS: CommunityPost[] = [];
