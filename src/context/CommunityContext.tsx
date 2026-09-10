import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommunityPost, CommunityComment, EmotionalIntention, SensitivityLevel, CommunityPoll, NewPollPayload } from '../types';

import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CreatePostPayload {
  journeyId?: string;
  transversalRoomId?: string;
  ageBracketId?: string;
  emotionalIntention?: EmotionalIntention;
  moduleTopic?: string;
  title: string;
  content: string;
  isAnonymous?: boolean;
  sensitivityCheck?: ContentSensitivityResult;
}

// Função de normalização textual (remove acentos, comprime repetições e passa para minúsculas)
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/(.)\1{2,}/g, '$1$1') // comprime letras repetidas excessivas (ex: suuuumir -> sumir)
    .trim();
};

// 1. PADRÕES E REGRAS DE RISCO À VIDA, IDEAÇÃO, DESVALIA EXTREMA E SOFRIMENTO PROFUNDO
export const VULNERABILITY_PATTERNS = [
  // Ideação / Sumiço / Desaparecimento / Morte
  { pattern: /(?:vontade\s+de|pensando\s+em|querendo|preciso|vou|devo|queria|quero|desejo\s+de|melhor|seria\s+melhor|bom|seria\s+bom|hora\s+de|se\s+eu)\s+sumir/i, reason: 'Ideação / Vontade de sumir' },
  { pattern: /\b(?:seria\s+)?melhor\s+sumir\b/i, reason: 'Ideação: Melhor sumir' },
  { pattern: /\bse\s+eu\s+sumir\b/i, reason: 'Ideação: Se eu sumir' },
  { pattern: /\b(?:vou|quero|queria|preciso|hora\s+de)\s+sumir\b/i, reason: 'Desejo explícito de sumir' },
  { pattern: /\bsumir\s+(?:de\s+vez|do\s+mapa|pra\s+sempre|e\s+nunca\s+mais|daqui)\b/i, reason: 'Desejo de sumir definitivamente' },
  { pattern: /(?:vontade\s+de|pensando\s+em|querendo|desejo\s+de|preferia|melhor|antes)\s+morrer/i, reason: 'Ideação de morte' },
  { pattern: /(?:preferia|queria|seria\s+melhor)\s+estar\s+mort[ao]/i, reason: 'Ideação de morte' },
  { pattern: /(?:vontade\s+de|pensando\s+em|querendo|preciso|melhor|seria\s+melhor|vou|queria)\s+desaparecer/i, reason: 'Desejo de desaparecer' },
  { pattern: /\bdesaparecer\s+(?:do\s+mapa|do\s+mundo|de\s+vez)\b/i, reason: 'Desejo de desaparecer' },
  { pattern: /(?:queria\s+nao|queria\s+nunca\s+ter|melhor\s+nao|deixar\s+de)\s+existir/i, reason: 'Desejo de não existir' },
  { pattern: /(?:nunca\s+devia|nunca\s+deveria)\s+ter\s+nascid[ao]/i, reason: 'Rejeição à própria existência' },
  { pattern: /\b(?:cansei|cansad[ao])\s+de\s+(?:tudo|tudo\s+isso|lutar|sofrer|tentar|insistir|existir)\b/i, reason: 'Desistência extrema / Cansei de tudo' },
  { pattern: /\bchega\s+de\s+(?:tudo|sofrer|lutar|tentar|viver|respirar|existir)\b/i, reason: 'Desistência extrema / Risco à vida' },
  { pattern: /\b(?:vou|indo|partindo)\s+dessa\s+(?:pr?a|para)\s+(?:uma\s+)?melhor\b/i, reason: 'Eufemismo de morte / Fim da vida' },
  { pattern: /\bparar\s+de\s+respirar\b/i, reason: 'Ideação de cessação de vida' },

  // Sentimento de Não Ter Importância / Desvalia / Rejeição / Fardo
  { pattern: /(?:minha\s+vida|minha\s+existencia|minha\s+historia|tudo\s+em\s+mim)\s+(?:nao|nunca)\s+(?:importa|tem\s+valor|tem\s+sentido|vale\s+nada|faz\s+sentido|vale\s+a\s+pena)/i, reason: 'Desvalia da própria vida' },
  { pattern: /(?:minha\s+vida|viver)\s+nao\s+vale\s+a\s+pena/i, reason: 'Desvalia extrema de viver' },
  { pattern: /(?:eu|minha\s+vida|nada)\s+(?:nao|nunca)\s+import[ao]/i, reason: 'Sentimento de não importar' },
  { pattern: /(?:nao|nunca)\s+importo\s*(?:pra|para)?/i, reason: 'Sentimento de não ter valor ou importância' },
  { pattern: /(?:nao|nunca)\s+(?:sou|sinto\s+que\s+sou|sou\s+nada|tenho)\s+(?:importante|importancia|valor|relevante)/i, reason: 'Sentimento de desvalia / Não ser importante' },
  { pattern: /(?:nao|nunca)\s+importo\s+(?:pra|para)\s+(?:ninguem|ele|ela|eles)/i, reason: 'Sentimento de não importar a ninguém' },
  { pattern: /(?:nao|nunca)\s+(?:faco|faria|faz)\s+(?:a\s+menor\s+)?(?:falta|diferenca)/i, reason: 'Sentimento de não fazer falta ou diferença' },
  { pattern: /ninguem\s+(?:vai\s+|iria\s+)?sentir\s+(?:minha\s+)?falta/i, reason: 'Sentimento de ausência de falta' },
  { pattern: /ninguem\s+(?:se\s+importa\s+comigo|se\s+importa|precisa\s+de\s+mim|liga\s+pra\s+mim|me\s+ama)/i, reason: 'Sensação de desamparo / Ninguém se importa' },
  { pattern: /(?:ele|ela|eles)\s+nao\s+precisa[m]?\s+de\s+mim/i, reason: 'Sensação de inutilidade familiar' },
  { pattern: /(?:sou|me\s+sinto)\s+(?:um\s+)?(?:fardo|peso|estorvo|lixo|fracasso\s+total)/i, reason: 'Sentimento de ser fardo / peso' },
  { pattern: /(?:seria\s+)?melhor\s+(?:sem\s+mim|se\s+eu\s+(?:sumisse|morresse|nao\s+existisse))/i, reason: 'Ideação de que outros estariam melhor sem si' },
  { pattern: /(?:estariam|ficariam)\s+melhor\s+sem\s+mim/i, reason: 'Ideação de que estariam melhor sem si' },
  { pattern: /(?:tanto\s+faz|nao\s+faz\s+diferenca)\s+se\s+eu\s+(?:morrer|sumir|viver|existir)/i, reason: 'Indiferença à própria vida' },
  { pattern: /(?:cansei|cansad[ao])\s+de\s+viver/i, reason: 'Perda do desejo de viver' },

  // Perda de Forças / "Não dou conta" / Desesperança Crítica
  { pattern: /(?:nao|nunca)\s+(?:estou|to)?\s*dando\s+conta/i, reason: 'Exaustão crítica / Não estar dando conta' },
  { pattern: /(?:nao|nunca)\s+dou\s+(?:mais\s+)?conta/i, reason: 'Incapacidade extrema / Não dar conta' },
  { pattern: /(?:nao|nunca)\s+(?:vou\s+dar|consigo\s+dar|aguento\s+dar)\s+conta/i, reason: 'Incapacidade extrema de dar conta' },
  { pattern: /(?:nao|nunca)\s+(?:aguento|suporto|resisto)\s+mais/i, reason: 'Esgotamento crítico / Não aguentar mais' },
  { pattern: /(?:nao\s+estou|nao\s+to|nao\s+consigo)\s+aguentando/i, reason: 'Exaustão crítica / Não estar aguentando' },
  { pattern: /(?:nao\s+presto|nao\s+sirvo)\s+(?:pra\s+ser|para\s+ser|pra|para|nada)/i, reason: 'Autodepreciação extrema' },
  { pattern: /(?:me\s+sinto\s+)?(?:inutil|sem\s+valor)/i, reason: 'Sentimento de desvalia total' },
  { pattern: /(?:nao\s+quero|cansei\s+de|sem\s+vontade\s+de)\s+viver/i, reason: 'Perda do desejo de viver' },
  { pattern: /(?:perdi|sem)\s+(?:o\s+)?sentido\s+(?:de\s+viver|da\s+vida|em\s+viver)/i, reason: 'Perda de sentido vital' },
  { pattern: /(?:minha\s+vida|tudo)\s+(?:perdeu\s+o\s+sentido|nao\s+tem\s+mais\s+sentido|acabou)/i, reason: 'Desesperança total' },
  { pattern: /(?:sem|perdi\s+(?:as|a))\s+forcas?\s+(?:pra\s+continuar|para\s+continuar|pra\s+viver)?/i, reason: 'Ausência total de forças' },
  { pattern: /(?:minhas\s+)?forcas?\s+acabaram/i, reason: 'Forças esgotadas' },
  { pattern: /(?:nao\s+tenho|nao\s+vejo)\s+(?:mais\s+)?saida/i, reason: 'Sensação de estar sem saída' },
  { pattern: /\bsem\s+saida\b/i, reason: 'Sensação de sem saída' },
  { pattern: /(?:cheguei|estou)\s+(?:no\s+meu\s+|ao\s+meu\s+|no\s+)?limite/i, reason: 'Limite extrapolado' },
  { pattern: /(?:cheguei|estou)\s+no\s+fundo\s+do\s+poco/i, reason: 'Sensação de fundo do poço' },
  { pattern: /\bdesespero\s+(?:total|profundo)\b/i, reason: 'Desespero agudo' },

  // Ações de Risco Imediato / Autoagressão
  { pattern: /(?:tirar|dar\s+fim\s+a|dar\s+um\s+fim\s+na)\s+(?:minha\s+)?vida/i, reason: 'Risco iminente à vida' },
  { pattern: /(?:acabar\s+com\s+tudo|por\s+um\s+fim|por\s+um\s+fim\s+em\s+tudo)/i, reason: 'Ideação de término drástico' },
  { pattern: /(?:fazer|cometer)\s+(?:uma\s+)?besteira/i, reason: 'Menção a fazer besteira' },
  { pattern: /(?:me\s+machucar|me\s+ferir|me\s+cortar|automutilacao|me\s+matar|se\s+matar)/i, reason: 'Autoagressão explícita' },
  { pattern: /\b(?:suicidio|pensamentos\s+suicidas)\b/i, reason: 'Menção direta a suicídio' },
  { pattern: /(?:dormir|apagar)\s+e\s+(?:nunca\s+mais\s+|nao\s+)?(?:nao\s+acordar|nunca\s+mais\s+acordar)/i, reason: 'Desejo de não acordar' },
  { pattern: /(?:tomar|beber)\s+(?:todos\s+os|uma\s+cartela\s+de)\s+remedios/i, reason: 'Risco de intoxicação medicamentosa' }
];

// Expressões legadas de vulnerabilidade para verificação direta
export const VULNERABILITY_KEYWORDS = [
  'minha vida não importa', 'minha vida nao importa', 'minha vida não vale a pena', 'minha vida não tem valor',
  'não importo pra ninguém', 'nao importo pra ninguem', 'não faço diferença', 'nao faco diferenca',
  'vontade de sumir', 'quero sumir', 'pensando em sumir', 'sumir de vez', 'sumir do mapa', 'preciso sumir',
  'vontade de morrer', 'quero morrer', 'pensando em morrer', 'desejo de morrer', 'vontade de desaparecer',
  'quero desaparecer', 'desaparecer do mundo', 'não aguento mais', 'nao aguento mais', 'não aguento mais viver',
  'não suporto mais', 'não vejo saída', 'sem saída', 'acabar com tudo', 'por um fim', 'pôr um fim',
  'fazer besteira', 'fazer uma besteira', 'me machucar', 'me ferir', 'tirar minha vida', 'não quero mais viver',
  'não dou mais conta', 'não dou conta', 'não estou dando conta', 'não tenho mais forças', 'perdi o sentido',
  'sem vontade de viver', 'sem forças pra continuar', 'esgotamento extremo', 'não sou importante', 'me sinto um peso',
  'chega de respirar', 'vou dessa para uma melhor', 'vou dessa pra uma melhor', 'parar de respirar'
];

// 2. PADRÕES DE OFENSAS, CRÍTICA PESADA (MOM-SHAMING) E TOM IMPOSITIVO
export const OFFENSIVE_PATTERNS = [
  // Palavras de Baixo Calão / Xingamentos com limites de palavra
  { pattern: /\b(?:puta|putas|filh[ao]\s+da\s+puta|fdp|pqp|porra|caralho|merda|bosta)\b/i, reason: 'Linguagem obscena / ofensiva' },
  { pattern: /\b(?:foder|fuder|fodendo|fudendo|fudeu|fodeu|foda-se|fodasse)\b/i, reason: 'Linguagem vulgar / explícita' },
  { pattern: /\b(?:buceta|piroca|caralhada|punheta|boquete|siririca|xoxota)\b/i, reason: 'Termos sexuais explícitos' },
  { pattern: /\b(?:arrombad[ao]|babaca|otari[ao]|imbecil|idiota|estupid[ao]|retardad[ao]|burr[ao]|burr[ao]s|incompetente)\b/i, reason: 'Xingamento / Ofensa direta' },
  { pattern: /\b(?:vagabund[ao]|desgracad[ao]|desgraca|escrot[ao]|cuz[ao]o|canalha|cretin[ao]|nojent[ao])\b/i, reason: 'Xingamento / Ofensa degradante' },
  { pattern: /\b(?:vai\s+se\s+foder|vai\s+tomar\s+no\s+cu|vsf|vtnc|vsfd)\b/i, reason: 'Ofensa verbal grave' },

  // Crítica Pesada / Mom-Shaming / Julgamento Parental Agressivo
  { pattern: /\b(?:pessim[ao]|ruim|horrivel|de\s+merda)\s+(?:mae|pai)\b/i, reason: 'Julgamento parental destrutivo' },
  { pattern: /\b(?:mae|pai)\s+(?:pessim[ao]|ruim|horrivel|de\s+merda|desnaturad[ao])\b/i, reason: 'Ataque à maternidade/paternidade' },
  { pattern: /\b(?:voce\s+e\s+)?(?:uma\s+)?pessima\s+mae\b/i, reason: 'Ataque direto à maternidade' },
  { pattern: /\b(?:voce\s+e\s+)?(?:um\s+)?pessimo\s+pai\b/i, reason: 'Ataque direto à paternidade' },
  { pattern: /\b(?:voce\s+)?(?:esta\s+)?fazendo\s+tudo\s+errad[ao]\b/i, reason: 'Julgamento destrutivo da capacidade parental' },
  { pattern: /\b(?:faz|fazem|fazendo)\s+tudo\s+errad[ao]\b/i, reason: 'Desqualificação agressiva de conduta' },
  { pattern: /\bnao\s+(?:nasceu|serve|presta|tem\s+capacidade|tem\s+jeito|tem\s+condicoes)\s+(?:pr?a|para)\s+ser\s+(?:mae|pai)\b/i, reason: 'Invalidação parental destrutiva' },
  { pattern: /\bnao\s+(?:merece|deveria|devia)\s+(?:ser\s+mae|ter\s+filho[s]?)\b/i, reason: 'Desqualificação parental agressiva' },
  { pattern: /\bquem\s+mandou\s+ter\s+(?:filho[s]?|bebe|crianca)\b/i, reason: 'Culpabilização e desqualificação' },
  { pattern: /\b(?:desnaturad[ao]|irresponsavel|negligente|relaxad[ao]|preguicos[ao]|egoista)\b/i, reason: 'Acusação pejorativa' },
  { pattern: /\b(?:mae\s+louca|louca\s+varrida|desequilibrada|surtada|histerica)\b/i, reason: 'Desqualificação psicológica agressiva' },
  { pattern: /\bcoitad[ao]\s+(?:do\s+bebe|da\s+crianca|do\s+seu\s+filho|da\s+sua\s+filha)\b/i, reason: 'Julgamento culpabilizador' },
  { pattern: /\b(?:deveria\s+ter|tenha|crie)\s+vergonha\b/i, reason: 'Humilhação / Shaming' },
  { pattern: /\bnao\s+(?:sabe\s+ser|serve\s+(?:pr?a|para)\s+ser)\s+(?:mae|pai)\b/i, reason: 'Invalidação parental' },
  { pattern: /\bnao\s+devia\s+ter\s+tido\s+filho\b/i, reason: 'Ataque pessoal extremo' },
  { pattern: /\b(?:estragando|destruindo|traumatizando)\s+(?:seu\s+filho|sua\s+filha|o\s+bebe|a\s+crianca)\b/i, reason: 'Acusação de dano à criança' },
  { pattern: /\b(?:vai\s+matar|fazendo\s+mal\s+(?:pr[ao]|para\s+[oa]))\s+(?:bebe|crianca|filh[ao])\b/i, reason: 'Acusação grave de perigo' },
  { pattern: /\b(?:mimimi|frescura|vitimismo|para\s+de\s+drama|choradeira)\b/i, reason: 'Minimização agressiva / Julgamento' },
  { pattern: /\b(?:culpa\s+sua|a\s+culpa\s+e\s+toda\s+sua|voce\s+procurou|bem\s+feito)\b/i, reason: 'Culpabilização agressiva' },

  // Tom Exageradamente Impositivo / Intimidatório
  { pattern: /\bcala(?:r)?\s+(?:a\s+|sua\s+|essa\s+)?boca\b/i, reason: 'Tom impositivo: Mandato de silenciamento' },
  { pattern: /\bcala\s+e\s+escuta\b/i, reason: 'Tom impositivo: Silenciamento agressivo' },
  { pattern: /\bfica\s+(?:quieta|quieto|calada|calado)\b/i, reason: 'Tom impositivo: Silenciamento agressivo' },
  { pattern: /\bengol(?:a|e)\s+(?:o\s+)?choro\b/i, reason: 'Tom impositivo: Supressão emocional violenta' },
  { pattern: /\b(?:voce\s+e\s+|sua\s+)?obrigad[ao]\s+a\b/i, reason: 'Tom impositivo: Imposição de obrigatoriedade' },
  { pattern: /\b(?:tem\s+que|e\s+sua\s+obrigacao)\s+calar\b/i, reason: 'Tom impositivo: Ordem abusiva' },
  { pattern: /\bvai\s+(?:se\s+tratar|pro\s+hospicio|tomar\s+remedio)\b/i, reason: 'Agressão / Desqualificação médica' },
  { pattern: /\bnao\s+tem\s+(?:o\s+)?direito\s+de\s+reclamar\b/i, reason: 'Tom impositivo: Cassação de fala' },
  { pattern: /\bnao\s+tem\s+moral\b/i, reason: 'Tom impositivo / Ofensa moral' },
  { pattern: /\bpara\s+de\s+(?:reclamar|falar\s+besteira|falar\s+bobagem)\b/i, reason: 'Tom impositivo: Interrupção agressiva' },
  { pattern: /\b(?:faca\s+o\s+que\s+eu\s+mando|quem\s+manda\s+sou\s+eu)\b/i, reason: 'Tom impositivo: Autoritarismo' },
  { pattern: /\bvoce\s+nao\s+sabe\s+nada\b/i, reason: 'Desqualificação intelectual agressiva' },

  // Pressão Sexual, Coerção Conjugal e Violação de Consentimento
  { pattern: /\b(?:como\s+)?(?:convencer|forcar|obrigar|pressionar|insistir)\b.*?\b(?:sexo|transar|fazer\s+sexo|penetracao|pratica\s+sexual)\b/i, reason: 'Pressão ou coerção sexual contra a vontade do parceiro(a)' },
  { pattern: /\b(?:esposa|namorada|mulher|marido|parceir[ao])\s+nao\s+quer\b.*?\b(?:sexo|transar|anal|oral|penetracao)\b/i, reason: 'Incentivo à violação de limites íntimos e consentimento' },
  { pattern: /\b(?:nao\s+quer|recusa|nao\s+aceita)\b.*?\b(?:sexo|transar|sexo\s+anal|oral|penetracao)\b/i, reason: 'Desrespeito ao consentimento e limites sexuais' },
  { pattern: /\b(?:fazer|praticar)\s+sexo\s+anal\b/i, reason: 'Conteúdo íntimo explícito em desacordo com as diretrizes' },
  { pattern: /\bsexo\s+anal\b/i, reason: 'Termo sexual explícito sob moderação preventiva' },

  // Não Consentimento, Estupro, Violação e Abuso de Vulnerável (ex: parceiro dormindo/inconsciente)
  { pattern: /\b(?:fazer|ter|praticar)\s+sexo\b.*?\b(?:dormindo|desacordad[ao]|inconsciente|apagad[ao]|dopad[ao]|bebad[ao]|embriagad[ao])\b/i, reason: 'Violação grave: Ato sexual não consentido / Estupro de vulnerável' },
  { pattern: /\b(?:sexo|transar|penetracao|penetrar|tocar|passar\s+a\s+mao|pratica\s+sexual|alisar)\b.*?\b(?:dormindo|desacordad[ao]|inconsciente|apagad[ao]|dopad[ao]|bebad[ao]|embriagad[ao]|drogad[ao]|sem\s+consciencia|sem\s+acordar)\b/i, reason: 'Violação grave: Não consentimento / Estupro de vulnerável' },
  { pattern: /\b(?:dormindo|desacordad[ao]|inconsciente|apagad[ao]|dopad[ao]|bebad[ao]|embriagad[ao])\b.*?\b(?:sexo|transar|penetracao|penetrar|tocar|fazer\s+sexo)\b/i, reason: 'Violação grave: Não consentimento / Estupro de vulnerável' },
  { pattern: /\b(?:estupr[ao]|estuprar|estuprador|estuprada|estupros)\b/i, reason: 'Violência sexual / Crime de estupro' },
  { pattern: /\b(?:abuso\s+sexual|abusar\s+sexualmente|violencia\s+sexual|violacao\s+sexual|estupro\s+marital|estupro\s+conjugal)\b/i, reason: 'Violência ou abuso sexual' },
  { pattern: /\b(?:forcar|obrigar)\b.*?\b(?:a\s+)?(?:transar|fazer\s+sexo|abrir\s+as\s+pernas)\b/i, reason: 'Coerção sexual física / Estupro' },
  { pattern: /\bsem\s+(?:o\s+)?(?:consentimento|ela\s+querer|ele\s+querer|ela\s+saber|ele\s+saber|permissao)\b.*?\b(?:sexo|transar|penetracao|tocar)\b/i, reason: 'Ato sexual sem consentimento' },
  { pattern: /\b(?:sexo|transar)\b.*?\bsem\s+(?:o\s+)?(?:consentimento|ela\s+querer|ele\s+querer|ela\s+saber|ele\s+saber|permissao)\b/i, reason: 'Ato sexual sem consentimento' },
  { pattern: /\b(?:pornografia|conteudo\s+adulto|prostituicao|venda\s+de\s+nudez)\b/i, reason: 'Conteúdo adulto / explícito proibido' },

  // Assédio Sexual, Cantadas Invasivas, Importunação e Objetificação Corporal
  { pattern: /\b(?:voce\s+(?:e\s+|ta\s+|eh\s+))?(?:muito\s+|tao\s+|t[aã]o\s+)?gostos[ao]s?\b/i, reason: 'Assédio sexual / Objetificação corporal indevida' },
  { pattern: /\b(?:quero|vou|vem\s+que\s+eu|deixa\s+eu)\s+(?:te\s+)?(?:pegar|comer|fuder|foder|chupar|tracar|traçar)\b/i, reason: 'Assédio sexual / Investida de teor sexual explícito' },
  { pattern: /\b(?:te\s+pegar|te\s+pego|vou\s+te\s+pegar|quero\s+te\s+pegar|vou\s+te\s+comer|quero\s+te\s+comer)\b/i, reason: 'Assédio sexual / Investida de teor sexual explícito' },
  { pattern: /\b(?:vem\s+ca|vem\s+c[aá])\s+(?:me\s+dar\s+um\s+beijo|minha\s+gostosa|minha\s+delicia)\b/i, reason: 'Assédio / Cantada invasiva imprópria' },
  { pattern: /\b(?:delicia|del[ií]cia)\b.*?\b(?:gostosa|pegar|corpo|safada|beijo)\b/i, reason: 'Assédio sexual / Objetificação' },
  { pattern: /\b(?:que\s+)?(?:mulher|mae|m[aã]e)\s+(?:gostosa|deliciosa|tesuda)\b/i, reason: 'Assédio sexual / Objetificação' },
  { pattern: /\b(?:manda\s+(?:nudes|foto\s+pelada|foto\s+nua)|quer\s+ver\s+(?:meu\s+pau|minha\s+rola|sua\s+buceta))\b/i, reason: 'Assédio sexual / Solicitação ou envio de conteúdo íntimo' },
  { pattern: /\b(?:que\s+corpo|que\s+raba|que\s+bunda|que\s+peit[ao]s?)\b/i, reason: 'Objetificação corporal e assédio' },
  { pattern: /\b(?:chupa\s+meu|chupar\s+sua)\b/i, reason: 'Linguagem sexual explícita / Invasiva' },
  { pattern: /\b(?:safad[ao]s?|tesuda|tarad[ao]|siririca|punheta)\b/i, reason: 'Vocabulário sexual ofensivo ou assediador' }
];

// Expressões legadas de antijulgamento para verificação direta
export const SHAMING_KEYWORDS = [
  'irresponsavel', 'irresponsável', 'relaxada', 'preguicosa', 'preguiçosa',
  'pessima mae', 'péssima mãe', 'pessimo pai', 'péssimo pai', 'mae ruim', 'mãe ruim',
  'culpa sua', 'deveria ter vergonha', 'sem nocao', 'sem noção', 'coitado do bebe',
  'coitado do bebê', 'absurdo fazer isso', 'mae louca', 'mãe louca', 'negligente',
  'egoista', 'egoísta', 'burra', 'idiota', 'mimimi', 'frescura',
  'gostosa', 'gostoso', 'muito gostosa', 'quero te pegar', 'vou te pegar', 'delicia', 'delícia', 'safada', 'safado'
];

export type SensitivityFlagType = 'vulnerabilidade' | 'antijulgamento';

export interface ContentSensitivityResult {
  isFlagged: boolean;
  type?: SensitivityFlagType;
  matchedWord?: string;
  flagReason?: string;
  suggestsCrisisSupport?: boolean;
}

export const checkContentSensitivity = (text: string): ContentSensitivityResult => {
  if (!text) return { isFlagged: false };
  const normalized = normalizeText(text);

  // 1. PRIORIDADE MÁXIMA: Risco à Vida, Ideação, Desvalia Extrema e Sofrimento Profundo
  for (const item of VULNERABILITY_PATTERNS) {
    const match = normalized.match(item.pattern);
    if (match) {
      return {
        isFlagged: true,
        type: 'vulnerabilidade',
        matchedWord: match[0],
        flagReason: `Alerta de Acolhimento: "${match[0]}" (${item.reason})`,
        suggestsCrisisSupport: true
      };
    }
  }

  for (const word of VULNERABILITY_KEYWORDS) {
    const normWord = normalizeText(word);
    if (normalized.includes(normWord)) {
      return {
        isFlagged: true,
        type: 'vulnerabilidade',
        matchedWord: word,
        flagReason: `Alerta de Acolhimento: "${word}"`,
        suggestsCrisisSupport: true
      };
    }
  }

  // 2. OFENSAS, BAIXO CALÃO, CRÍTICA PESADA (MOM-SHAMING) E TOM IMPOSITIVO
  for (const item of OFFENSIVE_PATTERNS) {
    const match = normalized.match(item.pattern);
    if (match) {
      return {
        isFlagged: true,
        type: 'antijulgamento',
        matchedWord: match[0],
        flagReason: `Alerta Antijulgamento: "${match[0]}" (${item.reason})`,
        suggestsCrisisSupport: false
      };
    }
  }

  for (const word of SHAMING_KEYWORDS) {
    const normWord = normalizeText(word);
    if (normalized.includes(normWord)) {
      return {
        isFlagged: true,
        type: 'antijulgamento',
        matchedWord: word,
        flagReason: `Alerta Antijulgamento: "${word}"`,
        suggestsCrisisSupport: false
      };
    }
  }

  return { isFlagged: false };
};

export const checkAntiShaming = (text: string): { isFlagged: boolean; matchedWord?: string; flagType?: SensitivityFlagType } => {
  const res = checkContentSensitivity(text);
  return {
    isFlagged: res.isFlagged,
    matchedWord: res.matchedWord,
    flagType: res.type
  };
};

// Moderação Contextual Avançada com IA Gemini (via Supabase Edge Function) + Fallback Seguro
export const checkContentSensitivityAI = async (
  text: string, 
  title?: string, 
  content?: string
): Promise<ContentSensitivityResult> => {
  if (!text || !text.trim()) return { isFlagged: false };

  // 1. Verificação local instantânea de alta prioridade (título isolado, corpo isolado e texto completo)
  if (title && title.trim()) {
    const titleCheck = checkContentSensitivity(title.trim());
    if (titleCheck.isFlagged) return titleCheck;
  }

  if (content && content.trim()) {
    const contentCheck = checkContentSensitivity(content.trim());
    if (contentCheck.isFlagged) return contentCheck;
  }

  const fullLocalCheck = checkContentSensitivity(text.trim());
  if (fullLocalCheck.isFlagged) {
    return fullLocalCheck;
  }

  // 2. Análise contextual avançada via Supabase Edge Function com IA Gemini
  try {
    const timeoutPromise = new Promise<{ error: string }>((resolve) =>
      setTimeout(() => resolve({ error: 'TIMEOUT' }), 4500)
    );

    const invokePromise = supabase.functions.invoke('moderate-content', {
      body: { text: text.trim() }
    });

    const result: any = await Promise.race([invokePromise, timeoutPromise]);

    if (result && !result.error && result.data && !result.data.fallbackRequired) {
      const data = result.data;
      if (data.isFlagged) {
        const flagType: SensitivityFlagType = data.category === 'vulnerabilidade' ? 'vulnerabilidade' : 'antijulgamento';
        const prefix = flagType === 'vulnerabilidade' ? 'Alerta de Acolhimento' : 'Alerta Antijulgamento';
        return {
          isFlagged: true,
          type: flagType,
          matchedWord: data.matchedContext || 'análise contextual de IA',
          flagReason: `${prefix}: "${data.matchedContext || 'análise de IA'}" (${data.reason || 'Sinalizado pelas diretrizes da comunidade'})`,
          suggestsCrisisSupport: !!data.suggestsCrisisSupport
        };
      } else if (data.category === 'livre' || data.isFlagged === false) {
        return { isFlagged: false };
      }
    }
  } catch (err) {
    console.warn('IA moderation fallback notice:', err);
  }

  // 3. Fallback de contingência
  return fullLocalCheck;
};

const ANON_ANIMALS = [
  'Coruja', 'Lontra', 'Urso', 'Golfinho', 'Raposa', 
  'Panda', 'Girafa', 'Baleia', 'Leão', 'Esquilo', 
  'Lobo', 'Pinguim', 'Tartaruga', 'Falcão', 'Coala', 
  'Cervo', 'Arara', 'Castor', 'Foca', 'Tucano', 
  'Gazela', 'Colibri', 'Lince', 'Cisne', 'Cavalo', 
  'Guaxinim', 'Tigre', 'Elefante', 'Borboleta', 'Andorinha'
];

const ANON_DESCRIPTORS = [
  'Agradável', 'Alegre', 'Amável', 'Audaz', 'Benevolente',
  'Brilhante', 'Calmante', 'Capaz', 'Cativante', 'Confiante',
  'Confortável', 'Consciente', 'Constante', 'Cordial', 'Doce',
  'Elegante', 'Emocionante', 'Especial', 'Espetacular', 'Estável',
  'Excelente', 'Feliz', 'Fiel', 'Forte', 'Fraternal',
  'Gentil', 'Hábil', 'Humilde', 'Ilustre', 'Imparável',
  'Impecável', 'Incrível', 'Inteligente', 'Leal', 'Leve',
  'Livre', 'Marcante', 'Nobre', 'Notável', 'Otimista',
  'Paciente', 'Persistente', 'Presente', 'Prudente', 'Radiante',
  'Resiliente', 'Sensível', 'Singular', 'Suave', 'Valente'
];

export const getRandomAnonymousName = () => {
  const animal = ANON_ANIMALS[Math.floor(Math.random() * ANON_ANIMALS.length)];
  const descriptor = ANON_DESCRIPTORS[Math.floor(Math.random() * ANON_DESCRIPTORS.length)];
  return `${animal} ${descriptor}`;
};

interface CommunityContextType {
  posts: CommunityPost[];
  isLoading: boolean;
  hasMorePosts: boolean;
  isLoadingMore: boolean;
  loadMorePosts: () => Promise<void>;
  createPost: (payload: CreatePostPayload) => void;
  toggleReaction: (postId: string, reactionKey: string) => void;
  toggleCommentReaction: (postId: string, commentId: string, reactionKey: string) => void;
  addComment: (postId: string, content: string, isAnonymous?: boolean, customSensitivity?: ContentSensitivityResult) => { isFlagged: boolean; matchedWord?: string; flagType?: SensitivityFlagType };
  refreshPosts: () => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<CommunityPost[]>;
  reportContent: (contentType: 'post' | 'comment', contentId: string, postId: string | null, reason: string) => Promise<{ success: boolean; alreadyReported?: boolean }>;
  polls: CommunityPoll[];
  activePoll: CommunityPoll | null;
  userVotedPollsMap: Record<string, string>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  createPoll: (payload: NewPollPayload) => Promise<void>;
  togglePollStatus: (pollId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const sanitizePost = (post: CommunityPost): CommunityPost => {
  const isConfession = post.transversalRoomId === 'confessionario';
  if (!isConfession && post.isAnonymous) {
    const isAnonName = post.authorName.startsWith('Luz em Aprendizado');
    return {
      ...post,
      isAnonymous: false,
      authorName: isAnonName ? 'Mariana Santos' : post.authorName,
      authorAvatar: post.authorAvatar.includes('photo-1518020382113') 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
        : post.authorAvatar,
      comments: post.comments.map(c => ({
        ...c,
        isAnonymous: false,
        authorName: c.authorName.startsWith('Luz em Aprendizado') ? 'Camila Rodrigues' : c.authorName,
        authorAvatar: c.authorAvatar.includes('photo-1518020382113')
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
          : c.authorAvatar
      }))
    };
  }
  return post;
};

const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'poll-rotina-sono',
    title: 'Qual é o seu maior desafio na rotina noturna com os pequenos?',
    description: 'Sua resposta ajuda nossa curadoria a criar os próximos conteúdos e acolhimentos.',
    category: 'Sono & Rotina',
    options: [
      { id: 'opt-1', text: 'Resistência para ir para a cama e desacelerar', votesCount: 142 },
      { id: 'opt-2', text: 'Despertares noturnos múltiplos ou madrugada longa', votesCount: 98 },
      { id: 'opt-3', text: 'Minha própria exaustão e falta de paciência ao final do dia', votesCount: 184 },
      { id: 'opt-4', text: 'Dificuldade de manter consistência nos horários', votesCount: 65 }
    ],
    totalVotes: 489,
    status: 'open',
    createdAt: 'Hoje'
  }
];

// 🌟 Armazenamento persistente e isolado de reações comunitárias (à prova de recarregamento e offline)
const REACTIONS_STORAGE_KEY = 'elana_community_reactions_v2';

interface StoredReactionsData {
  posts: Record<string, Record<string, number>>;
  userReactions: Record<string, Record<string, Record<string, boolean>>>;
  comments: Record<string, Record<string, number>>;
  userCommentReactions: Record<string, Record<string, Record<string, boolean>>>;
}

const getStoredReactionsData = (): StoredReactionsData => {
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        posts: parsed.posts || {},
        userReactions: parsed.userReactions || {},
        comments: parsed.comments || {},
        userCommentReactions: parsed.userCommentReactions || {}
      };
    }
    // Migração de cache anterior se houver
    const oldCache = localStorage.getItem('elana_community_posts_cache');
    if (oldCache) {
      const parsedPosts = JSON.parse(oldCache);
      if (Array.isArray(parsedPosts)) {
        const initialStore: StoredReactionsData = {
          posts: {},
          userReactions: {},
          comments: {},
          userCommentReactions: {}
        };
        parsedPosts.forEach((p: any) => {
          if (p && p.id && p.reactions && Object.keys(p.reactions).length > 0) {
            initialStore.posts[p.id] = p.reactions;
          }
          if (p && p.id && p.userReactions && Object.keys(p.userReactions).length > 0) {
            initialStore.userReactions['anon'] = initialStore.userReactions['anon'] || {};
            initialStore.userReactions['anon'][p.id] = p.userReactions;
          }
        });
        localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(initialStore));
        return initialStore;
      }
    }
  } catch {}
  return { posts: {}, userReactions: {}, comments: {}, userCommentReactions: {} };
};

const saveStoredReactionsData = (data: StoredReactionsData) => {
  try {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const persistPostReaction = (
  postId: string,
  reactionKey: string,
  isActive: boolean,
  userKey: string,
  updatedReactions: Record<string, number>
) => {
  const store = getStoredReactionsData();
  store.posts[postId] = updatedReactions;
  if (!store.userReactions[userKey]) {
    store.userReactions[userKey] = {};
  }
  store.userReactions[userKey][postId] = isActive ? { [reactionKey]: true } : {};
  saveStoredReactionsData(store);
};

const persistCommentReaction = (
  commentId: string,
  reactionKey: string,
  isActive: boolean,
  userKey: string,
  updatedReactions: Record<string, number>
) => {
  const store = getStoredReactionsData();
  store.comments[commentId] = updatedReactions;
  if (!store.userCommentReactions[userKey]) {
    store.userCommentReactions[userKey] = {};
  }
  store.userCommentReactions[userKey][commentId] = isActive ? { [reactionKey]: true } : {};
  saveStoredReactionsData(store);
};

const PAGE_SIZE = 15;

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, awardBadge } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('elana_community_posts_cache') || localStorage.getItem('elana_community_posts');
      const reactionsStore = getStoredReactionsData();
      const userKey = user?.id || 'anon';
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar estritamente apenas posts criados por usuários registrados (com authorId válido e sem mock 'u-')
          const validPosts = parsed
            .filter(p => p && p.authorId && p.authorId.length > 20 && !p.authorId.startsWith('u-') && p.status !== 'removido_usuario')
            .map(p => {
              const sanitized = sanitizePost(p);
              const postReactions = reactionsStore.posts[sanitized.id] || sanitized.reactions || {};
              const userReactions = reactionsStore.userReactions[userKey]?.[sanitized.id] || sanitized.userReactions || {};
              const comments = (sanitized.comments || []).map(c => ({
                ...c,
                reactions: reactionsStore.comments[c.id] || c.reactions || {},
                userReactions: reactionsStore.userCommentReactions[userKey]?.[c.id] || c.userReactions || {}
              }));
              return {
                ...sanitized,
                reactions: postReactions,
                userReactions: userReactions,
                comments: comments
              };
            });
          if (validPosts.length !== parsed.length) {
            localStorage.setItem('elana_community_posts_cache', JSON.stringify(validPosts));
          }
          return validPosts;
        }
      }
    } catch {}
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Sincronizar posts no cache local
  useEffect(() => {
    if (posts.length > 0) {
      try {
        localStorage.setItem('elana_community_posts_cache', JSON.stringify(posts));
      } catch {}
    }
  }, [posts]);

  // 🗳️ Enquetes da Comunidade ("Sua Voz Importa")
  const [polls, setPolls] = useState<CommunityPoll[]>(INITIAL_POLLS);
  const [activePoll, setActivePoll] = useState<CommunityPoll | null>(INITIAL_POLLS[0]);
  const [userVotedPollsMap, setUserVotedPollsMap] = useState<Record<string, string>>({});

  const parsePollOptions = (raw: any) => {
    if (!raw) return [];
    let opts = raw;
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(opts)) return [];
    return opts.map((opt: any, idx: number) => {
      if (typeof opt === 'string') {
        return { id: `opt-${idx + 1}`, text: opt, votesCount: 0 };
      }
      return {
        id: opt?.id || `opt-${idx + 1}`,
        text: opt?.text || '',
        votesCount: Number(opt?.votesCount || 0)
      };
    });
  };

  const mapPostFromDb = (item: any): CommunityPost => {
    const localSensitivity = checkContentSensitivity(`${item.title || ''} ${item.content || ''}`);
    const isUnderMod = item.category === 'sob_moderacao' || item.status === 'sob_moderacao' || localSensitivity.isFlagged;
    const isRemoved = item.status === 'removido_usuario' || item.category === 'removido_usuario';
    const postStatus: 'sob_moderacao' | 'aprovado' | 'removido_usuario' = 
      isRemoved 
        ? 'removido_usuario' 
        : (isUnderMod ? 'sob_moderacao' : 'aprovado');

    const rawComments = Array.isArray(item.community_comments)
      ? item.community_comments
      : (Array.isArray(item.comments) ? item.comments : []);

    const mappedComments: CommunityComment[] = rawComments.map((c: any) => {
      const commentSensitivity = checkContentSensitivity(c.content || '');
      const commentStatus = c.status === 'sob_moderacao' || commentSensitivity.isFlagged ? 'sob_moderacao' : (c.status || 'aprovado');
      if (c.authorRole && c.status) {
        return {
          ...c,
          status: commentStatus as const
        };
      }
      return {
        id: c.id,
        authorId: c.author_id || c.authorId || 'unknown',
        authorName: c.author_name || c.authorName || 'Membro',
        authorAvatar: c.author_avatar || c.authorAvatar || '',
        authorRole: 'membro' as const,
        content: c.content || '',
        createdAt: c.created_at
          ? new Date(c.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : (c.createdAt || 'Agora'),
        isAnonymous: !!c.is_anonymous || !!c.isAnonymous,
        status: commentStatus as const,
        reactions: c.reactions && typeof c.reactions === 'object' ? c.reactions : {},
        userReactions: c.userReactions && typeof c.userReactions === 'object' ? c.userReactions : {}
      };
    });

    return {
      id: item.id,
      journeyId: item.journey_id,
      transversalRoomId: item.transversal_room_id,
      ageBracketId: item.age_bracket_id,
      emotionalIntention: item.emotional_intention,
      authorId: item.author_id || 'demo-user',
      authorName: item.author_name || 'Membro da Comunidade',
      authorAvatar: item.author_avatar || '',
      authorRole: 'membro',
      isAnonymous: !!item.is_anonymous,
      sensitivityLevel: localSensitivity.type === 'vulnerabilidade' || item.journey_id === 'depois-do-silencio' || item.transversal_room_id === 'confessionario' ? 'critico' : 'padrao',
      status: postStatus,
      flagReason: localSensitivity.flagReason,
      flagType: localSensitivity.type,
      title: item.title || '',
      content: item.content || '',
      createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora',
      reactions: item.reactions && typeof item.reactions === 'object' ? item.reactions : {},
      userReactions: {},
      comments: mappedComments
    };
  };

  const fetchSupabasePosts = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. Tentar buscar reações do Supabase se a tabela existir
      const remoteReactionsByPost: Record<string, Record<string, number>> = {};
      const remoteUserReactionsByPost: Record<string, Record<string, boolean>> = {};

      try {
        const { data: reactionsData, error: reactError } = await supabase
          .from('community_reactions')
          .select('post_id, user_id, reaction_key');

        if (reactionsData && !reactError) {
          reactionsData.forEach((r: any) => {
            if (!r.post_id || !r.reaction_key) return;
            if (!remoteReactionsByPost[r.post_id]) {
              remoteReactionsByPost[r.post_id] = {};
            }
            remoteReactionsByPost[r.post_id][r.reaction_key] = 
              (remoteReactionsByPost[r.post_id][r.reaction_key] || 0) + 1;

            if (user?.id && r.user_id === user.id) {
              if (!remoteUserReactionsByPost[r.post_id]) {
                remoteUserReactionsByPost[r.post_id] = {};
              }
              remoteUserReactionsByPost[r.post_id][r.reaction_key] = true;
            }
          });
        }
      } catch {
        // Silencioso se a tabela ainda não foi criada no Supabase
      }

      // 2. Buscar posts e comentários
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .not('author_id', 'is', null)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) {
        console.warn('Supabase fetch notice:', error.message);
        return;
      }

      if (data) {
        const remotePosts: CommunityPost[] = data
          .filter(p => p.author_id && p.author_id.length > 20 && !p.author_id.startsWith('u-'))
          .map(mapPostFromDb)
          .filter(p => p.status !== 'removido_usuario');

        const stored = getStoredReactionsData();
        const userKey = user?.id || 'anon';

        setPosts(prev => {
          const remoteIds = new Set(remotePosts.map(p => p.id));
          // Preserva APENAS posts locais do usuário registrado atual que ainda não sincronizaram (descarta qualquer post dummy anterior)
          const localOnly = prev.filter(p => 
            !remoteIds.has(p.id) && 
            user?.id && 
            p.authorId === user.id && 
            p.status !== 'removido_usuario'
          );

          // Mescla comentários de posts locais com comentários remotos e PRESERVA reações
          const mergedRemote = remotePosts.map(rPost => {
            const localPost = prev.find(p => p.id === rPost.id);

            // Reações: prioridade Supabase > localPost em memória > stored persistente > rPost
            const mergedReactions: Record<string, number> = {
              ...(stored.posts[rPost.id] || {}),
              ...(localPost?.reactions || {}),
              ...(rPost.reactions || {})
            };
            if (remoteReactionsByPost[rPost.id]) {
              Object.assign(mergedReactions, remoteReactionsByPost[rPost.id]);
            }

            const mergedUserReactions: Record<string, boolean> = {
              ...(stored.userReactions[userKey]?.[rPost.id] || {}),
              ...(localPost?.userReactions || {}),
              ...(remoteUserReactionsByPost[rPost.id] || {})
            };

            const rComments = rPost.comments || [];
            const rCommentIds = new Set(rComments.map(c => c.id));
            const extraLocalComments = (localPost?.comments || []).filter(c => 
              !rCommentIds.has(c.id) && 
              c.authorId && 
              !c.authorId.startsWith('u-')
            );

            const mergedComments = [...rComments, ...extraLocalComments].map(c => {
              const localComment = localPost?.comments?.find(lc => lc.id === c.id);
              return {
                ...c,
                reactions: {
                  ...(stored.comments[c.id] || {}),
                  ...(localComment?.reactions || {}),
                  ...(c.reactions || {})
                },
                userReactions: {
                  ...(stored.userCommentReactions[userKey]?.[c.id] || {}),
                  ...(localComment?.userReactions || {}),
                  ...(c.userReactions || {})
                }
              };
            });

            return {
              ...rPost,
              reactions: mergedReactions,
              userReactions: mergedUserReactions,
              comments: mergedComments
            };
          });

          return [...localOnly, ...mergedRemote].map(sanitizePost);
        });
        setHasMorePosts(data.length >= PAGE_SIZE);
      }
    } catch (err) {
      console.warn('Supabase connection fallback to local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts) return;
    setIsLoadingMore(true);
    try {
      const from = posts.length;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .not('author_id', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.warn('Supabase load more notice:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const stored = getStoredReactionsData();
        const userKey = user?.id || 'anon';
        const newPosts: CommunityPost[] = data
          .filter(p => p.author_id && p.author_id.length > 20 && !p.author_id.startsWith('u-'))
          .map(mapPostFromDb)
          .filter(p => p.status !== 'removido_usuario')
          .map(p => ({
            ...p,
            reactions: {
              ...(stored.posts[p.id] || {}),
              ...(p.reactions || {})
            },
            userReactions: {
              ...(stored.userReactions[userKey]?.[p.id] || {}),
              ...(p.userReactions || {})
            },
            comments: (p.comments || []).map(c => ({
              ...c,
              reactions: {
                ...(stored.comments[c.id] || {}),
                ...(c.reactions || {})
              },
              userReactions: {
                ...(stored.userCommentReactions[userKey]?.[c.id] || {}),
                ...(c.userReactions || {})
              }
            }))
          }));

        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filtered].map(sanitizePost);
        });
        if (data.length < PAGE_SIZE) {
          setHasMorePosts(false);
        }
      } else {
        setHasMorePosts(false);
      }
    } catch (err) {
      console.warn('Error loading more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Carregar enquetes e votos locais/remotos
  useEffect(() => {
    const userKey = user?.id || 'anon';
    try {
      const stored = localStorage.getItem(`elana_poll_votes_${userKey}`);
      if (stored) {
        setUserVotedPollsMap(JSON.parse(stored));
      }
    } catch {}

    supabase
      .from('community_polls')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const remotePolls: CommunityPoll[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            options: parsePollOptions(item.options),
            totalVotes: item.total_votes || 0,
            status: item.status || 'open',
            createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Hoje'
          }));
          setPolls(remotePolls);
          const openPoll = remotePolls.find(p => p.status === 'open');
          if (openPoll) setActivePoll(openPoll);
        }
      });
  }, [user?.id]);

  // Fetch posts from Supabase on mount
  useEffect(() => {
    fetchSupabasePosts(true);
  }, []);

  // Re-hidratar reações ativas do usuário quando o perfil mudar
  useEffect(() => {
    const stored = getStoredReactionsData();
    const userKey = user?.id || 'anon';
    setPosts(prev => prev.map(p => {
      const activeUserReactions = stored.userReactions[userKey]?.[p.id] || {};
      return {
        ...p,
        userReactions: activeUserReactions,
        comments: (p.comments || []).map(c => ({
          ...c,
          userReactions: stored.userCommentReactions?.[userKey]?.[c.id] || {}
        }))
      };
    }));
  }, [user?.id]);

  const refreshPosts = async () => {
    await fetchSupabasePosts(false);
  };

  // 🏆 Sincronização Retroativa de Conquistas de Salas da Comunidade
  useEffect(() => {
    if (!user?.id || posts.length === 0) return;
    const userPosts = posts.filter(p => p.authorId === user.id || (!p.isAnonymous && p.authorName === user.name));
    if (userPosts.length > 0) {
      awardBadge('b29'); // Voz de Coragem
      let totalReactions = 0;
      userPosts.forEach(p => {
        const room = p.transversalRoomId;
        if (p.isAnonymous || room === 'confessionario') {
          awardBadge('b30');
        }
        if (room === 'cantinho-mel' || room === 'cantinho-da-mel' || room === 'trocas-livres') {
          awardBadge('b31');
        }
        if (room === 'espaco-dois') {
          awardBadge('b32');
        }
        if (room === 'cuidando-quem-cuida' || room === 'cuidando-de-quem-cuida') {
          awardBadge('b33');
        }
        if (p.reactions && typeof p.reactions === 'object') {
          Object.values(p.reactions).forEach(count => {
            if (typeof count === 'number') totalReactions += count;
          });
        }
      });

      // 💖 Conquistas por Reações Recebidas (b48 a b53)
      if (totalReactions >= 1) awardBadge('b48');
      if (totalReactions >= 50) awardBadge('b49');
      if (totalReactions >= 250) awardBadge('b50');
      if (totalReactions >= 500) awardBadge('b51');
      if (totalReactions >= 1000) awardBadge('b52');
      if (totalReactions >= 2500) awardBadge('b53');
    }
  }, [user?.id, user?.name, posts]);

  // Supabase Realtime: live posts, reactions, comments and polls via WebSockets
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const item = payload.new;
          if (!item) return;
          if (item.status === 'removido_usuario' || item.category === 'removido_usuario') return;
          const newPost = mapPostFromDb(item);
          if (newPost.status === 'removido_usuario') return;
          setPosts(prev => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [sanitizePost(newPost), ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const updated = payload.new;
          if (!updated) return;
          if (updated.status === 'removido_usuario' || updated.category === 'removido_usuario') {
            setPosts(prev => prev.filter(p => p.id !== updated.id));
            return;
          }
          setPosts(prev => prev.map(p => {
            if (p.id === updated.id) {
              return {
                ...p,
                reactions: updated.reactions || p.reactions,
                title: updated.title,
                content: updated.content,
                status: (updated.category || updated.status || p.status) as any,
                sensitivityLevel: updated.category === 'sob_moderacao' ? 'critico' : p.sensitivityLevel
              };
            }
            return p;
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const oldItem = payload.old;
          if (!oldItem || !oldItem.id) return;
          setPosts(prev => prev.filter(p => p.id !== oldItem.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_comments' },
        (payload: any) => {
          const item = payload.new;
          if (!item || !item.post_id) return;
          const newComment: CommunityComment = {
            id: item.id || `rt-comment-${Date.now()}`,
            authorId: item.author_id || 'unknown',
            authorName: item.author_name || 'Membro',
            authorAvatar: item.author_avatar || '',
            authorRole: 'membro',
            content: item.content,
            createdAt: new Date(item.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isAnonymous: item.is_anonymous || false,
            status: 'aprovado',
            reactions: {},
            userReactions: {}
          };
          setPosts(prev => prev.map(post => {
            if (post.id === item.post_id) {
              // Avoid duplicate comments
              if (post.comments.some(c => c.id === newComment.id)) return post;
              return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_polls' },
        (payload: any) => {
          if (payload.new) {
            const remotePoll: CommunityPoll = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description,
              category: payload.new.category,
              options: parsePollOptions(payload.new.options),
              totalVotes: payload.new.total_votes || 0,
              status: payload.new.status || 'open',
              createdAt: payload.new.created_at ? new Date(payload.new.created_at).toLocaleDateString('pt-BR') : 'Hoje'
            };
            setPolls(prev => {
              const existingIdx = prev.findIndex(p => p.id === remotePoll.id);
              if (existingIdx >= 0) {
                const copy = [...prev];
                copy[existingIdx] = remotePoll;
                return copy;
              }
              return [remotePoll, ...prev];
            });
            if (remotePoll.status === 'open') {
              setActivePoll(remotePoll);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  const createPost = (payload: CreatePostPayload) => {
    if (!user) return;

    const sensitivityCheck = payload.sensitivityCheck || checkContentSensitivity(`${payload.title} ${payload.content}`);

    let sensitivity: SensitivityLevel = 'padrao';
    if (sensitivityCheck.type === 'vulnerabilidade') {
      sensitivity = 'critico';
    } else if (payload.journeyId === 'singular' || payload.journeyId === 'amor-escolhido' || payload.transversalRoomId === 'espaco-dois') {
      sensitivity = 'elevado';
    } else if (payload.journeyId === 'depois-do-silencio' || payload.transversalRoomId === 'confessionario') {
      sensitivity = 'critico';
    }

    const isConfessionRoom = payload.transversalRoomId === 'confessionario';
    const isAnonymous = isConfessionRoom;

    const authorName = isAnonymous ? getRandomAnonymousName() : user.name;
    const authorAvatar = isAnonymous 
      ? 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80' 
      : user.avatar;

    const postStatus: 'sob_moderacao' | 'aprovado' = sensitivityCheck.isFlagged ? 'sob_moderacao' : 'aprovado';

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      journeyId: payload.journeyId,
      transversalRoomId: payload.transversalRoomId,
      ageBracketId: payload.ageBracketId,
      emotionalIntention: payload.emotionalIntention,
      moduleTopic: payload.moduleTopic,
      authorId: user.id,
      authorName,
      authorAvatar,
      authorRole: 'membro',
      isAnonymous,
      sensitivityLevel: sensitivity,
      status: postStatus,
      flagReason: sensitivityCheck.flagReason,
      flagType: sensitivityCheck.type,
      title: payload.title,
      content: payload.content,
      createdAt: 'Agora mesmo',
      reactions: {},
      userReactions: {},
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);

    // Persist asynchronously into Supabase database
    supabase
      .from('community_posts')
      .insert([{
        author_id: user?.id || null,
        title: payload.title,
        content: payload.content,
        category: postStatus,
        author_name: authorName,
        author_avatar: authorAvatar,
        journey_id: payload.journeyId || null,
        transversal_room_id: payload.transversalRoomId || null,
        age_bracket_id: payload.ageBracketId || null,
        emotional_intention: payload.emotionalIntention || null,
        is_anonymous: isAnonymous
      }])
      .select('id')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase post insert notice:', error.message);
        } else if (data?.id) {
          console.log('✅ Post salvo com sucesso no Supabase com ID:', data.id);
          setPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, id: data.id } : p));
        }
      });

    // 🏆 Conquistas de Postagem na Comunidade:
    awardBadge('b29'); // Voz de Coragem (1º post)
    if (isAnonymous || payload.transversalRoomId === 'confessionario') {
      awardBadge('b30'); // Confissão Liberta
      const confKey = `elana_confession_count_${user?.id || 'anon'}`;
      const confCount = parseInt(localStorage.getItem(confKey) || '0', 10) + 1;
      localStorage.setItem(confKey, confCount.toString());
      if (confCount >= 5) {
        awardBadge('b67'); // Desabafo Necessário (5 confissões)
      }
    }
    if (payload.transversalRoomId === 'cantinho-mel' || payload.transversalRoomId === 'cantinho-da-mel' || payload.transversalRoomId === 'trocas-livres') {
      awardBadge('b31'); // Roda de Conversa
    }
    if (payload.transversalRoomId === 'espaco-dois') {
      awardBadge('b32'); // Ponte a Dois
    }
    if (payload.transversalRoomId === 'cuidando-quem-cuida' || payload.transversalRoomId === 'cuidando-de-quem-cuida') {
      awardBadge('b33'); // Máscara de Oxigênio
    }

    // Checar se participou dos 3 subtópicos emocionais para b34 (Explorador da Comunidade)
    if (payload.emotionalIntention) {
      const key = `elana_intentions_participated_${user?.id || 'anon'}`;
      try {
        const raw = localStorage.getItem(key);
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.add(payload.emotionalIntention);
        localStorage.setItem(key, JSON.stringify(Array.from(set)));
        if (set.has('ajuda') && set.has('celebrar') && set.has('desabafar')) {
          awardBadge('b34');
        }
      } catch {}
    }

    // Checar se completou as 4 salas para b34 (Explorador da Comunidade)
    const currentBadges = new Set((user?.badges || []).map(b => b.id));
    if (isAnonymous || payload.transversalRoomId === 'confessionario') currentBadges.add('b30');
    if (payload.transversalRoomId === 'cantinho-mel' || payload.transversalRoomId === 'cantinho-da-mel' || payload.transversalRoomId === 'trocas-livres') currentBadges.add('b31');
    if (payload.transversalRoomId === 'espaco-dois') currentBadges.add('b32');
    if (payload.transversalRoomId === 'cuidando-quem-cuida' || payload.transversalRoomId === 'cuidando-de-quem-cuida') currentBadges.add('b33');
    if (currentBadges.has('b30') && currentBadges.has('b31') && currentBadges.has('b32') && currentBadges.has('b33')) {
      awardBadge('b34');
    }
  };

  const toggleReaction = (postId: string, reactionKey: string) => {
    // 🏆 Conquista: Acolhimento Pleno (usou reações)
    awardBadge('b35');

    const targetPost = posts.find(p => p.id === postId);
    if (targetPost?.transversalRoomId) {
      const room = targetPost.transversalRoomId;
      if (room === 'confessionario') awardBadge('b30');
      if (room === 'cantinho-mel' || room === 'cantinho-da-mel' || room === 'trocas-livres') awardBadge('b31');
      if (room === 'espaco-dois') awardBadge('b32');
      if (room === 'cuidando-quem-cuida' || room === 'cuidando-de-quem-cuida') awardBadge('b33');
    }

    if (targetPost?.isAnonymous || targetPost?.transversalRoomId === 'confessionario') {
      const confReactKey = `elana_confession_reactions_${user?.id || 'anon'}`;
      const confReactCount = parseInt(localStorage.getItem(confReactKey) || '0', 10) + 1;
      localStorage.setItem(confReactKey, confReactCount.toString());
      if (confReactCount >= 10) {
        awardBadge('b68'); // Abraço Invisível (10 apoios no confessionário)
      }
    }

    let isNowActive = false;
    let nextPostReactions: Record<string, number> = {};
    let nextUserReactions: Record<string, boolean> = {};

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentUserReactions = post.userReactions || {};
        const isAlreadyReacted = !!currentUserReactions[reactionKey];

        const updatedReactions = { ...post.reactions };
        const updatedUserReactions: Record<string, boolean> = {};

        // Remove any previous reaction the user had on this post
        Object.keys(currentUserReactions).forEach(key => {
          if (currentUserReactions[key]) {
            updatedReactions[key] = Math.max(0, (updatedReactions[key] || 0) - 1);
          }
        });

        // If clicking a new reaction, set it active (if clicking existing reaction, it was removed above)
        if (!isAlreadyReacted) {
          updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
          updatedUserReactions[reactionKey] = true;
          isNowActive = true;
        }

        nextPostReactions = updatedReactions;
        nextUserReactions = updatedUserReactions;

        return {
          ...post,
          reactions: updatedReactions,
          userReactions: updatedUserReactions
        };
      }
      return post;
    }));

    // 💾 Salvar IMEDIATAMENTE no armazenamento persistente de reações (à prova de recarregamento)
    const userKey = user?.id || 'anon';
    persistPostReaction(postId, reactionKey, isNowActive, userKey, nextPostReactions);

    // Sincronizar com o Supabase de forma assíncrona
    if (postId.length > 20) {
      // 1. Atualizar o contador total de acolhimentos no post (likes_count)
      const totalCount = Object.values(nextPostReactions).reduce((a, b) => a + b, 0);
      supabase
        .from('community_posts')
        .update({ likes_count: totalCount })
        .eq('id', postId)
        .then(({ error }) => {
          if (error) console.warn('Supabase post likes_count notice:', error.message);
        });

      // 2. Sincronizar na tabela individual de reações se houver usuário
      if (user?.id) {
        if (isNowActive) {
          supabase
            .from('community_reactions')
            .upsert({
              post_id: postId,
              user_id: user.id,
              reaction_key: reactionKey
            }, { onConflict: 'post_id,user_id' })
            .then(({ error }) => {
              if (error) console.warn('Supabase reaction notice:', error.message);
            });
        } else {
          supabase
            .from('community_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.warn('Supabase reaction notice:', error.message);
            });
        }
      }
    }
  };

  const toggleCommentReaction = (postId: string, commentId: string, reactionKey: string) => {
    let isNowActive = false;
    let nextCommentReactions: Record<string, number> = {};

    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.comments) {
        const updatedComments = post.comments.map(c => {
          if (c.id === commentId) {
            const currentUserReactions = c.userReactions || {};
            const isAlreadyReacted = !!currentUserReactions[reactionKey];

            const updatedReactions = { ...(c.reactions || {}) };
            const updatedUserReactions: Record<string, boolean> = {};

            // Remove any previous reaction the user had on this comment
            Object.keys(currentUserReactions).forEach(key => {
              if (currentUserReactions[key]) {
                updatedReactions[key] = Math.max(0, (updatedReactions[key] || 0) - 1);
              }
            });

            // If clicking a new reaction, set it active
            if (!isAlreadyReacted) {
              updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
              updatedUserReactions[reactionKey] = true;
              isNowActive = true;
            }

            nextCommentReactions = updatedReactions;

            return {
              ...c,
              reactions: updatedReactions,
              userReactions: updatedUserReactions
            };
          }
          return c;
        });

        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    }));

    // 💾 Salvar IMEDIATAMENTE no armazenamento persistente de comentários
    const userKey = user?.id || 'anon';
    persistCommentReaction(commentId, reactionKey, isNowActive, userKey, nextCommentReactions);

    // Sincronizar contador de likes no comentário no Supabase se UUID válido
    if (commentId.length > 20) {
      const totalCount = Object.values(nextCommentReactions).reduce((a, b) => a + b, 0);
      supabase
        .from('community_comments')
        .update({ likes_count: totalCount })
        .eq('id', commentId)
        .then(({ error }) => {
          if (error) console.warn('Supabase comment likes_count notice:', error.message);
        });
    }
  };

  const addComment = (
    postId: string, 
    content: string, 
    isAnonymousInput?: boolean,
    customSensitivity?: ContentSensitivityResult
  ): { isFlagged: boolean; matchedWord?: string; flagType?: SensitivityFlagType } => {
    if (!user) return { isFlagged: false };

    const sensitivity = customSensitivity || checkContentSensitivity(content);
    const isFlagged = sensitivity.isFlagged;
    const matchedWord = sensitivity.matchedWord;
    const flagType = sensitivity.type;
    const commentStatus = isFlagged ? ('sob_moderacao' as const) : ('aprovado' as const);

    const isConfession = posts.find(p => p.id === postId)?.transversalRoomId === 'confessionario';
    const isAnon = isConfession ? !!isAnonymousInput : false;

    const authorName = isAnon ? getRandomAnonymousName() : user.name;
    const authorAvatar = isAnon 
      ? 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80' 
      : user.avatar;

    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName,
      authorAvatar,
      authorRole: 'membro' as const,
      content,
      createdAt: 'Agora mesmo',
      isAnonymous: isAnon,
      status: commentStatus,
      reactions: {},
      userReactions: {}
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    // Persist comment asynchronously into Supabase with appropriate status
    supabase
      .from('community_comments')
      .insert([{
        post_id: (postId.includes('-') && postId.length > 20) ? postId : null,
        author_id: user?.id || null,
        author_name: authorName,
        author_avatar: authorAvatar,
        content: content,
        is_anonymous: isAnon,
        status: commentStatus
      }])
      .select('id')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase comment notice:', error.message);
        } else if (data?.id) {
          console.log('✅ Comentário salvo com sucesso no Supabase com ID:', data.id);
          setPosts(prev => prev.map(p => {
            if (p.id === postId && p.comments) {
              return {
                ...p,
                comments: p.comments.map(c => c.id === newComment.id ? { ...c, id: data.id } : c)
              };
            }
            return p;
          }));
        }
      });

    if (!isFlagged) {
      // 🏆 Conquistas de Comentários / Rede de Apoio:
      awardBadge('b36'); // Primeiro Acolhimento

      // 🏆 Conquistas por sala de apoio ou subtópico de acolhimento (ao comentar no post):
      const parentPost = posts.find(p => p.id === postId);
      if (parentPost) {
        // Checar se é o primeiro a responder neste post (0 comentários antes)
        const isFirst = !parentPost.comments || parentPost.comments.length === 0;
        if (isFirst) {
          awardBadge('b65'); // Primeiro Abraço (1º a responder)
          const firstRespKey = `elana_first_responder_count_${user.id}`;
          const firstRespCount = parseInt(localStorage.getItem(firstRespKey) || '0', 10) + 1;
          localStorage.setItem(firstRespKey, firstRespCount.toString());
          if (firstRespCount >= 5) {
            awardBadge('b66'); // Ninguém Fica Sozinho (5 posts acolhidos)
          }
        }
        if (parentPost.emotionalIntention) {
          const key = `elana_intentions_participated_${user.id}`;
          try {
            const raw = localStorage.getItem(key);
            const set = new Set(raw ? JSON.parse(raw) : []);
            set.add(parentPost.emotionalIntention);
            localStorage.setItem(key, JSON.stringify(Array.from(set)));
            if (set.has('ajuda') && set.has('celebrar') && set.has('desabafar')) {
              awardBadge('b34'); // Explorador da Comunidade
            }
          } catch {}
        }

        if (parentPost.transversalRoomId) {
          const room = parentPost.transversalRoomId;
          if (room === 'confessionario') awardBadge('b30');
          if (room === 'cantinho-mel' || room === 'cantinho-da-mel' || room === 'trocas-livres') awardBadge('b31');
          if (room === 'espaco-dois') awardBadge('b32');
          if (room === 'cuidando-quem-cuida' || room === 'cuidando-de-quem-cuida') awardBadge('b33');

          const currentBadges = new Set((user?.badges || []).map(b => b.id));
          if (room === 'confessionario') currentBadges.add('b30');
          if (room === 'cantinho-mel' || room === 'cantinho-da-mel' || room === 'trocas-livres') currentBadges.add('b31');
          if (room === 'espaco-dois') currentBadges.add('b32');
          if (room === 'cuidando-quem-cuida' || room === 'cuidando-de-quem-cuida') currentBadges.add('b33');
          if (currentBadges.has('b30') && currentBadges.has('b31') && currentBadges.has('b32') && currentBadges.has('b33')) {
            awardBadge('b34');
          }
        }
      }

      supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .then(({ count }) => {
          const total = (count || 0) + 1;
          if (total >= 500) awardBadge('b41');
          else if (total >= 250) awardBadge('b40');
          else if (total >= 100) awardBadge('b39');
          else if (total >= 25) awardBadge('b38');
          else if (total >= 5) awardBadge('b37');
        });
    }

    return { isFlagged, matchedWord, flagType };
  };

  const votePoll = async (pollId: string, optionId: string) => {
    const userKey = user?.id || 'anon';
    if (userVotedPollsMap[pollId]) return;

    const nextVotedMap = { ...userVotedPollsMap, [pollId]: optionId };
    setUserVotedPollsMap(nextVotedMap);
    try {
      localStorage.setItem(`elana_poll_votes_${userKey}`, JSON.stringify(nextVotedMap));
    } catch {}

    let updatedPollObj: CommunityPoll | null = null;
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votesCount: opt.votesCount + 1 };
          }
          return opt;
        });
        const total = poll.totalVotes + 1;
        const updated = {
          ...poll,
          options: updatedOptions,
          totalVotes: total,
          userVotedOptionId: optionId
        };
        updatedPollObj = updated;
        return updated;
      }
      return poll;
    }));

    if (activePoll && activePoll.id === pollId && updatedPollObj) {
      setActivePoll(updatedPollObj);
    }

    if (updatedPollObj && pollId.length > 20) {
      try {
        await supabase
          .from('community_polls')
          .update({
            options: (updatedPollObj as CommunityPoll).options,
            total_votes: (updatedPollObj as CommunityPoll).totalVotes
          })
          .eq('id', pollId);
      } catch (err) {
        console.warn('Supabase poll vote notice:', err);
      }
    }

    // 🏆 Conquistas da categoria "Sua Voz Importa" (sem pontos diretos, apenas desbloqueio de badges):
    awardBadge('b42'); // Primeiro Palpite (1º voto em enquete)
    const votedCount = Object.keys(nextVotedMap).length;
    if (votedCount >= 100) awardBadge('b47');
    else if (votedCount >= 50) awardBadge('b46');
    else if (votedCount >= 25) awardBadge('b45');
    else if (votedCount >= 10) awardBadge('b44');
    else if (votedCount >= 5) awardBadge('b43');
  };

  const createPoll = async (payload: NewPollPayload) => {
    const newPoll: CommunityPoll = {
      id: `poll-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category || '',
      isMultiSelect: payload.isMultiSelect || false,
      options: payload.options.map((text, i) => ({
        id: `opt-${i + 1}`,
        text: text.trim(),
        votesCount: 0
      })),
      totalVotes: 0,
      status: 'open',
      createdAt: 'Agora mesmo'
    };

    setPolls(prev => [newPoll, ...prev]);
    setActivePoll(newPoll);

    try {
      const { data } = await supabase
        .from('community_polls')
        .insert([{
          title: newPoll.title,
          description: newPoll.description,
          category: newPoll.category,
          options: newPoll.options,
          total_votes: 0,
          status: 'open'
        }])
        .select();

      if (data && data[0]) {
        newPoll.id = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase create poll notice:', err);
    }
  };

  const togglePollStatus = async (pollId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const nextStatus = poll.status === 'open' ? 'closed' : 'open';
        return { ...poll, status: nextStatus };
      }
      return poll;
    }));

    if (activePoll && activePoll.id === pollId) {
      setActivePoll(prev => prev ? { ...prev, status: prev.status === 'open' ? 'closed' : 'open' } : null);
    }

    if (pollId.length > 20) {
      try {
        const current = polls.find(p => p.id === pollId);
        const nextStatus = current?.status === 'open' ? 'closed' : 'open';
        await supabase
          .from('community_polls')
          .update({ status: nextStatus })
          .eq('id', pollId);
      } catch {}
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    // 1. Otimista: remove do estado local imediatamente
    setPosts(prev => prev.filter(p => p.id !== postId));

    // 2. Soft delete no Supabase: atualiza category para 'removido_usuario' (coluna garantida de existir)
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ category: 'removido_usuario' })
        .eq('id', postId);

      if (error) {
        console.warn('Erro ao atualizar status do post para removido_usuario no Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Exceção ao excluir post no Supabase:', err);
    }
  };

  const deleteComment = async (postId: string, commentId: string): Promise<void> => {
    // 1. Otimista: remove do post local imediatamente
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.comments) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    }));

    // 2. Limpar reações armazenadas desse comentário se houver
    try {
      const store = getStoredReactionsData();
      if (store.comments && store.comments[commentId]) {
        delete store.comments[commentId];
        saveStoredReactionsData(store);
      }
    } catch {}

    // 3. Excluir no Supabase
    try {
      if (commentId && commentId.length > 20) {
        const { error } = await supabase
          .from('community_comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          console.warn('Erro ao excluir comentário no Supabase:', error.message);
        }
      }
    } catch (err) {
      console.warn('Exceção ao excluir comentário no Supabase:', err);
    }
  };

  const fetchUserPosts = async (userId: string): Promise<CommunityPost[]> => {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar posts do usuário no Supabase:', error.message);
        return posts.filter(p => p.authorId === userId && p.status !== 'removido_usuario');
      }

      if (data) {
        const remoteUserPosts = data
          .filter(p => p.author_id && p.author_id.length > 20 && !p.author_id.startsWith('u-'))
          .map(mapPostFromDb)
          .filter(p => p.status !== 'removido_usuario')
          .map(sanitizePost);

        // Também preserva posts locais do usuário que ainda não sincronizaram
        const remoteIds = new Set(remoteUserPosts.map(p => p.id));
        const localUserPosts = posts.filter(p => 
          p.authorId === userId && 
          p.status !== 'removido_usuario' && 
          !remoteIds.has(p.id)
        );

        return [...localUserPosts, ...remoteUserPosts];
      }
      return posts.filter(p => p.authorId === userId && p.status !== 'removido_usuario');
    } catch (err) {
      console.warn('Exceção ao buscar posts do usuário:', err);
      return posts.filter(p => p.authorId === userId && p.status !== 'removido_usuario');
    }
  };

  // ─── Auto-moderação: denúncia de conteúdo pelos usuários ───────────────────
  const REPORT_THRESHOLD = 3; // denúncias para ocultar automaticamente

  const reportContent = async (
    contentType: 'post' | 'comment',
    contentId: string,
    postId: string | null,
    reason: string
  ): Promise<{ success: boolean; alreadyReported?: boolean }> => {
    if (!user) return { success: false };

    try {
      // 1. Inserir denúncia (UNIQUE constraint previne duplicata do mesmo usuário)
      const { error: insertError } = await supabase
        .from('community_reports')
        .insert({
          reporter_id: user.id,
          content_type: contentType,
          content_id: contentId,
          reason
        });

      if (insertError) {
        // Código 23505 = violação de UNIQUE → usuário já reportou este conteúdo
        if (insertError.code === '23505') {
          return { success: false, alreadyReported: true };
        }
        console.warn('[reportContent] Erro ao inserir denúncia:', insertError);
        return { success: false };
      }

      // 2. Incrementar report_count (read-modify-write)
      const table = contentType === 'post' ? 'community_posts' : 'community_comments';

      const { data: current } = await supabase
        .from(table)
        .select('report_count, status')
        .eq('id', contentId)
        .single();

      if (current) {
        const newCount = (current.report_count || 0) + 1;
        const shouldFlag = newCount >= REPORT_THRESHOLD && current.status !== 'sob_moderacao';

        await supabase
          .from(table)
          .update({
            report_count: newCount,
            ...(shouldFlag ? { status: 'sob_moderacao' } : {})
          })
          .eq('id', contentId);

        // 3. Atualizar estado local imediatamente
        if (contentType === 'post') {
          setPosts(prev => prev.map(p => {
            if (p.id !== contentId) return p;
            return {
              ...p,
              reportCount: newCount,
              status: shouldFlag ? 'sob_moderacao' : p.status
            };
          }));
        } else if (contentType === 'comment' && postId) {
          setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map(c => {
                if (c.id !== contentId) return c;
                return {
                  ...c,
                  reportCount: newCount,
                  status: shouldFlag ? 'sob_moderacao' : c.status
                };
              })
            };
          }));
        }
      }

      return { success: true };
    } catch (err) {
      console.warn('[reportContent] Erro inesperado:', err);
      return { success: false };
    }
  };

  return (
    <CommunityContext.Provider value={{
      posts,
      isLoading,
      hasMorePosts,
      isLoadingMore,
      loadMorePosts,
      createPost,
      toggleReaction,
      toggleCommentReaction,
      addComment,
      refreshPosts,
      deletePost,
      deleteComment,
      fetchUserPosts,
      reportContent,
      polls,
      activePoll,
      userVotedPollsMap,
      votePoll,
      createPoll,
      togglePollStatus
    }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
