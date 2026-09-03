import { Journey } from '../types';

export const JOURNEYS_DATA: Journey[] = [
  {
    id: 'pais-recem-nascidos',
    title: 'Pais Recém-Nascidos',
    subtitle: 'Jornadas que Começam',
    tagline: 'Gestantes e pais de bebês até 3 anos: leveza para o começo da caminhada.',
    description: 'Para gestantes e pais de bebês até 3 anos. Um acolhimento pra lidar com a exaustão, as noites sem dormir, a nova rotina e o equilíbrio do casal no começo da caminhada.',
    pillar: 'movimento',
    pillarAttribute: 'Evolução',
    category: 'comecam',
    targetAudience: 'Gestantes e pais de bebês/crianças até 3 anos',
    themeColor: '#FF7F5B',
    bgLight: '#fff0eb',
    iconName: 'Sun',
    price: 197,
    isComingSoon: false,
    modules: [
      {
        id: 'prn-mod-1',
        number: 1,
        title: 'Cuidando de Quem Cuida',
        lessons: [
          // Subgrupo: Uma Nova Identidade
          { id: 'prn-1-1', subgroup: 'Uma Nova Identidade', title: 'Quem sou eu agora? Descobrindo sua identidade depois do bebê', duration: '14 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=00afb826-b01c-437d-80d6-e51467d34974', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/9f7008fb-570c-4a72-8425-b31f8b2eedd8.png', description: "Por que a sensação de 'desaparecer' é tão comum — e como não se perder de vez.", xpPoints: 50 },
          { id: 'prn-1-2', subgroup: 'Uma Nova Identidade', title: 'Conciliando todas as suas versões depois que o bebê chega', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Trabalho, casa e bebê ao mesmo tempo? O equilíbrio perfeito não existe.', xpPoints: 50 },
          { id: 'prn-1-3', subgroup: 'Uma Nova Identidade', title: 'Lidando com as expectativas: as suas e as de todo mundo', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Menos cobrança e mais verdade: como olhar pra maternidade com gentileza.', xpPoints: 50 },
          { id: 'prn-1-4', subgroup: 'Uma Nova Identidade', title: 'O autocuidado possível, e não aquele ideal de comercial', duration: '12 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Pequenos gestos de carinho que realmente cabem numa rotina real com bebê.', xpPoints: 50 },

          // Subgrupo: A Dinâmica do Casal
          { id: 'prn-1-5', subgroup: 'A Dinâmica do Casal', title: 'O impacto real da chegada do bebê na relação do casal', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Por que tantos casais se sentem desconectados — e como voltar a ser um time.', xpPoints: 50 },
          { id: 'prn-1-6', subgroup: 'A Dinâmica do Casal', title: 'Comunicação e apoio mútuo: os pilares do casal com bebê', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Como reconstruir o diálogo do casal mesmo nos dias mais cansados e corridos.', xpPoints: 50 },
          { id: 'prn-1-7', subgroup: 'A Dinâmica do Casal', title: 'Dividindo as responsabilidades do casal sem brigar por isso', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Um jeito justo e leve de organizar as tarefas de casa — sem disputa, sem mito.', xpPoints: 50 },
          { id: 'prn-1-8', subgroup: 'A Dinâmica do Casal', title: 'Resgatando a intimidade do casal depois que o bebê chega', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Intimidade é bem mais que sexo: pequenos passos reais pra reconexão a dois.', xpPoints: 50 },

          // Subgrupo: As Emoções e os Sentimentos
          { id: 'prn-1-9', subgroup: 'As Emoções e os Sentimentos', title: 'A montanha-russa de emoções que ninguém te contou direito', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Amor gigante, culpa silenciosa e cansaço profundo juntos? Isso é maternidade.', xpPoints: 50 },
          { id: 'prn-1-10', subgroup: 'As Emoções e os Sentimentos', title: 'Sinais de alerta: quando o cansaço extremo vira demais', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'A diferença entre o cansaço normal e um sinal que pede mais cuidado com você.', xpPoints: 50 },

          // Subgrupo: Uma Rede de Apoio
          { id: 'prn-1-11', subgroup: 'Uma Rede de Apoio', title: 'Construindo sua rede de apoio: isso é sobrevivência mesmo', duration: '14 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Ninguém cria um bebê sozinho — por que pedir apoio nunca foi sinal de fraqueza.', xpPoints: 50 },
          { id: 'prn-1-12', subgroup: 'Uma Rede de Apoio', title: 'Como pedir ajuda sem se sentir culpada por isso de novo', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Pedir ajuda não é incomodar: é dar espaço pra quem te ama fazer parte disso.', xpPoints: 50 },
          { id: 'prn-1-13', subgroup: 'Uma Rede de Apoio', title: 'Como colocar limites saudáveis, até com quem você ama', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Uma cerca leve que protege sua rotina, seu bebê e a saúde das suas relações.', xpPoints: 50 },

          // Subgrupo: Novas Responsabilidades
          { id: 'prn-1-14', subgroup: 'Novas Responsabilidades', title: 'Entendendo de onde vem essa insegurança de mãe e de pai', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: "Aquele frio na barriga de 'todo mundo sabe, menos eu' tem uma explicação boa.", xpPoints: 50 },
          { id: 'prn-1-15', subgroup: 'Novas Responsabilidades', title: 'Construindo autoconfiança no seu próprio ritmo, sem pressa', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Confiança de verdade não nasce pronta — ela cresce devagar, dia após dia.', xpPoints: 50 },
          { id: 'prn-1-16', subgroup: 'Novas Responsabilidades', title: 'A solidão que ninguém vê depois que o bebê chega em casa', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Quando o seu mundo muda inteiro e o dos outros parece continuar do mesmo jeito.', xpPoints: 50 },
          { id: 'prn-1-17', subgroup: 'Novas Responsabilidades', title: 'O luto pelas versões antigas de quem você era antes dele', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Sentir saudade de quem você foi não é ingratidão nenhuma — é bem humano.', xpPoints: 50 }
        ]
      },
      {
        id: 'prn-mod-2',
        number: 2,
        title: 'Os Alicerces de um Futuro Feliz',
        lessons: [
          // Subgrupo: O Desenvolvimento nos Primeiros Anos
          { id: 'prn-2-1', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'Como o seu bebê se desenvolve do zero até os três aninhos', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Um mapa gentil e realista pra acompanhar o crescimento do bebê sem correria.', xpPoints: 50 },
          { id: 'prn-2-2', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'A estimulação que acolhe, sem virar uma corrida contra o tempo', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Seu bebê não precisa de estímulo o dia inteiro — aqui, menos é mais, sempre.', xpPoints: 50 },
          { id: 'prn-2-3', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'Sinais de alerta no desenvolvimento que merecem atenção', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Respeitar o tempo do bebê sem fechar os olhos pra sinais realmente importantes.', xpPoints: 50 },

          // Subgrupo: O Poder do Vínculo Afetivo
          { id: 'prn-2-4', subgroup: 'O Poder do Vínculo Afetivo', title: 'A teoria do apego e por que ela muda tudo pro seu filho', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Como construir, dia após dia, a certeza de que o seu bebê é amado e seguro.', xpPoints: 50 },
          { id: 'prn-2-5', subgroup: 'O Poder do Vínculo Afetivo', title: 'O poder do toque, do olhar e da sua voz no dia a dia dele', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Três ferramentas simples e gratuitas que moldam o cérebro e o coração do bebê.', xpPoints: 50 },
          { id: 'prn-2-6', subgroup: 'O Poder do Vínculo Afetivo', title: 'A ansiedade de separação: a dele e também a sua, de mãe', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Por que o bebê chora quando você sai da sala — e como acolher esse momento.', xpPoints: 50 },
          { id: 'prn-2-7', subgroup: 'O Poder do Vínculo Afetivo', title: 'Como o ambiente da sua casa molda o desenvolvimento dele', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Sua casa pode acolher, estimular e acalmar o seu bebê — sem reforma nenhuma.', xpPoints: 50 },

          // Subgrupo: Explorando o mundo através do brincar
          { id: 'prn-2-8', subgroup: 'Explorando o mundo através do brincar', title: 'Por que brincar é fundamental, e nunca perda de tempo', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Brincar é linguagem, é pesquisa, é o jeito que o cérebro do bebê se organiza.', xpPoints: 50 },
          { id: 'prn-2-9', subgroup: 'Explorando o mundo através do brincar', title: 'Brincadeiras certas pra cada fase do seu bebê crescer', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Do colinho ao faz-de-conta: cada fase do seu bebê pede um tipo de presença.', xpPoints: 50 },
          { id: 'prn-2-10', subgroup: 'Explorando o mundo através do brincar', title: 'Como enriquecer a brincadeira do bebê sem se esgotar tanto', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Brincar bem não é brincar muito — é brincar com presença de verdade, sempre.', xpPoints: 50 },

          // Subgrupo: Estabelecendo Limites
          { id: 'prn-2-11', subgroup: 'Estabelecendo Limites', title: 'Educação positiva: firmeza e afeto sem precisar de castigo', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Disciplina não precisa ser bronca — firmeza e amor podem caminhar juntos.', xpPoints: 50 },
          { id: 'prn-2-12', subgroup: 'Estabelecendo Limites', title: 'Como lidar com as birras do seu filho sem perder a paciência', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'O que acontece no cérebro da criança durante uma birra — e como ajudar.', xpPoints: 50 },
          { id: 'prn-2-13', subgroup: 'Estabelecendo Limites', title: 'Por que a consistência acalma tanto a cabeça do seu filho', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Um combinado simples vira mapa, estrutura e segurança pra qualquer criança.', xpPoints: 50 },

          // Subgrupo: Autonomia e Independência
          { id: 'prn-2-14', subgroup: 'Autonomia e Independência', title: 'Autonomia na primeira infância: por onde começar afinal', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: "Trocar o 'deixa que eu faço' pelo 'tenta do seu jeitinho', sem pressa nenhuma.", xpPoints: 50 },
          { id: 'prn-2-15', subgroup: 'Autonomia e Independência', title: 'Respeitando o ritmo do seu filho, sem nenhuma comparação', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Cada criança tem seu tempo — e mais rápido nunca foi sinônimo de melhor.', xpPoints: 50 },
          { id: 'prn-2-16', subgroup: 'Autonomia e Independência', title: "Aprendendo com os erros: o poder de dizer 'ainda não'", duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Errar organiza o cérebro e fortalece a coragem e a persistência da criança.', xpPoints: 50 },
          { id: 'prn-2-17', subgroup: 'Autonomia e Independência', title: 'Rotinas saudáveis: sono, alimentação e telas com equilíbrio', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Previsibilidade é segurança emocional pra toda a casa respirar bem melhor.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'construindo-pontes',
    title: 'Construindo Pontes',
    subtitle: 'Jornadas que Começam',
    tagline: 'Pais de adolescentes: trocando a briga e a porta fechada pela conexão.',
    description: 'Para pais de adolescentes e pré-adolescentes. Como manter o diálogo vivo, entender a cabeça dos jovens e trocar o controle pela confiança sem perder a autoridade com amor.',
    pillar: 'raizes',
    pillarAttribute: 'Presença',
    category: 'comecam',
    targetAudience: 'Pais de pré-adolescentes e adolescentes',
    themeColor: '#8A9A5B',
    bgLight: '#f3f6ec',
    iconName: 'Users',
    price: 227,
    isComingSoon: false,
    modules: [
      {
        id: 'cp-mod-1',
        number: 1,
        title: 'Os Dois Lados da Ponte',
        lessons: [
          // Subgrupo: O Lado de Cá: De Gerente a Mentor
          { id: 'cp-1-1', title: 'O Lado de Cá: Aceitando que o seu papel mudou.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Transicionando do controle para a mentoria.', xpPoints: 50 },
          { id: 'cp-1-2', title: 'O Lado de Cá: Como não repetir os padrões da educação que você recebeu.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Quebrando ciclos de autoritarismo.', xpPoints: 50 },
          { id: 'cp-1-3', title: 'O Lado de Cá: Autoridade sem autoritarismo: a base da confiança.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Firmeza com conexão e escuta ativa.', xpPoints: 50 },

          // Subgrupo: O Lado de Cá: Redescobrindo Quem Você É
          { id: 'cp-1-4', title: 'Redescobrindo Quem Você É: Como conviver com as diferenças (e o que isso diz sobre você).', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Acolhendo a individualidade do adolescente.', xpPoints: 50 },
          { id: 'cp-1-5', title: 'Redescobrindo Quem Você É: Reparando a relação (consigo mesmo) depois de brigas.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'A arte do pedido de desculpas e reparação.', xpPoints: 50 },
          { id: 'cp-1-6', title: 'Redescobrindo Quem Você É: Celebrando a jornada e reconhecendo o seu novo papel.', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Valorizando a parceria e a presença.', xpPoints: 50 },

          // Subgrupo: O Lado de Lá: Um Cérebro em Reforma
          { id: 'cp-1-7', title: 'Um Cérebro em Reforma: Mudanças neurobiológicas da adolescência.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'A maturação do córtex pré-frontal e impulsos.', xpPoints: 50 },
          { id: 'cp-1-8', title: 'Um Cérebro em Reforma: Impulsividade, emoção e tomada de decisão.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Apoiando nas escolhas sem julgar.', xpPoints: 50 },
          { id: 'cp-1-9', title: 'Um Cérebro em Reforma: Intensidade, busca por risco e por pertencimento.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Compreendendo a busca por autonomia e grupo.', xpPoints: 50 },

          // Subgrupo: O Lado de Lá: Uma Identidade em Construção
          { id: 'cp-1-10', title: 'Uma Identidade em Construção: "Quem eu sou?": papéis, grupos, tribos e espelhos.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'A busca de si mesmo e pertencimento social.', xpPoints: 50 },
          { id: 'cp-1-11', title: 'Uma Identidade em Construção: Influência dos amigos e das redes sociais.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Navegando a pressão dos pares.', xpPoints: 50 },
          { id: 'cp-1-12', title: 'Uma Identidade em Construção: Autonomia x Pertencimento.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'O equilíbrio entre a casa e o mundo fora.', xpPoints: 50 },

          // Subgrupo: O Lado de Lá: Emoções a Flor da Pele
          { id: 'cp-1-13', title: 'Emoções a Flor da Pele: Oscilações emocionais naturais.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Respeitando os picos e vales do humor.', xpPoints: 50 },
          { id: 'cp-1-14', title: 'Emoções a Flor da Pele: Como acolher sem minimizar nem intensificar.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Postura de porto seguro e abrigo.', xpPoints: 50 },
          { id: 'cp-1-15', title: 'Emoções a Flor da Pele: Sinais de alerta para saúde mental.', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Reconhecendo ansiedade, isolamento e depressão.', xpPoints: 50 },

          // Subgrupo: O Lado de Lá: O Mundo Digital
          { id: 'cp-1-16', title: 'O Mundo Digital: Benefícios e riscos do universo online.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'O equilíbrio do tempo de tela.', xpPoints: 50 },
          { id: 'cp-1-17', title: 'O Mundo Digital: Redes sociais, comparação, privacidade.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Diálogo aberto sobre redes e autoestima.', xpPoints: 50 },
          { id: 'cp-1-18', title: 'O Mundo Digital: Como estabelecer limites realistas.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Combinados de telas negociados em família.', xpPoints: 50 }
        ]
      },
      {
        id: 'cp-mod-2',
        number: 2,
        title: 'Construindo a Ponte',
        lessons: [
          // Subgrupo: O Novo Jeito de Conversar
          { id: 'cp-2-19', title: 'O Novo Jeito de Conversar: Comunicação que aproxima: Falar x Ser Ouvido.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Técnicas de diálogo sem ruídos.', xpPoints: 50 },
          { id: 'cp-2-20', title: 'O Novo Jeito de Conversar: A arte de perguntar ... e não interrogar.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Perguntas abertas e curiosidade genuína.', xpPoints: 50 },
          { id: 'cp-2-21', title: 'O Novo Jeito de Conversar: O poder da escuta ativa.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Ouvir antes de aconselhar ou corrigir.', xpPoints: 50 },
          { id: 'cp-2-22', title: 'O Novo Jeito de Conversar: Conflito não é guerra: Como discordar sem estragar a relação.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Manejo de desentendimentos com respeito.', xpPoints: 50 },
          { id: 'cp-2-23', title: 'O Novo Jeito de Conversar: Tópicos Sensíveis: Como abordar (sem pânico) sexualidade, namoro, festas e riscos.', duration: '25 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Conversas difíceis conduzidas com acolhimento.', xpPoints: 50 },

          // Subgrupo: Limites que Acolhem
          { id: 'cp-2-24', title: 'Limites que Acolhem: Disciplina positiva na adolescência.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Firmeza e respeito na maturidade.', xpPoints: 50 },
          { id: 'cp-2-25', title: 'Limites que Acolhem: Regras claras, consistentes e negociadas.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Combinados coletivos em casa.', xpPoints: 50 },
          { id: 'cp-2-26', title: 'Limites que Acolhem: A diferença entre supervisão e controle.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Acompanhar sem sufocar a privacidade.', xpPoints: 50 },

          // Subgrupo: Convivência Real
          { id: 'cp-2-27', title: 'Convivência Real: O equilíbrio entre privacidade e convivência.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Respeitando a porta fechada com pontes de afeto.', xpPoints: 50 },
          { id: 'cp-2-28', title: 'Convivência Real: Criando uma rotina que reduz atritos.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Organização doméstica tranquila.', xpPoints: 50 },
          { id: 'cp-2-29', title: 'Convivência Real: Como identificar e evitar brigas inúteis ... e repetitivas.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Desarmando gatilhos de discussão.', xpPoints: 50 },

          // Subgrupo: Autonomia e Responsabilidade
          { id: 'cp-2-30', title: 'Autonomia e Responsabilidade: Consequências naturais e lógicas ... em vez de castigos.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Responsabilização consciente.', xpPoints: 50 },
          { id: 'cp-2-31', title: 'Autonomia e Responsabilidade: O caminho para a independência emocional e prática.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Preparando para gerir a própria vida.', xpPoints: 50 },
          { id: 'cp-2-32', title: 'Autonomia e Responsabilidade: Preparando para o mundo adulto ... e confiando nos erros.', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Permitindo que aprendam com as consequências.', xpPoints: 50 },

          // Subgrupo: Projeto de Futuro
          { id: 'cp-2-33', title: 'Projeto de Futuro: Apoiando a busca por carreira e propósito, sem sufocar.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Orientações de futuro sem impor desejos próprios.', xpPoints: 50 },
          { id: 'cp-2-34', title: 'Projeto de Futuro: A transição silenciosa: de pais-gestores para pais-mentores.', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Celebrando a conquista da maturidade.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'singular',
    title: 'Singular',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Desenvolvimento atípico e neurodivergência: celebrando cada ritmo único.',
    description: 'Para pais de crianças com desenvolvimento atípico, neurodivergência ou necessidades específicas. Um espaço pra respirar, acolher laudos, navegar terapias e celebrar cada vitória no tempo do seu filho.',
    pillar: 'luz',
    pillarAttribute: 'Esperança',
    category: 'transformam',
    targetAudience: 'Pais de crianças com desenvolvimento atípico e neurodivergência',
    themeColor: '#003B46',
    bgLight: '#e6f1f3',
    iconName: 'Palette',
    price: 247,
    isComingSoon: true,
    modules: [
      {
        id: 'sing-mod-1',
        number: 1,
        title: 'O Que Nasce em Você e Floresce na Criança',
        lessons: [
          // Subgrupo: O Que Nasce em Você
          { id: 'sing-1-1', title: 'O Que Nasce em Você: Quando a vida muda de direção.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Acolhendo a mudança de planos da vida.', xpPoints: 50 },
          { id: 'sing-1-2', title: 'O Que Nasce em Você: O luto pelo que você imaginou que seria.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Ressignificando as expectativas ideais.', xpPoints: 50 },
          { id: 'sing-1-3', title: 'O Que Nasce em Você: A aceitação que não vem de uma vez (e tudo bem).', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Entendendo a aceitação como processo.', xpPoints: 50 },
          { id: 'sing-1-4', title: 'O Que Nasce em Você: Medo, culpa, exaustão: os sentimentos que ninguém conta.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Normalizando os sentimentos desafiadores.', xpPoints: 50 },
          { id: 'sing-1-5', title: 'O Que Nasce em Você: O casal como pilar: como manter a união na tempestade.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Fortalecendo a parceria a dois.', xpPoints: 50 },
          { id: 'sing-1-6', title: 'O Que Nasce em Você: Acolhendo os irmãos e as dúvidas dos outros filhos.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Dando atenção e voz a toda a família.', xpPoints: 50 },
          { id: 'sing-1-7', title: 'O Que Nasce em Você: A máscara de oxigênio: cuidar de si para conseguir cuidar.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Autocuidado como necessidade primária.', xpPoints: 50 },

          // Subgrupo: O Que Floresce na Criança
          { id: 'sing-1-8', title: 'O Que Floresce na Criança: O diagnóstico não define quem ele é.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Enxergando a criança além de laudos.', xpPoints: 50 },
          { id: 'sing-1-9', title: 'O Que Floresce na Criança: Entendendo ritmos e singularidades.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Respeitando o tempo próprio de desenvolvimento.', xpPoints: 50 },
          { id: 'sing-1-10', title: 'O Que Floresce na Criança: A força dos pequenos avanços.', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Celebrando cada marco conquistado.', xpPoints: 50 },
          { id: 'sing-1-11', title: 'O Que Floresce na Criança: O que é desenvolvimento possível ... não idealizado.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Avaliando progressos reais com afeto.', xpPoints: 50 },
          { id: 'sing-1-12', title: 'O Que Floresce na Criança: O olhar apreciativo: ver o que cresce, não só o que falta.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Foco nas potências da criança.', xpPoints: 50 },
          { id: 'sing-1-13', title: 'O Que Floresce na Criança: Comunicação e vínculo no ritmo da criança.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Conexão profunda e adaptada.', xpPoints: 50 },

          // Subgrupo: O Caminho que Vocês Constroem Juntos
          { id: 'sing-1-14', title: 'O Caminho Juntos: O amor que organiza: como criar uma rotina que acolhe - sem se perder nela.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Previsibilidade e leveza no dia a dia.', xpPoints: 50 },
          { id: 'sing-1-15', title: 'O Caminho Juntos: O amor que se "advoga": navegando laudos, terapias e a escola.', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Defendendo os direitos e necessidades da criança.', xpPoints: 50 },
          { id: 'sing-1-16', title: 'O Caminho Juntos: O amor que pede ajuda: construindo uma rede de apoio que realmente funciona.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Buscando alianças de suporte confiáveis.', xpPoints: 50 },
          { id: 'sing-1-17', title: 'O Caminho Juntos: Ferramentas práticas de conexão emocional.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Estratégias cotidianas de vínculo.', xpPoints: 50 },
          { id: 'sing-1-18', title: 'O Caminho Juntos: Rituais que fortalecem ... e como celebrar conquistas.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Momentos especiais em família.', xpPoints: 50 },
          { id: 'sing-1-19', title: 'O Caminho Juntos: O maior presente: confiando na sua intuição.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Honrando a sabedoria de pai e mãe.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'amor-escolhido',
    title: 'Amor Escolhido',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Filhos adotivos: acolhendo a espera, a adaptação e a construção de laços.',
    description: 'Para pais de filhos adotivos. Das ansiedades e burocracias da fila de espera até o primeiro abraço, a adaptação da casa e como conversar sobre origens com verdade e respeito.',
    pillar: 'raizes',
    pillarAttribute: 'Presença',
    category: 'transformam',
    targetAudience: 'Pais de filhos adotivos',
    themeColor: '#E66795',
    bgLight: '#fcebf2',
    iconName: 'HeartHandshake',
    price: 217,
    isComingSoon: true,
    modules: [
      {
        id: 'ae-mod-1',
        number: 1,
        title: 'Da Espera à Construção da Família',
        lessons: [
          // Subgrupo: O Caminho até o Encontro
          { id: 'ae-1-1', title: 'O Caminho até o Encontro: Antes do Sim: O Desejo, o Medo e o Chamado.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Preparação psicológica e o chamado da adoção.', xpPoints: 50 },
          { id: 'ae-1-2', title: 'O Caminho até o Encontro: A Espera que Testa o Amor (e o Casal).', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Lidando com a ansiedade dos prazos.', xpPoints: 50 },
          { id: 'ae-1-3', title: 'O Caminho até o Encontro: As Expectativas Invisíveis: Imaginado x Possível x Real.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Desmistificando a chegada da criança.', xpPoints: 50 },

          // Subgrupo: Quando o Encontro Acontece
          { id: 'ae-1-4', title: 'Quando o Encontro Acontece: O Primeiro Olhar: Quando duas histórias se encontram.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'O momento da aproximação inicial.', xpPoints: 50 },
          { id: 'ae-1-5', title: 'Quando o Encontro Acontece: A Construção do Vínculo: O amor que nasce no fazer (e não só no sentir).', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Construindo o apego no cotidiano.', xpPoints: 50 },
          { id: 'ae-1-6', title: 'Quando o Encontro Acontece: A Adaptação da Criança: Acolhendo o luto, o medo da perda e comportamentos de teste.', duration: '25 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Acolhendo as inseguranças do filho.', xpPoints: 50 },
          { id: 'ae-1-7', title: 'Quando o Encontro Acontece: A Adaptação da Família: O "puerpério" da adoção e relação com os irmãos.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'A reorganização da rotina familiar.', xpPoints: 50 },

          // Subgrupo: A Origem, os Laços e a Verdade
          { id: 'ae-1-8', title: 'Origem e Verdade: Como Falar de Origem (Em Cada Idade): Respeito, verdade e linguagem.', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Diálogos de verdade e respeito com o filho.', xpPoints: 50 },
          { id: 'ae-1-9', title: 'Origem e Verdade: Ajudando seu filho a se reconhecer como parte da família.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Fortalecendo o sentimento de pertencimento.', xpPoints: 50 },
          { id: 'ae-1-10', title: 'Origem e Verdade: Quando Perguntas Dóiem: Família biológica e abandono.', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Acolhendo dores e questionamentos.', xpPoints: 50 },

          // Subgrupo: A Vida que se Constrói
          { id: 'ae-1-11', title: 'A Vida que se Constrói: Rotinas que Fortalecem: Transformando a casa com rituais e previsibilidade.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Criando um porto seguro amoroso.', xpPoints: 50 },
          { id: 'ae-1-12', title: 'A Vida que se Constrói: Lidando com o Mundo: Como acolher palpites e perguntas invasivas.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Protegendo a intimidade da família.', xpPoints: 50 },
          { id: 'ae-1-13', title: 'A Vida que se Constrói: Celebrando o Amor Escolhido: Honrando a história que vocês construíram juntos.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Celebrando o vínculo único.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'novos-caminhos',
    title: 'Novos Caminhos',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Ninho vazio e filhos adultos: ressignificando a casa e a sua própria caminhada.',
    description: 'Para pais cujos filhos já cresceram e saíram de casa (fase do ninho vazio). Como acolher a saudade, redescobrir os seus próprios sonhos e viver a vida a dois com leveza.',
    pillar: 'movimento',
    pillarAttribute: 'Evolução',
    category: 'transformam',
    targetAudience: 'Pais cujos filhos saíram de casa',
    themeColor: '#B87353',
    bgLight: '#f8efe9',
    iconName: 'Compass',
    price: 187,
    isComingSoon: true,
    modules: [
      {
        id: 'nc-mod-1',
        number: 1,
        title: 'O Silêncio, o Reencontro e o Amor',
        lessons: [
          // Subgrupo: O Silêncio que Muda Tudo
          { id: 'nc-1-1', title: 'O Silêncio que Muda Tudo: A casa que ficou maior: A solidão inicial e o choque do silêncio.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Acolhendo o impacto do ninho vazio.', xpPoints: 50 },
          { id: 'nc-1-2', title: 'O Silêncio que Muda Tudo: O luto do ciclo que se fecha: Lidando com saudade e a nostalgia.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Vivenciando a transição de ciclo.', xpPoints: 50 },
          { id: 'nc-1-3', title: 'O Silêncio que Muda Tudo: A identidade que se desmancha: "Quem sou eu agora?"', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Reinventando o papel parental.', xpPoints: 50 },

          // Subgrupo: O Reencontro com Você
          { id: 'nc-1-4', title: 'O Reencontro com Você: Quem sou eu agora? Redescobrindo desejos, hábitos e espaços pessoais.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Retomando antigos projetos e hobbies.', xpPoints: 50 },
          { id: 'nc-1-5', title: 'O Reencontro com Você: O que fazer com o tempo (e o quarto) que sobrou?', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Ressignificando a casa física.', xpPoints: 50 },
          { id: 'nc-1-6', title: 'O Reencontro com Você: Redescobrindo Sonhos: O cotidiano dá lugar a novos horizontes.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Projetando novos objetivos de vida.', xpPoints: 50 },

          // Subgrupo: O Reencontro do Casal
          { id: 'nc-1-7', title: 'O Reencontro do Casal: E agora, somos só nós dois? Redescobrindo a parceria.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Reencontrando a cumplicidade a dois.', xpPoints: 50 },
          { id: 'nc-1-8', title: 'O Reencontro do Casal: Como parar de falar sobre os filhos e voltar a falar sobre nós.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Construindo novos assuntos do casal.', xpPoints: 50 },
          { id: 'nc-1-9', title: 'O Reencontro do Casal: A intimidade e os novos projetos a dois.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Fortalecendo o vínculo afetivo.', xpPoints: 50 },

          // Subgrupo: O Amor que Muda de Lugar
          { id: 'nc-1-10', title: 'O Amor que Muda de Lugar: A arte de continuar presente - Sem Invadir.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Respeitando a independência dos filhos adultos.', xpPoints: 50 },
          { id: 'nc-1-11', title: 'O Amor que Muda de Lugar: O amor à Distância: Como manter o afeto vivo com novos rituais e linguagens.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Mantendo o contato frequente e amoroso.', xpPoints: 50 },
          { id: 'nc-1-12', title: 'O Amor que Muda de Lugar: A casa como porto seguro e não como âncora.', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Acolhendo as visitas sem criar dependência.', xpPoints: 50 },
          { id: 'nc-1-13', title: 'O Amor que Muda de Lugar: Celebrando os voos deles. Os seus novos caminhos.', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Orgulho das asas dadas aos filhos.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'depois-do-silencio',
    title: 'Depois do Silêncio',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Luto parental: acolhimento carinhoso e sem pressa para honrar a memória.',
    description: 'Para pais que vivenciaram a perda de um filho. Um abraço afetuoso e acolhedor para respeitar o seu tempo de luto, cuidar da memória com ternura e reaprender a respirar devagar.',
    pillar: 'luz',
    pillarAttribute: 'Esperança',
    category: 'transformam',
    targetAudience: 'Pais em processo de luto parental',
    themeColor: '#FFD166',
    bgLight: '#fff9e6',
    iconName: 'Sparkles',
    price: 197,
    isComingSoon: true,
    modules: [
      {
        id: 'dds-mod-1',
        number: 1,
        title: 'Ternura, Memória e Reconstrução Possível',
        lessons: [
          // Subgrupo: Quando o Mundo Para
          { id: 'dds-1-1', title: 'Quando o Mundo Para: O silêncio inimaginável: O impacto da perda, a permissão para sentir.', duration: '25 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Dando vazão à dor com acolhimento.', xpPoints: 50 },
          { id: 'dds-1-2', title: 'Quando o Mundo Para: O luto sem manual: Entendendo que não existe "tempo certo".', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Respeitando o ritmo individual do luto.', xpPoints: 50 },
          { id: 'dds-1-3', title: 'Quando o Mundo Para: Quando a rotina desajeita: Gatilhos, objetos e os horários vazios.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Navegando os momentos delicados do dia.', xpPoints: 50 },

          // Subgrupo: A Dor que se Vive... e se Divide
          { id: 'dds-1-4', title: 'A Dor que se Vive: A Culpa que Machuca: Por que ela aparece e como acolher com gentileza.', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Aliviando o peso do autojulgamento.', xpPoints: 50 },
          { id: 'dds-1-5', title: 'A Dor que se Vive: O Corpo em Luto: A exaustão, a confusão mental e o impacto físico.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Cuidando da saúde física no luto.', xpPoints: 50 },
          { id: 'dds-1-6', title: 'A Dor que se Vive: O Luto a Dois: Por que vocês sentem de jeitos diferentes (e como se apoiar).', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Acolhendo as diferenças de expressão do casal.', xpPoints: 50 },
          { id: 'dds-1-7', title: 'A Dor que se Vive: O Tempo Não-Linear: Entendendo os ciclos, as recaídas e os respiros.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Compreendendo as ondas do luto.', xpPoints: 50 },

          // Subgrupo: A Ausência que Continua Presente
          { id: 'dds-1-8', title: 'A Ausência Presente: A memória como casa: Presença de forma leve, simbólica e verdadeira.', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Mantendo o vínculo vivo através do amor.', xpPoints: 50 },
          { id: 'dds-1-9', title: 'A Ausência Presente: O Nome, as fotos e os objetos: Como lidar com os símbolos.', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Rituais de lembrança com ternura.', xpPoints: 50 },
          { id: 'dds-1-10', title: 'A Ausência Presente: O Amor que Permanece: A permanência silenciosa do vínculo.', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Honrando a memória do filho.', xpPoints: 50 },

          // Subgrupo: A Reconstrução Possível
          { id: 'dds-1-11', title: 'A Reconstrução Possível: A vida que anda aos poucos: Pequenos movimentos de retorno.', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Dando os primeiros passos para o futuro.', xpPoints: 50 },
          { id: 'dds-1-12', title: 'A Reconstrução Possível: Acolhendo a dor dos irmãos: Como falar, ouvir e dar segurança.', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Apoiando os outros filhos na perda.', xpPoints: 50 },
          { id: 'dds-1-13', title: 'A Reconstrução Possível: A rede que ajuda: Como identificar quem acolhe e impor limites a quem fere.', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Protegendo seu processo de reconstrução.', xpPoints: 50 },
          { id: 'dds-1-14', title: 'A Reconstrução Possível: A Luz que Retorna Devagar: O reencontro com a esperança.', duration: '25 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'A esperança como presença serena.', xpPoints: 50 }
        ]
      }
    ]
  }
];
