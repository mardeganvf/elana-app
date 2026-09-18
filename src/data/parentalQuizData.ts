// 🌟 Elana Academy — Catálogo de Perguntas, Arquétipos e Motor de Superpoder Parental
// Baseado no documento oficial 04. Quizz (Questionário de 15 Perguntas, Chave.xlsx e Dossiês Junguianos)

export interface ArchetypeProfile {
  id: string;
  name: string;
  baseArchetype: string;
  superpowerTitle: string;
  mantra: string;
  shortSynopsis: string;
  essence: string;
  greatStrength: string;
  blindSpot: string;
  practicalTips: string[];
  themeColor: string;
  iconName: string;
  recommendedJourneyId: string;
  recommendedJourneyTitle: string;
  recommendedJourneyReason: string;
}

export interface QuizOption {
  letter: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface QuizCalculationResult {
  dominant: ArchetypeProfile;
  secondary: ArchetypeProfile;
  scores: Record<string, number>;
  dominantScore: number;
  secondaryScore: number;
  dominantPercentage: number;
  secondaryPercentage: number;
  allPercentages: Record<string, number>;
}

export const PARENTAL_QUESTIONS: QuizQuestion[] = [
  {
    "id": 1,
    "question": "Qual destas frases melhor descreve a sua principal missão como pai/mãe?",
    "options": [
      {
        "letter": "A",
        "text": "Criar um ambiente seguro e feliz, protegendo a magia da infância."
      },
      {
        "letter": "B",
        "text": "Incentivar a independência e a coragem para que ele(a) explore o mundo."
      },
      {
        "letter": "C",
        "text": "Garantir que ele(a) se sinta profundamente amado(a) e conectado(a) connosco."
      },
      {
        "letter": "D",
        "text": "Fornecer estrutura e valores sólidos para que ele(a) se torne responsável."
      }
    ]
  },
  {
    "id": 2,
    "question": "O seu filho chega da escola triste porque não conseguiu uma boa nota num teste importante. Qual a sua primeira reação?",
    "options": [
      {
        "letter": "A",
        "text": "Digo que o mais importante é o esforço e que vamos superar isto juntos."
      },
      {
        "letter": "B",
        "text": "Analiso o teste para entender os erros e criar um plano de estudos."
      },
      {
        "letter": "C",
        "text": "Tento animar com uma piada ou uma atividade divertida."
      },
      {
        "letter": "D",
        "text": "Pergunto o que podemos fazer para vencer este desafio da próxima vez."
      }
    ]
  },
  {
    "id": 3,
    "question": "Como seria o fim de semana ideal em família para você?",
    "options": [
      {
        "letter": "A",
        "text": "Fazendo programa cultural, como um museu, um planetário ou uma livraria."
      },
      {
        "letter": "B",
        "text": "Construindo algo juntos em casa: um projeto de arte ou a inventar uma receita nova."
      },
      {
        "letter": "C",
        "text": "Almoçando com a família toda reunida no domingo."
      },
      {
        "letter": "D",
        "text": "Viajando de última hora para um lugar novo, mesmo que perto."
      }
    ]
  },
  {
    "id": 4,
    "question": "Uma regra importante da casa é quebrada pela primeira vez. Como você lida com a situação?",
    "options": [
      {
        "letter": "A",
        "text": "Aplico a consequência de forma calma e firme, pois regras são para ser cumpridas."
      },
      {
        "letter": "B",
        "text": "Inicio uma conversa para entender os sentimentos que o levaram a quebrar a regra."
      },
      {
        "letter": "C",
        "text": "Pergunto-lhe porquê para saber se a regra ainda faz sentido ou se algo mudou."
      },
      {
        "letter": "D",
        "text": "Tenho uma intuição sobre o que ele(a) realmente precisa naquele momento."
      }
    ]
  },
  {
    "id": 5,
    "question": "Qual o maior presente que você quer dar ao seu filho?",
    "options": [
      {
        "letter": "A",
        "text": "A certeza de que ele(a) tem um potencial ilimitado para ser o que quiser na vida."
      },
      {
        "letter": "B",
        "text": "Raízes fortes e um grande senso de comunidade e de quem ele(a) é."
      },
      {
        "letter": "C",
        "text": "Asas para voar, com autonomia e coragem para traçar o seu próprio caminho."
      },
      {
        "letter": "D",
        "text": "Um coração gentil e empático, capaz de cuidar dos outros e de si mesmo."
      }
    ]
  },
  {
    "id": 6,
    "question": "É um dia de chuva e a tarde está livre. Qual o cenário mais provável na sua casa?",
    "options": [
      {
        "letter": "A",
        "text": "Construímos um castelo de cobertores e inventamos uma história fantástica."
      },
      {
        "letter": "B",
        "text": "Espalhamos tintas, argila e materiais reciclados pela mesa da sala."
      },
      {
        "letter": "C",
        "text": "Fazemos uma sessão de \"cinema\" com pipocas e muitos mimos debaixo das mantas."
      },
      {
        "letter": "D",
        "text": "Começamos uma competição de jogos de tabuleiro, com muita risada."
      }
    ]
  },
  {
    "id": 7,
    "question": "O seu filho(a) cria interesse por um hobby \"estranho\" aos olhos dos outros. A sua reação é:",
    "options": [
      {
        "letter": "A",
        "text": "Apoiar com entusiasmo! A autenticidade é mais importante, mesmo que os outros não entendam."
      },
      {
        "letter": "B",
        "text": "Ficar um pouco preocupado(a) que isso possa dificultar a sua integração com os colegas."
      },
      {
        "letter": "C",
        "text": "Mergulhar de cabeça para aprender tudo sobre o assunto e ajudá-lo(a) a ser o melhor naquilo."
      },
      {
        "letter": "D",
        "text": "Achar fascinante e vejo como uma oportunidade para ele(a) aprender a pensar de forma diferente."
      }
    ]
  },
  {
    "id": 8,
    "question": "Quando pensa no futuro do seu filho(a), o que lhe traz mais paz?",
    "options": [
      {
        "letter": "A",
        "text": "Imaginá-lo(a) a liderar a sua vida com sucesso, responsabilidade e integridade."
      },
      {
        "letter": "B",
        "text": "Imaginá-lo(a) feliz e seguro(a), rodeado(a) de pessoas que o(a) amam."
      },
      {
        "letter": "C",
        "text": "Imaginá-lo(a) a fazer algo que o(a) apaixone, expressando uma sua visão única."
      },
      {
        "letter": "D",
        "text": "Imaginá-lo(a) a realizar o seu potencial, transformando os seus sonhos em realidade."
      }
    ]
  },
  {
    "id": 9,
    "question": "O seu filho tem medo de tentar algo novo, como andar de bicicleta sem rodinhas. Você ..",
    "options": [
      {
        "letter": "A",
        "text": "Protege com todo o equipamento de segurança, segura a bicicleta e corro ao lado dele(a)"
      },
      {
        "letter": "B",
        "text": "Explica a física do equilíbrio e mostra vídeos de outras crianças aprendendo."
      },
      {
        "letter": "C",
        "text": "Faz uma palhaçada para que o riso quebre o medo."
      },
      {
        "letter": "D",
        "text": "Garanto que estarei sempre ao lado dele(a), quer ele(a) caia ou não."
      }
    ]
  },
  {
    "id": 10,
    "question": "A escola cria uma nova regra que você considera absurda e limitadora. O que você faz?",
    "options": [
      {
        "letter": "A",
        "text": "Marca uma reunião para questionar a direção e ensina o(a) filho(a) a defender o seu ponto de vista."
      },
      {
        "letter": "B",
        "text": "Aceita a regra, pois a disciplina e o respeito pela hierarquia são importantes."
      },
      {
        "letter": "C",
        "text": "Ajuda a ver a situação com humor e a encontra uma forma de contornar a regra."
      },
      {
        "letter": "D",
        "text": "Tenta entender o propósito da regra e a integra na rotina da casa sem grande drama."
      }
    ]
  },
  {
    "id": 11,
    "question": "Que tipo de ambiente você se esforça mais para criar em casa?",
    "options": [
      {
        "letter": "A",
        "text": "Um porto seguro de afeto, onde todos se sentem à vontade para expressar os seus sentimentos."
      },
      {
        "letter": "B",
        "text": "Um centro de aprendizagem, cheio de livros, perguntas e conversas estimulantes."
      },
      {
        "letter": "C",
        "text": "Um palco para a imaginação, onde a criatividade e as novas ideias são celebradas."
      },
      {
        "letter": "D",
        "text": "Um oásis de paz e felicidade, protegido das preocupações do mundo exterior."
      }
    ]
  },
  {
    "id": 12,
    "question": "O seu filho fez uma grande birra em público. Depois que a situação acalma, você …",
    "options": [
      {
        "letter": "A",
        "text": "Tenta entender qual a necessidade ou sentimento que causou aquela explosão."
      },
      {
        "letter": "B",
        "text": "Garante que ele(a) entenda que aquilo foi inaceitável e qual será a consequência."
      },
      {
        "letter": "C",
        "text": "Lida com a própria vergonha e se preocupa com o que os outros pais pensaram."
      },
      {
        "letter": "D",
        "text": "Tenta encontrar uma forma de se reconectar com ele(a)."
      }
    ]
  },
  {
    "id": 13,
    "question": "O seu filho está escolhendo as atividades extracurriculares. Qual o seu conselho?",
    "options": [
      {
        "letter": "A",
        "text": "\"Escolha algo que te desafie e te torne mais forte e competente."
      },
      {
        "letter": "B",
        "text": "\"Procure algo que te permita expressar a tua criatividade e ser único(a).”"
      },
      {
        "letter": "C",
        "text": "\"O mais importante é que se divirta e faça amigos.”"
      },
      {
        "letter": "D",
        "text": "\"Pensa no que te pode ajudar a realizar os teus maiores sonhos.”"
      }
    ]
  },
  {
    "id": 14,
    "question": "Se você pudesse garantir que o seu filho(a) tivesse UMA qualidade para o resto da vida, qual seria?",
    "options": [
      {
        "letter": "A",
        "text": "Uma curiosidade insaciável e a capacidade de pensar por si mesmo(a)."
      },
      {
        "letter": "B",
        "text": "Um forte sentido de dever e de honra para com a sua comunidade."
      },
      {
        "letter": "C",
        "text": "Uma fé inabalável na bondade do mundo e das pessoas."
      },
      {
        "letter": "D",
        "text": "A coragem de questionar o que está errado e lutar pela mudança."
      }
    ]
  },
  {
    "id": 15,
    "question": "O seu filho conta-lhe um segredo, pedindo para não contar para o(a) parceiro(a). Como você reage?",
    "options": [
      {
        "letter": "A",
        "text": "Garanto que o segredo dele(a) está seguro. A nossa confiança é a prioridade máxima."
      },
      {
        "letter": "B",
        "text": "Sinto-me desconfortável. A transparência entre os pais é fundamental para a família."
      },
      {
        "letter": "C",
        "text": "Explico que vou dividir os meus sentimentos com o(a) parceiro(a), sem contar os detalhes."
      },
      {
        "letter": "D",
        "text": "Respeito totalmente a sua privacidade para ele(a) criar individualidade e autonomia."
      }
    ]
  }
];

export const PARENTAL_ARCHETYPES: Record<string, ArchetypeProfile> = {
  "otimista": {
    "id": "otimista",
    "name": "Otimista",
    "baseArchetype": "O Inocente",
    "superpowerTitle": "Superpoder: Otimista",
    "mantra": "A infância deve ser mágica e o mundo é um lugar bom.",
    "shortSynopsis": "A sua energia dominante é a da alegria e da esperança. Você acredita que a infância deve ser um santuário de felicidade, e se esforça para criar um mundo mágico e positivo para os seus filhos, protegendo a sua fé na bondade.",
    "essence": "Você é um sonhador(a) que acredita firmemente na bondade e na beleza da vida. Para você, a parentalidade é a chance de criar um pequeno paraíso para seus filhos, um refúgio seguro onde a pureza, a alegria e a maravilha são protegidas a todo custo. Sua presença irradia positividade e esperança, e você se esforça para que a visão de mundo dos seus filhos seja pintada com as cores mais vibrantes.",
    "greatStrength": "Você constrói uma base de segurança e otimismo que servirá como uma âncora emocional para o resto da vida dos seus filhos. Eles crescem acreditando no seu próprio valor e no potencial do mundo, o que os torna pessoas confiantes, esperançosas e com uma grande capacidade de encontrar alegria na vida.",
    "blindSpot": "Sua maior força pode se tornar sua fraqueza: a aversão ao negativo . Ao superproteger, você pode, sem querer, dificultar o desenvolvimento da resiliência e da capacidade de lidar com a frustração. Seus filhos podem sentir-se despreparados para enfrentar conflitos, decepções e a complexidade do mundo real, onde nem tudo é bom ou justo.",
    "practicalTips": [
      "\"Dia do Sentimento Rabugento\":",
      "Uma vez por semana, permita que todos falem sobre algo que os irritou, sem julgamentos. Mostra que é seguro não estar feliz o tempo todo.",
      "Heróis com Falhas:"
    ],
    "themeColor": "#FFD166",
    "iconName": "Sun",
    "recommendedJourneyId": "pais-recem-nascidos",
    "recommendedJourneyTitle": "Pais Recém-Nascidos",
    "recommendedJourneyReason": "Aprenda a acolher momentos de frustração e limites mantendo a leveza e a alegria."
  },
  "realista": {
    "id": "realista",
    "name": "Realista",
    "baseArchetype": "O Cara Comum",
    "superpowerTitle": "Superpoder: Realista",
    "mantra": "Pés no chão, bom senso e fazer parte da comunidade.",
    "shortSynopsis": "Você é a base sólida da família. Com os pés bem assentes na terra, a sua força vem da praticidade e de um forte sentido de comunidade. Você ensina o valor da estabilidade, da honestidade e de pertencer a algo maior.",
    "essence": "Você é a rocha, a base sólida da família. Não se encanta com grandes teorias ou modas passageiras; sua sabedoria está na praticidade, na honestidade e no valor do trabalho bem feito. Você acredita que a vida é melhor quando é simples, autêntica e conectada a uma comunidade.",
    "greatStrength": "Você oferece aos seus filhos o presente da estabilidade e do pertencimento . Eles crescem com os pés bem assentes na terra, sabendo quem são e de onde vêm. Tornam-se adultos resilientes, com grande capacidade de adaptação social e uma forte ética de trabalho.",
    "blindSpot": "A armadilha do Realista é a resistência à individualidade e ao extraordinário . O medo de se destacar ou de parecer diferente pode levar a reprimir os talentos e sonhos mais únicos dos seus filhos. A ênfase no \"nós\" e no \"comum\" pode, por vezes, sufocar o \"eu\" e o que ele tem de especial.",
    "practicalTips": [
      "Elogie a Diferença:",
      "Faça um esforço consciente para elogiar uma qualidade do seu filho que seja totalmente diferente da sua ou da maioria.",
      "\"Sexta-feira Maluca\":"
    ],
    "themeColor": "#8A9A5B",
    "iconName": "Users",
    "recommendedJourneyId": "pais-recem-nascidos",
    "recommendedJourneyTitle": "Pais Recém-Nascidos",
    "recommendedJourneyReason": "Fortaleça sua rede de apoio e alivie a pressão de dar conta de todas as expectativas."
  },
  "protetor": {
    "id": "protetor",
    "name": "Protetor(a)",
    "baseArchetype": "O Herói",
    "superpowerTitle": "Superpoder: Protetor(a)",
    "mantra": "Eu vou te proteger e te ensinar a ser forte para vencer.",
    "shortSynopsis": "A sua missão é ser o grande campeão do seu filho. Você encara a parentalidade com coragem e determinação, sempre pronto(a) para defender e fortalecer os seus filhos, ensinando-os a superar desafios e a vencer na vida.",
    "essence": "Você encara a parentalidade como a mais nobre das missões. Existe um desafio a ser superado, um mundo a ser conquistado, e seu papel é ser o treinador, o defensor e o maior campeão do seu filho. Você é movido(a) pela coragem e pela determinação, e seu objetivo é criar filhos fortes, resilientes e capazes de superar qualquer adversidade.",
    "greatStrength": "Seu maior presente é a infusão de coragem e resiliência . Seus filhos aprendem a não desistir, a lutar pelo que querem e a encarar os desafios de frente. Sentem-se profundamente seguros sob sua proteção e desenvolvem uma autoestima baseada na competência e na superação.",
    "blindSpot": "A sombra do Herói é a necessidade de um inimigo e o controlo excessivo . Você pode, sem querer, criar uma visão de mundo de \"nós contra eles\", onde tudo é uma competição. A ânsia de proteger pode levá-lo(a) a controlar demais a vida dos filhos, não permitindo que eles aprendam com os próprios fracassos, que são essenciais para o crescimento.",
    "practicalTips": [
      "\"Pausa de 10 segundos\":",
      "Antes de intervir para resolver um problema do seu filho, conte até 10. Muitas vezes, ele encontrará a solução sozinho nesse tempo.",
      "Partilhe um \"Fracasso\":"
    ],
    "themeColor": "#FF7F5B",
    "iconName": "Shield",
    "recommendedJourneyId": "construindo-pontes",
    "recommendedJourneyTitle": "Construindo Pontes",
    "recommendedJourneyReason": "Descubra a transição de protetor-gerente para mentor, acolhendo a vulnerabilidade com afeto."
  },
  "cuidador": {
    "id": "cuidador",
    "name": "Nutridor(a)",
    "baseArchetype": "O Cuidador",
    "superpowerTitle": "Superpoder: Nutridor(a)",
    "mantra": "Meu amor e cuidado são seu porto seguro incondicional.",
    "shortSynopsis": "Movido(a) por uma compaixão imensa, você é o porto seguro incondicional da sua família. A sua maior força é a capacidade de cuidar, de oferecer conforto e de garantir que todos se sintam profundamente amados e seguros.",
    "essence": "No coração da sua parentalidade pulsa uma força poderosa e generosa: a compaixão. Você é a personificação do cuidado, do afeto que conforta e da presença que acalma. Sua missão, quase instintiva, é garantir que seus filhos se sintam seguros, amados e profundamente cuidados em todos os momentos.",
    "greatStrength": "Seu maior presente é a criação de um vínculo afetivo profundo e inabalável . Seus filhos crescem com uma inteligência emocional notável, aprendendo com seu exemplo a serem empáticos, gentis e solidários. Eles internalizam a certeza de que são dignos de amor, o que constrói uma autoestima resiliente.",
    "blindSpot": "A armadilha do Nutridor(a) é o autossacrifício e a dificuldade com limites . Em sua imensa generosidade, você corre o risco de se anular, esquecendo das suas próprias necessidades e sonhos. Isso pode levar ao esgotamento e, sutilmente, ensinar aos filhos que o amor significa não ter vontades próprias. A dificuldade em dizer \"não\" ou em permitir que os filhos enfrentem as consequências de seus atos pode atrasar o desenvolvimento da autonomia e da resiliência deles.",
    "practicalTips": [
      "A Pergunta Mágica:",
      "Quando seu filho pedir ajuda com uma tarefa, respire fundo e, em vez de a fazer por ele, pergunte com um sorriso: \"Qual é a sua primeira ideia para resolver isso?\".",
      "Agende o Seu Tempo:"
    ],
    "themeColor": "#E66795",
    "iconName": "Heart",
    "recommendedJourneyId": "pais-recem-nascidos",
    "recommendedJourneyTitle": "Pais Recém-Nascidos",
    "recommendedJourneyReason": "Aprenda a cuidar de quem cuida e equilibrar acolhimento com limites que libertam."
  },
  "aventureiro": {
    "id": "aventureiro",
    "name": "Aventureiro(a)",
    "baseArchetype": "O Explorador",
    "superpowerTitle": "Superpoder: Aventureiro(a)",
    "mantra": "O mundo é uma grande sala de aula; vamos descobri-lo!",
    "shortSynopsis": "Você acredita que o mundo é a maior sala de aula. A sua energia incentiva a independência, a curiosidade e a coragem de desbravar novos caminhos. Para si, a parentalidade é uma grande jornada de descoberta, vivida em liberdade.",
    "essence": "Você é uma alma livre e a parentalidade, para você, é a maior das jornadas. Você anseia por novas experiências e quer partilhá-las com seus filhos. A rotina o(a) entedia; a verdadeira aprendizagem, você acredita, acontece fora da zona de conforto, na exploração do desconhecido.",
    "greatStrength": "Você presenteia seus filhos com a adaptabilidade e a independência . Eles crescem corajosos, flexíveis e com uma imensa curiosidade sobre o mundo. Aprendem a ser autossuficientes e não se sentem intimidados pela mudança ou pela novidade, tornando-se adultos desenrascados e autoconfiantes.",
    "blindSpot": "A sombra do Aventureiro(a) é a dificuldade com o compromisso e a estrutura . A busca constante por novidade pode levar a uma falta de rotina e de raízes, o que pode gerar ansiedade em crianças que precisam de mais previsibilidade. Você pode, por vezes, parecer emocionalmente distante, mais focado(a) na jornada do que nos sentimentos internos da família.",
    "practicalTips": [
      "Ritual Inegociável:",
      "Escolha UMA coisa para fazer todos os dias, à mesma hora (ex: ler uma história antes de dormir). Cumpra-a religiosamente.",
      "\"Explorador de Bairro\":"
    ],
    "themeColor": "#003B46",
    "iconName": "Compass",
    "recommendedJourneyId": "construindo-pontes",
    "recommendedJourneyTitle": "Construindo Pontes",
    "recommendedJourneyReason": "Como canalizar a liberdade e a autonomia em acordos e rotinas consistentes para o dia a dia."
  },
  "questionador": {
    "id": "questionador",
    "name": "Questionador(a)",
    "baseArchetype": "O Rebelde",
    "superpowerTitle": "Superpoder: Questionador(a)",
    "mantra": "Não aceite o mundo como ele é. Crie suas próprias regras.",
    "shortSynopsis": "Você não se contenta com o \"porque sim\". A sua força está em desafiar o status quo e em ensinar os seus filhos a pensarem por si mesmos. Você valoriza a autenticidade radical e a coragem de ser diferente.",
    "essence": "Você é um(a) agitador(a) de águas paradas, um(a) pensador(a) livre que não aceita o \"porque sim\". A parentalidade, para você, é um ato revolucionário: a chance de criar um ser humano que não seguirá a manada, que questionará a autoridade e que terá a coragem de ser radicalmente autêntico.",
    "greatStrength": "Seu dom é o de cultivar a autenticidade e o pensamento crítico . Seus filhos crescem com uma forte noção de identidade, não têm medo de ser diferentes e desenvolvem uma capacidade notável de analisar o mundo à sua volta. Tornam-se adultos corajosos, inovadores e agentes de mudança.",
    "blindSpot": "A armadilha do Questionador(a) é a instabilidade e o conflito por princípio . A rebeldia constante pode criar um ambiente caótico e inseguro para uma criança. Ao ensinar a questionar tudo, pode ser difícil estabelecer os limites e a autoridade parental necessários para a segurança. A linha entre o pensamento crítico e a simples oposição pode tornar-se ténue.",
    "practicalTips": [
      "\"O Advogado do Diabo\":",
      "Quando seu filho questionar uma regra, em vez de a defender, peça-lhe para argumentar a favor dela. Ajuda a ver os dois lados.",
      "Crie uma Tradição Vossa:"
    ],
    "themeColor": "#F97316",
    "iconName": "Flame",
    "recommendedJourneyId": "construindo-pontes",
    "recommendedJourneyTitle": "Construindo Pontes",
    "recommendedJourneyReason": "Aprenda a dialogar e questionar sem gerar insegurança nas regras essenciais de convivência."
  },
  "afetivo": {
    "id": "afetivo",
    "name": "Afetivo(a)",
    "baseArchetype": "O Amante",
    "superpowerTitle": "Superpoder: Afetivo(a)",
    "mantra": "O mais importante de tudo é a nossa conexão e o nosso amor.",
    "shortSynopsis": "Para si, a base de tudo é a conexão. A sua energia é focada em criar laços de intimidade, carinho e harmonia. Você é um(a) especialista em comunicação emocional e acredita que um vínculo forte é o maior presente que pode oferecer.",
    "essence": "Você é um(a) especialista em vínculos, um(a) arquiteto(a) de relações. A parentalidade, para você, é a mais profunda das conexões humanas. Sua maior alegria e prioridade é criar um ambiente de harmonia, beleza e intimidade emocional, onde todos se sintam vistos, ouvidos e profundamente amados.",
    "greatStrength": "Seu presente é a inteligência emocional e a capacidade de criar laços seguros . Seus filhos crescem com uma facilidade imensa para identificar, expressar e valorizar os sentimentos (os seus e os dos outros). Tornam-se adultos empáticos, ótimos comunicadores e capazes de construir relações íntimas e saudáveis.",
    "blindSpot": "A sombra do Afetivo(a) é a aversão ao conflito e a dificuldade com a separação . O desejo de manter a harmonia a todo custo pode levá-lo(a) a evitar conversas difíceis ou a impor os limites necessários, o que é uma forma de amor. Pode haver uma tendência a uma relação fusional, onde a individualidade de cada um se perde, dificultando o processo natural de autonomia do filho.",
    "practicalTips": [
      "Pratique o \"Desacordo Amoroso\":",
      "Da próxima vez que discordar do seu filho, diga: \"Eu vejo as coisas de forma diferente, e tudo bem. Eu amo você mesmo assim.\"",
      "\"Tempo Sozinho\" é Sagrado:"
    ],
    "themeColor": "#FB7185",
    "iconName": "Sparkles",
    "recommendedJourneyId": "pais-recem-nascidos",
    "recommendedJourneyTitle": "Pais Recém-Nascidos",
    "recommendedJourneyReason": "Descubra como sustentar a conexão e o carinho mesmo na hora de dizer \"não\"."
  },
  "inspirador": {
    "id": "inspirador",
    "name": "Inspirador(a)",
    "baseArchetype": "O Criador",
    "superpowerTitle": "Superpoder: Inspirador(a)",
    "mantra": "Se você pode imaginar, pode criar. Deixe sua marca no mundo.",
    "shortSynopsis": "A sua casa é um ateliê de imaginação. Você vê o potencial criativo em toda a parte e a sua missão é ajudar os seus filhos a encontrarem a sua voz única. Você inspira a inovação, a autoexpressão e a beleza.",
    "essence": "Você é um(a) visionário(a), um(a) artista da vida. A parentalidade, para você, é o projeto criativo supremo: a oportunidade de ajudar a moldar um ser humano único e original. Sua casa é um laboratório de ideias onde a imaginação e a inovação são os valores mais altos.",
    "greatStrength": "Seu dom é o de fomentar a criatividade e a autoestima . Seus filhos crescem acreditando no valor das suas próprias ideias e com uma forte capacidade de pensar de forma original e de resolver problemas. Não têm medo de errar, pois entendem o erro como parte do processo criativo.",
    "blindSpot": "A sombra do Inspirador(a) é o perfeccionismo e a desordem . A paixão pela visão final pode gerar frustração com o processo, que é naturalmente caótico. A vida familiar pode carecer de estrutura e rotina, o que é desestabilizador para algumas crianças. Há também o risco de projetar suas próprias ambições criativas nos filhos.",
    "practicalTips": [
      "Elogie a Bagunça:",
      "Enquanto a criação acontece, diga em voz alta: \"Adoro esta bagunça criativa! Mostra que estamos a divertir-nos.\"",
      "\"Problema do Dia\":"
    ],
    "themeColor": "#A855F7",
    "iconName": "Palette",
    "recommendedJourneyId": "singular",
    "recommendedJourneyTitle": "Singular",
    "recommendedJourneyReason": "Canalize a criatividade para acolher a singularidade de cada fase sem a cobrança da perfeição."
  },
  "brincalhao": {
    "id": "brincalhao",
    "name": "Brincalhão(na)",
    "baseArchetype": "O Bobo da Corte",
    "superpowerTitle": "Superpoder: Brincalhão(na)",
    "mantra": "A vida é muito curta para não ser divertida.",
    "shortSynopsis": "A sua principal ferramenta na parentalidade é a alegria. Você acredita que o riso e a leveza são essenciais para uma infância feliz e para criar laços fortes. Você usa o humor para ensinar, conectar e navegar os desafios da vida.",
    "essence": "Você é a alegria em pessoa. Acredita que o riso é o melhor remédio, a melhor ferramenta de ensino e a forma mais rápida de conexão. A parentalidade, para você, não precisa ser um fardo pesado e sério. É uma oportunidade de redescobrir o prazer, a espontaneidade e a pura diversão de estar vivo.",
    "greatStrength": "Seu maior presente é a criação de um ambiente de alegria e resiliência emocional . Seus filhos aprendem a não dramatizar os problemas e a usar o humor como uma ferramenta para lidar com o stress e a adversidade. O vínculo que vocês constroem através da diversão partilhada é incrivelmente forte e duradouro.",
    "blindSpot": "A armadilha do Brincalhão(na) é a evitação de emoções difíceis e a falta de seriedade . O humor pode se tornar um escudo para não lidar com assuntos sérios que exigem gravidade, como a tristeza, o medo ou a raiva. Sua dificuldade em ser firme pode ser interpretada como permissividade, tornando a imposição de limites um desafio constante.",
    "practicalTips": [
      "\"5 Minutos de Seriedade\":",
      "Crie um ritual diário para perguntar \"Como você se sente",
      "hoje?\" e ouça a resposta em silêncio, sem piadas."
    ],
    "themeColor": "#F59E0B",
    "iconName": "Smile",
    "recommendedJourneyId": "pais-recem-nascidos",
    "recommendedJourneyTitle": "Pais Recém-Nascidos",
    "recommendedJourneyReason": "Use o humor como ponte para conversas profundas e presença autêntica nos momentos sérios."
  },
  "mentor": {
    "id": "mentor",
    "name": "Mentor(a)",
    "baseArchetype": "O Sábio",
    "superpowerTitle": "Superpoder: Mentor(a)",
    "mantra": "O conhecimento liberta. Entender o porquê é o caminho.",
    "shortSynopsis": "Você é um(a) guia por natureza. A sua paixão é a busca pela verdade e pelo conhecimento. A sua missão é cultivar uma mente crítica e curiosa nos seus filhos, ensinando-os a entender o porquê das coisas.",
    "essence": "Você é um(a) guia, um(a) professor(a) por natureza. A sua paixão é a busca pela verdade, pelo conhecimento e pela compreensão. A parentalidade, para você, é uma oportunidade fascinante de guiar outra mente na descoberta do mundo, ensinando-a a pensar de forma crítica, lógica e objetiva.",
    "greatStrength": "Seu dom é o de cultivar uma mente crítica e curiosa . Seus filhos desenvolvem um amor pelo aprendizado, uma impressionante capacidade de argumentação e um raciocínio lógico apurado. Tornam-se adultos informados, ponderados e que não se deixam levar por informações falsas ou por pensamentos superficiais.",
    "blindSpot": "A sombra do Mentor(a) é a desconexão emocional e o excesso de análise . A tendência a intelectualizar tudo pode fazer com que você invalide ou ignore as necessidades puramente emocionais (as suas e as do seu filho). Pode ser percebido como frio, distante ou excessivamente crítico, e ter dificuldade em simplesmente oferecer conforto em vez de uma explicação.",
    "practicalTips": [
      "Primeiro o Coração, Depois a Cabeça:",
      "Quando seu filho estiver chateado, a sua primeira frase deve ser de validação emocional (ex: \"Isso parece mesmo frustrante\"), antes de tentar analisar o problema.",
      "\"Dia do Especialista\":"
    ],
    "themeColor": "#3B82F6",
    "iconName": "BookOpen",
    "recommendedJourneyId": "construindo-pontes",
    "recommendedJourneyTitle": "Construindo Pontes",
    "recommendedJourneyReason": "Aprenda a conectar pelo coração antes de explicar pela lógica, validando as emoções."
  },
  "transformador": {
    "id": "transformador",
    "name": "Transformador(a)",
    "baseArchetype": "O Mago",
    "superpowerTitle": "Superpoder: Transformador(a)",
    "mantra": "Você tem o poder de transformar sua realidade e alcançar seu potencial.",
    "shortSynopsis": "Você tem uma capacidade intuitiva de ver o potencial mais profundo dos seus filhos. A sua energia é visionária e catalisadora, ajudando a transformar sonhos em realidade e a inspirar uma autoconfiança quase mágica.",
    "essence": "Você é um(a) catalisador(a) de sonhos, um(a) visionário(a) que vê para além do que é. A parentalidade é um ato de alquimia: ajudar a transformar o potencial bruto do seu filho na sua melhor versão.",
    "greatStrength": "Você inspira uma autoconfiança transcendental . Seus filhos crescem com uma forte sensação de propósito e acreditam profundamente no seu próprio poder de criar a vida que desejam. Desenvolvem uma mentalidade positiva e uma conexão forte com a sua intuição.",
    "blindSpot": "A armadilha do Transformador(a) é o idealismo desligado da realidade e a pressão do potencial . A ênfase no poder da mente pode levar a negligenciar os passos práticos. A constante menção ao \"seu incrível potencial\" pode gerar na criança o medo de desapontar.",
    "practicalTips": [
      "Elogie o \"Hoje\":",
      "Faça um elogio específico sobre uma qualidade que seu filho demonstrou",
      ", não sobre o que ele"
    ],
    "themeColor": "#8B5CF6",
    "iconName": "Wand2",
    "recommendedJourneyId": "singular",
    "recommendedJourneyTitle": "Singular",
    "recommendedJourneyReason": "Transforme expectativas em pequenos passos reais e consistentes de desenvolvimento."
  },
  "lider": {
    "id": "lider",
    "name": "Líder",
    "baseArchetype": "O Governante",
    "superpowerTitle": "Superpoder: Líder",
    "mantra": "Estrutura, responsabilidade e valores sólidos constroem o sucesso.",
    "shortSynopsis": "A sua força está na criação de estrutura e ordem. Você acredita que regras claras, responsabilidade e valores sólidos são a base para uma vida segura e bem-sucedida, e lidera a sua família com um forte sentido de propósito.",
    "essence": "Você é o(a) capitão(ã) do navio. Acredita que a ordem, a clareza e a responsabilidade são os pilares de uma vida bem-sucedida e harmoniosa. A parentalidade é o exercício da liderança benevolente: criar um \"reino\" familiar próspero, seguro e com valores bem definidos.",
    "greatStrength": "Seu presente é a criação de um ambiente de segurança e estabilidade . Seus filhos crescem com um forte senso de responsabilidade, disciplina e autossuficiência. A previsibilidade do ambiente familiar permite que eles se sintam seguros para se desenvolverem.",
    "blindSpot": "A sombra do Líder é a rigidez e o autoritarismo . A necessidade de controlo pode levar a uma falta de flexibilidade, sufocando a espontaneidade e a criatividade dos filhos. Você pode ter dificuldade em admitir erros ou em adaptar as regras à medida que os filhos crescem.",
    "practicalTips": [
      "\"O Ministro das Regras\":",
      "Envolva seu filho na revisão de uma regra da casa. Peça a opinião dele sobre se a regra é justa e como poderia ser melhorada.",
      "Quebre uma Regra (de Propósito):"
    ],
    "themeColor": "#B87353",
    "iconName": "Crown",
    "recommendedJourneyId": "construindo-pontes",
    "recommendedJourneyTitle": "Construindo Pontes",
    "recommendedJourneyReason": "Combine estrutura firme e previsível com escuta ativa e flexibilidade emocional."
  }
};

export const SCORING_MATRIX: Record<string, Record<string, number>> = {
  "0_0": {
    "otimista": 3,
    "protetor": 1,
    "cuidador": 1,
    "afetivo": 1
  },
  "0_1": {
    "protetor": 1,
    "aventureiro": 3,
    "questionador": 1,
    "inspirador": 1
  },
  "0_2": {
    "otimista": 1,
    "cuidador": 1,
    "afetivo": 3
  },
  "0_3": {
    "realista": 1,
    "protetor": 1,
    "mentor": 1,
    "lider": 3
  },
  "1_0": {
    "otimista": 1,
    "protetor": 1,
    "cuidador": 3,
    "afetivo": 1
  },
  "1_1": {
    "protetor": 1,
    "mentor": 3,
    "transformador": 1,
    "lider": 1
  },
  "1_2": {
    "otimista": 1,
    "cuidador": 1,
    "questionador": 1,
    "afetivo": 1,
    "brincalhao": 3
  },
  "1_3": {
    "protetor": 3,
    "mentor": 1,
    "transformador": 1,
    "lider": 1
  },
  "2_0": {
    "aventureiro": 1,
    "brincalhao": 1,
    "mentor": 3,
    "transformador": 1
  },
  "2_1": {
    "otimista": 1,
    "cuidador": 1,
    "aventureiro": 1,
    "afetivo": 1,
    "inspirador": 3,
    "brincalhao": 1,
    "transformador": 1
  },
  "2_2": {
    "otimista": 1,
    "realista": 3,
    "cuidador": 1,
    "afetivo": 1,
    "lider": 1
  },
  "2_3": {
    "aventureiro": 3,
    "questionador": 1,
    "brincalhao": 1,
    "mentor": 1
  },
  "3_0": {
    "realista": 1,
    "protetor": 1,
    "lider": 3
  },
  "3_1": {
    "cuidador": 1,
    "afetivo": 3
  },
  "3_2": {
    "aventureiro": 1,
    "questionador": 3,
    "inspirador": 1,
    "mentor": 1,
    "transformador": 1
  },
  "3_3": {
    "cuidador": 1,
    "questionador": 1,
    "mentor": 1,
    "transformador": 3
  },
  "4_0": {
    "otimista": 1,
    "protetor": 1,
    "aventureiro": 1,
    "questionador": 1,
    "inspirador": 1,
    "transformador": 3
  },
  "4_1": {
    "otimista": 1,
    "realista": 3,
    "protetor": 1,
    "cuidador": 1,
    "lider": 1
  },
  "4_2": {
    "protetor": 1,
    "aventureiro": 3,
    "questionador": 1,
    "inspirador": 1
  },
  "4_3": {
    "otimista": 1,
    "cuidador": 3,
    "afetivo": 1
  },
  "5_0": {
    "otimista": 3,
    "cuidador": 1,
    "aventureiro": 1,
    "afetivo": 1,
    "inspirador": 1,
    "brincalhao": 3
  },
  "5_1": {
    "otimista": 1,
    "inspirador": 3,
    "brincalhao": 1,
    "transformador": 1
  },
  "5_2": {
    "otimista": 1,
    "realista": 1,
    "cuidador": 1,
    "afetivo": 3
  },
  "5_3": {
    "otimista": 1,
    "protetor": 1,
    "aventureiro": 1,
    "afetivo": 1,
    "brincalhao": 3
  },
  "6_0": {
    "aventureiro": 1,
    "questionador": 3,
    "inspirador": 1,
    "transformador": 1
  },
  "6_1": {
    "realista": 3,
    "protetor": 1,
    "lider": 1
  },
  "6_2": {
    "protetor": 3,
    "mentor": 1,
    "lider": 1
  },
  "6_3": {
    "aventureiro": 1,
    "questionador": 1,
    "inspirador": 1,
    "mentor": 3,
    "transformador": 1
  },
  "7_0": {
    "realista": 1,
    "protetor": 1,
    "lider": 3
  },
  "7_1": {
    "otimista": 3,
    "realista": 1,
    "cuidador": 1,
    "afetivo": 1
  },
  "7_2": {
    "otimista": 1,
    "aventureiro": 1,
    "inspirador": 3,
    "transformador": 1
  },
  "7_3": {
    "otimista": 1,
    "aventureiro": 1,
    "inspirador": 1,
    "transformador": 3
  },
  "8_0": {
    "otimista": 1,
    "protetor": 3,
    "cuidador": 1
  },
  "8_1": {
    "questionador": 1,
    "mentor": 3,
    "transformador": 1,
    "lider": 1
  },
  "8_2": {
    "otimista": 1,
    "aventureiro": 1,
    "afetivo": 1,
    "brincalhao": 3
  },
  "8_3": {
    "otimista": 1,
    "cuidador": 3,
    "afetivo": 1
  },
  "9_0": {
    "protetor": 1,
    "aventureiro": 1,
    "questionador": 3,
    "mentor": 1
  },
  "9_1": {
    "realista": 1,
    "lider": 3
  },
  "9_2": {
    "aventureiro": 1,
    "questionador": 1,
    "brincalhao": 3
  },
  "9_3": {
    "realista": 3,
    "cuidador": 1,
    "lider": 1
  },
  "10_0": {
    "otimista": 1,
    "cuidador": 1,
    "afetivo": 3
  },
  "10_1": {
    "questionador": 1,
    "inspirador": 1,
    "mentor": 3,
    "transformador": 1
  },
  "10_2": {
    "otimista": 1,
    "aventureiro": 1,
    "inspirador": 3,
    "brincalhao": 1,
    "transformador": 1
  },
  "10_3": {
    "otimista": 3,
    "realista": 1,
    "cuidador": 1,
    "afetivo": 1
  },
  "11_0": {
    "cuidador": 3,
    "afetivo": 1,
    "mentor": 1
  },
  "11_1": {
    "protetor": 1,
    "lider": 3
  },
  "11_2": {
    "realista": 3,
    "lider": 1
  },
  "11_3": {
    "otimista": 1,
    "cuidador": 1,
    "afetivo": 3
  },
  "12_0": {
    "protetor": 3,
    "aventureiro": 1,
    "mentor": 1,
    "lider": 1
  },
  "12_1": {
    "aventureiro": 1,
    "questionador": 1,
    "inspirador": 3,
    "transformador": 1
  },
  "12_2": {
    "otimista": 1,
    "realista": 1,
    "cuidador": 1,
    "aventureiro": 1,
    "afetivo": 1,
    "brincalhao": 3
  },
  "12_3": {
    "otimista": 1,
    "protetor": 1,
    "aventureiro": 1,
    "inspirador": 1,
    "transformador": 3
  },
  "13_0": {
    "aventureiro": 1,
    "questionador": 1,
    "mentor": 3,
    "transformador": 1
  },
  "13_1": {
    "realista": 3,
    "protetor": 1,
    "cuidador": 1,
    "lider": 1
  },
  "13_2": {
    "otimista": 3,
    "realista": 1,
    "cuidador": 1,
    "afetivo": 1
  },
  "13_3": {
    "protetor": 1,
    "aventureiro": 1,
    "questionador": 3,
    "mentor": 1
  },
  "14_0": {
    "otimista": 1,
    "cuidador": 1,
    "questionador": 1,
    "afetivo": 3
  },
  "14_1": {
    "realista": 1,
    "protetor": 1,
    "lider": 3
  },
  "14_2": {
    "realista": 1,
    "protetor": 1,
    "cuidador": 3,
    "afetivo": 1,
    "lider": 1
  },
  "14_3": {
    "aventureiro": 3,
    "questionador": 1,
    "inspirador": 1,
    "transformador": 1
  }
};

/**
 * Calcula o arquétipo dominante e secundário com base nas 15 respostas.
 * @param answers Mapa de questionIndex (0 a 14) -> optionIndex (0 a 3)
 */
export function calculateParentalQuizResult(answers: Record<number, number>): QuizCalculationResult {
  const scores: Record<string, number> = {
    otimista: 0,
    realista: 0,
    protetor: 0,
    cuidador: 0,
    aventureiro: 0,
    questionador: 0,
    afetivo: 0,
    inspirador: 0,
    brincalhao: 0,
    mentor: 0,
    transformador: 0,
    lider: 0
  };

  for (let qIdx = 0; qIdx < 15; qIdx++) {
    const optIdx = answers[qIdx];
    if (typeof optIdx === 'number') {
      const key = `${qIdx}_${optIdx}`;
      const optScores = SCORING_MATRIX[key];
      if (optScores) {
        for (const [arch, pts] of Object.entries(optScores)) {
          scores[arch] = (scores[arch] || 0) + pts;
        }
      }
    }
  }

  // Ordena por pontuação decrescente
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominantKey = sorted[0]?.[0] || 'cuidador';
  const secondaryKey = sorted[1]?.[0] || 'otimista';

  const dominant = PARENTAL_ARCHETYPES[dominantKey] || PARENTAL_ARCHETYPES['cuidador'];
  const secondary = PARENTAL_ARCHETYPES[secondaryKey] || PARENTAL_ARCHETYPES['otimista'];

  const totalPoints = Object.values(scores).reduce((acc, v) => acc + v, 0) || 1;
  const allPercentages: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores)) {
    allPercentages[k] = Math.round((v / totalPoints) * 100);
  }

  return {
    dominant,
    secondary,
    scores,
    dominantScore: scores[dominantKey] || 0,
    secondaryScore: scores[secondaryKey] || 0,
    dominantPercentage: allPercentages[dominantKey] || 0,
    secondaryPercentage: allPercentages[secondaryKey] || 0,
    allPercentages
  };
}
