import { Journey } from '../types';

export const JOURNEYS_DATA: Journey[] = [
  {
    id: 'pais-recem-nascidos',
    title: 'Pais Recém-Nascidos',
    subtitle: 'Jornadas que Começam',
    tagline: 'Gestantes e pais de crianças até 3 anos: encontrando seu jeito de crescer junto.',
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
          { id: 'prn-1-1', subgroup: 'Uma Nova Identidade', title: 'E agora, quem sou eu depois que meu bebê chegou?', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=00afb826-b01c-437d-80d6-e51467d34974', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/9f7008fb-570c-4a72-8425-b31f8b2eedd8.png', description: 'Acolha as mudanças na sua identidade e encontre um novo equilíbrio.', xpPoints: 0 },
          { id: 'prn-1-2', subgroup: 'Uma Nova Identidade', title: 'Conciliando todas as versões de você depois da chegada do bebê', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=69556921-b61f-4933-9b2c-c6c92d8243ba', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/f19f2b98-8092-490f-a047-87bb698258bb.png', description: 'Reorganize tempo e prioridades sem deixar de lado o que importa para você.', xpPoints: 0 },
          { id: 'prn-1-3', subgroup: 'Uma Nova Identidade', title: 'Como lidar com as expectativas sem se perder no caminho', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=52a26e3c-07cd-4011-a689-440bd9291625', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/74a56322-be25-43b3-baa4-243070734111.png', description: 'Alivie a cobrança e encontre um jeito de viver a parentalidade no seu ritmo.', xpPoints: 0 },
          { id: 'prn-1-4', subgroup: 'Uma Nova Identidade', title: 'Autocuidado possível: pequenos gestos que cabem na vida real', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=0348ab61-efbc-4f46-bb8b-6f75bf4b372c', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/e0e2f758-140d-4d83-8f23-bc6f4f0a5b59.png', description: 'Descubra cuidados simples que preservam sua energia e seu bem-estar.', xpPoints: 0 },
          { id: 'prn-1-5', subgroup: 'A Dinâmica do Casal', title: 'O impacto da chegada do bebê na relação do casal', duration: '07 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=d427d73b-258b-4f5a-a23c-7ee36accf553', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/3616f31e-38bd-4af6-b47d-5d23eb9f1d25.png', description: 'Entenda as mudanças na relação e encontre caminhos para manter a conexão.', xpPoints: 0 },
          { id: 'prn-1-6', subgroup: 'A Dinâmica do Casal', title: 'Comunicação e apoio mútuo: como cuidar da relação no dia a dia', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=772a8323-c1d0-4c97-82b5-de3ef71f4105', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/80035eb9-a0f8-46fc-845f-acec20252aa5.png', description: 'Converse sobre cansaço e necessidades para construir uma parceria mais justa.', xpPoints: 0 },
          { id: 'prn-1-7', subgroup: 'A Dinâmica do Casal', title: 'Dividindo responsabilidades sem transformar a casa em competição', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=1317465e-cb9f-44b3-8986-f6addb170539', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/46ae7509-362c-4ae4-aa96-6c10ad277003.png', description: 'Organize responsabilidades com mais clareza, colaboração e menos cobrança.', xpPoints: 0 },
          { id: 'prn-1-8', subgroup: 'A Dinâmica do Casal', title: 'Reencontrando a intimidade e o tempo para vocês dois', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=ef59b086-cac2-42d2-afa3-68441c502219', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/3a073b64-2af3-42f4-a081-a32b20a40649.png', description: 'Recupere carinho e conexão a dois, mesmo com as demandas da nova rotina.', xpPoints: 0 },
          { id: 'prn-1-9', subgroup: 'As Emoções e os Sentimentos', title: 'A montanha-russa de emoções depois da chegada do bebê', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=d0a4c790-4c4c-4a97-a03b-252c9534686e', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/f5ada519-9e89-4979-b848-f82eb382ce9f.png', description: 'Entenda as oscilações emocionais e atravesse essa fase com mais gentileza.', xpPoints: 0 },
          { id: 'prn-1-10', subgroup: 'As Emoções e os Sentimentos', title: 'Cansaço extremo: quando o corpo e a mente pedem atenção', duration: '07 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=32426d8b-892f-467b-a76e-facce7f6dbf8', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/b20a6dd1-aec7-495f-b247-142002b01425.png', description: 'Reconheça sinais de exaustão e encontre formas de cuidar de quem cuida.', xpPoints: 0 },
          { id: 'prn-1-11', subgroup: 'Uma Rede de Apoio', title: 'Construindo uma rede de apoio que realmente funciona', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=01e9b481-ffa3-473a-9a67-b2abf350ea98', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/547aa432-330a-4cd6-a60b-98e0e9c35bd6.png', description: 'Descubra como transformar pessoas próximas em apoio possível no dia a dia.', xpPoints: 0 },
          { id: 'prn-1-12', subgroup: 'Uma Rede de Apoio', title: 'Como pedir ajuda sem culpa e sem precisar dar conta de tudo', duration: '05 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=2019ba96-27df-45b1-ab01-597387d68489', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/5d6302f4-83da-46bf-9aa3-9a3c5f1b3c49.png', description: 'Aprenda a pedir apoio com clareza, sem transformar ajuda em dívida.', xpPoints: 0 },
          { id: 'prn-1-13', subgroup: 'Uma Rede de Apoio', title: 'Limites saudáveis: cuidando de você sem se afastar dos outros', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=2aa2e0af-4bff-4322-9692-85e75f610155', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/5ffb69c1-d42f-47c0-8034-46b4f86becb2.png', description: 'Encontre formas gentis e firmes de proteger seu espaço e sua energia.', xpPoints: 0 },
          { id: 'prn-1-14', subgroup: 'Novas Responsabilidades', title: 'A insegurança faz parte: como confiar mais no seu próprio caminho', duration: '06 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=0cc055db-262c-43ec-b7e1-6b3025f38235', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/14058e6a-d47f-4fe8-a041-3c4b7bb412f9.png', description: 'Aprenda a observar, experimentar e seguir em frente sem buscar certezas.', xpPoints: 0 },
          { id: 'prn-1-15', subgroup: 'Novas Responsabilidades', title: 'Autoconfiança no seu ritmo: pequenas conquistas também contam', duration: '05 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=fee1f64e-23c3-4094-8ab8-9d681eca79b9', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788385403798-1abd4e82.jpg', description: 'Reconheça avanços do dia a dia e construa confiança passo a passo.', xpPoints: 0 },
          { id: 'prn-1-16', subgroup: 'Novas Responsabilidades', title: 'A solidão que ninguém vê depois que a vida muda', duration: '05 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=7e552299-016f-4b1c-99a2-cae9ca5f5cd4', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/f6def843-c0d7-4f0c-b983-ddf8dfbb2bb8.png', description: 'Entenda a solidão interna e encontre formas de se sentir mais compreendido.', xpPoints: 0 },
          { id: 'prn-1-17', subgroup: 'Novas Responsabilidades', title: 'O luto pelas antigas versões de você e da sua vida', duration: '05 min', videoUrl: 'https://player-vz-d4a6702a-293.tv.pandavideo.com.br/embed/?v=6c88a6da-357e-4f83-be0a-73330a102a4e', thumbnailUrl: 'https://thumbs.tv.pandavideo.com.br/vz-d4a6702a-293/e2b5ce8f-aadd-45fb-a860-5210419b1802.png', description: 'Dê espaço às mudanças e acolha o que ficou para trás sem culpa.', xpPoints: 0 }
        ]
      },
      {
        id: 'prn-mod-2',
        number: 2, 
        title: 'Os Alicerces de um Futuro Feliz',
        lessons: [
          { id: 'prn-2-1', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'Desenvolvimento de zero a três: o que esperar de cada fase', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438692361-400865ba.jpg', description: 'Conheça marcos importantes e acompanhe o desenvolvimento sem pressa.', xpPoints: 0 },
          { id: 'prn-2-2', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'Estimulação que acolhe: menos pressão, mais descobertas', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438730279-e60cdcd7.jpg', description: 'Descubra como estimular o bebê sem transformar desenvolvimento em cobrança.', xpPoints: 0 },
          { id: 'prn-2-3', subgroup: 'O Desenvolvimento nos Primeiros Anos', title: 'Sinais de alerta no desenvolvimento: quando vale buscar orientação', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438765134-906d99ad.jpg', description: 'Saiba o que observar e quando procurar orientação sem entrar em pânico.', xpPoints: 0 },
          { id: 'prn-2-4', subgroup: 'O Poder do Vínculo Afetivo', title: 'Teoria do apego: construindo segurança desde os primeiros vínculos', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438804895-05bbdc8c.jpg', description: 'Entenda como presença e vínculo ajudam o bebê a construir segurança.', xpPoints: 0 },
          { id: 'prn-2-5', subgroup: 'O Poder do Vínculo Afetivo', title: 'Toque, olhar e voz: pequenas interações, grandes vínculos', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438833911-210649e0.jpg', description: 'Veja como gestos simples do cotidiano fortalecem conexão e segurança.', xpPoints: 0 },
          { id: 'prn-2-6', subgroup: 'O Poder do Vínculo Afetivo', title: 'Ansiedade de separação: quando ir e voltar também ensina', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438858535-3841964f.jpg', description: 'Entenda essa fase e ajude seu bebê a viver separações com mais segurança.', xpPoints: 0 },
          { id: 'prn-2-7', subgroup: 'O Poder do Vínculo Afetivo', title: 'O ambiente também educa: como a casa participa do desenvolvimento', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438879407-b1514b08.jpg', description: 'Perceba como rotina, espaço e clima emocional influenciam o bebê.', xpPoints: 0 },
          { id: 'prn-2-8', subgroup: 'Explorando o mundo através do brincar', title: 'Brincar é fundamental: o desenvolvimento também acontece na diversão', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438908723-c1641110.jpg', description: 'Entenda por que brincar é essencial e como aproveitar melhor esses momentos.', xpPoints: 0 },
          { id: 'prn-2-9', subgroup: 'Explorando o mundo através do brincar', title: 'Brincadeiras para cada fase: acompanhando o bebê pelo caminho', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438932216-ac6164a4.jpg', description: 'Encontre ideias de brincadeiras adequadas ao momento e ao desenvolvimento.', xpPoints: 0 },
          { id: 'prn-2-10', subgroup: 'Explorando o mundo através do brincar', title: 'Como enriquecer a brincadeira sem precisar de grandes recursos', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438961460-362dd60a.jpg', description: 'Transforme situações simples do dia a dia em oportunidades de brincar.', xpPoints: 0 },
          { id: 'prn-2-11', subgroup: 'Estabelecendo Limites', title: 'Educação positiva: firmeza, conexão e respeito na primeira infância', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788438990394-db172509.jpg', description: 'Conheça uma forma de educar que combina limites, conexão e respeito.', xpPoints: 0 },
          { id: 'prn-2-12', subgroup: 'Estabelecendo Limites', title: 'Birras: como atravessar momentos difíceis sem perder a conexão', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439010511-0084f136.jpg', description: 'Aprenda a lidar com crises começando pela sua própria regulação emocional.', xpPoints: 0 },
          { id: 'prn-2-13', subgroup: 'Estabelecendo Limites', title: 'Consistência na comunicação: menos confusão, mais previsibilidade', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439035741-cb866bc6.jpg', description: 'Crie regras claras e consistentes para ajudar a criança a saber o que esperar.', xpPoints: 0 },
          { id: 'prn-2-14', subgroup: 'Autonomia e Independência', title: 'Autonomia na primeira infância: pequenos passos rumo à independência', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439058210-28540993.jpg', description: 'Ofereça escolhas e oportunidades para a criança ganhar confiança com segurança.', xpPoints: 0 },
          { id: 'prn-2-15', subgroup: 'Autonomia e Independência', title: 'Respeitando o ritmo: desenvolvimento sem comparações e cobranças', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439079911-d07bea22.jpg', description: 'Acompanhe cada conquista respeitando o ritmo da criança e da família.', xpPoints: 0 },
          { id: 'prn-2-16', subgroup: 'Autonomia e Independência', title: 'Aprendendo com os erros: como fortalecer autonomia e confiança', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439101570-d2bd4a7c.jpg', description: 'Transforme tentativas e erros em oportunidades reais de aprendizagem.', xpPoints: 0 },
          { id: 'prn-2-17', subgroup: 'Autonomia e Independência', title: 'Rotinas saudáveis: sono, alimentação e telas com mais previsibilidade', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788439129938-29d2fa35.jpg', description: 'Construa hábitos possíveis que tragam previsibilidade e bem-estar para a casa.', xpPoints: 0 }
        ]
      }
    ]
  },

  {
    id: 'construindo-pontes',
    title: 'Construindo Pontes',
    subtitle: 'Jornadas que Começam',
    tagline: 'Pais de adolescentes: menos controle, mais diálogo, confiança e conexão.',
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
          { id: 'cp-1-1', subgroup: 'O Lado de Cá da Ponte', title: 'De gerente a mentor: aceitando seu novo papel na adolescência', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788453081005-28a95eb4.jpg', description: 'Troque o controle excessivo por presença, orientação e confiança.', xpPoints: 0 },
          { id: 'cp-1-2', subgroup: 'O Lado de Cá: De Gerente a Mentor', title: 'Quebrando ciclos: escolhendo o que repetir e o que transformar', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446243320-90f1075e.jpg', description: 'Reconheça padrões do passado e escolha conscientemente o que levar adiante.', xpPoints: 0 },
          { id: 'cp-1-3', subgroup: 'O Lado de Cá: De Gerente a Mentor', title: 'Autoridade sem autoritarismo: firmeza que preserva a relação', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446257542-7e791c49.jpg', description: 'Estabeleça limites com clareza sem transformar autoridade em controle.', xpPoints: 0 },
          { id: 'cp-1-4', subgroup: 'O Lado de Cá: Redescobrindo Quem Você É', title: 'Como conviver com as diferenças sem transformar tudo em conflito', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446274679-9c3f3be5.jpg', description: 'Aprenda a acolher diferenças e construir acordos que façam sentido para todos.', xpPoints: 0 },
          { id: 'cp-1-5', subgroup: 'O Lado de Cá: Redescobrindo Quem Você É', title: 'Reparando a relação com você: menos culpa, mais presença', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446294153-f5810f97.jpg', description: 'Reencontre seu próprio espaço e fortaleça a relação consigo nesta fase.', xpPoints: 0 },
          { id: 'cp-1-6', subgroup: 'O Lado de Cá: Redescobrindo Quem Você É', title: 'Celebrando a jornada: reconheça o caminho que vocês já percorreram', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446309873-a4d689cb.jpg', description: 'Valorize conquistas e aprendizados sem perder de vista o que ainda vem.', xpPoints: 0 },
          { id: 'cp-1-7', subgroup: 'O Lado de Lá: Um Cérebro em Reforma', title: 'Mudanças neurobiológicas: entendendo o cérebro adolescente', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446325260-c4e90560.jpg', description: 'Entenda o que muda no cérebro e por que isso afeta escolhas e emoções.', xpPoints: 0 },
          { id: 'cp-1-8', subgroup: 'O Lado de Lá: Um Cérebro em Reforma', title: 'Impulsividade e decisões: entendendo antes de cobrar maturidade', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446339721-0b1cea33.jpg', description: 'Compreenda impulsos e decisões para orientar sem reduzir tudo a desobediência.', xpPoints: 0 },
          { id: 'cp-1-10', subgroup: 'O Lado de Lá: Uma Identidade em Construção', title: 'Quem sou eu? A identidade que ganha forma na adolescência', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446358554-695360b0.jpg', description: 'Acompanhe a construção da identidade sem tentar definir quem seu filho será.', xpPoints: 0 },
          { id: 'cp-1-11', subgroup: 'O Lado de Lá: Uma Identidade em Construção', title: 'Autonomia e família: dando espaço sem perder a conexão', duration: '- Min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446377000-3fb4f7c9.jpg', description: 'Aprenda a ampliar a autonomia mantendo presença, vínculo e confiança.', xpPoints: 0 },
          { id: 'cp-1-12', subgroup: 'O Lado de Lá: Uma Identidade em Construção', title: 'Amigos e redes sociais: quando a influência muda de lugar', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446394184-a8240de7.jpg', description: 'Entenda o peso dos pares e das redes para orientar sem invadir.', xpPoints: 0 },
          { id: 'cp-1-13', subgroup: 'O Lado de Lá: Emoções a Flor da Pele', title: 'Oscilações emocionais: acolhendo os altos e baixos da adolescência', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446410403-18df15c3.jpg', description: 'Entenda as mudanças emocionais e descubra como oferecer um porto seguro.', xpPoints: 0 },
          { id: 'cp-1-14', subgroup: 'O Lado de Lá: Emoções a Flor da Pele', title: 'Como acolher as emoções sem tentar resolver tudo por eles', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446426822-a233f642.jpg', description: 'Aprenda a escutar e acolher emoções sem transformar conversa em sermão.', xpPoints: 0 },
          { id: 'cp-1-15', subgroup: 'O Lado de Lá: Emoções a Flor da Pele', title: 'Sinais de alerta para a saúde mental: o que merece atenção', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446462500-7c5117b6.jpg', description: 'Saiba o que observar e quando buscar ajuda, sem transformar cuidado em vigilância.', xpPoints: 0 },
          { id: 'cp-1-16', subgroup: 'O Lado de Lá: O Mundo Digital', title: 'Digital na adolescência: benefícios, riscos e escolhas conscientes', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446480288-003256a1.jpg', description: 'Entenda o que o digital oferece e ajude seu filho a circular com consciência.', xpPoints: 0 },
          { id: 'cp-1-17', subgroup: 'O Lado de Lá: O Mundo Digital', title: 'Redes sociais, comparação e privacidade: protegendo sem controlar', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446495088-19c1747d.jpg', description: 'Converse sobre comparação, exposição e privacidade sem transformar tudo em proibição.', xpPoints: 0 },
          { id: 'cp-1-18', subgroup: 'O Lado de Lá: O Mundo Digital', title: 'Limites para telas: acordos claros sem transformar a casa em guerra', duration: '- min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788446512172-528058ab.jpg', description: 'Crie limites possíveis para telas, com menos punição e mais clareza.', xpPoints: 0 }
        ]
      },
      {
        id: 'cp-mod-2',
        number: 2, 
        title: 'Construindo a Ponte',
        lessons: [
          { id: 'cp-2-19', subgroup: 'O Novo Jeito de Conversar', title: 'Comunicação que aproxima: falando para manter a ponte aberta', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Encontre formas de conversar que favoreçam confiança, vínculo e colaboração.', xpPoints: 50 },
          { id: 'cp-2-20', subgroup: 'O Novo Jeito de Conversar', title: 'A arte de perguntar: perguntas que abrem espaço para conversar', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Troque interrogatórios por perguntas que convidam à conversa e à reflexão.', xpPoints: 50 },
          { id: 'cp-2-21', subgroup: 'O Novo Jeito de Conversar', title: 'Escuta ativa: quando ouvir vale mais do que ter a resposta', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Pratique uma escuta que acolhe, compreende e fortalece a relação.', xpPoints: 50 },
          { id: 'cp-2-22', subgroup: 'O Novo Jeito de Conversar', title: 'Resolvendo conflitos: como transformar atrito em aprendizado', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Aprenda a atravessar conflitos com clareza, respeito e espaço para reparar.', xpPoints: 50 },
          { id: 'cp-2-23', subgroup: 'O Novo Jeito de Conversar', title: 'Tópicos sensíveis: como conversar sobre o que dá vontade de evitar', duration: '25 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Prepare conversas difíceis com mais abertura, segurança e menos julgamento.', xpPoints: 50 },
          { id: 'cp-2-24', subgroup: 'Limites que Acolhem', title: 'Disciplina positiva: limites que ensinam sem romper a conexão', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Construa limites que orientam e ensinam, sem transformar disciplina em punição.', xpPoints: 50 },
          { id: 'cp-2-25', subgroup: 'Limites que Acolhem', title: 'Regras claras: combinados que ajudam a casa a funcionar melhor', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Defina acordos simples e consistentes para reduzir conflitos no cotidiano.', xpPoints: 50 },
          { id: 'cp-2-26', subgroup: 'Limites que Acolhem', title: 'Supervisão ou controle? Encontrando o ponto de equilíbrio', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Esteja presente para orientar sem transformar acompanhamento em vigilância.', xpPoints: 50 },
          { id: 'cp-2-27', subgroup: 'Convivência Real', title: 'Privacidade e convivência: respeitando o espaço sem perder o vínculo', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Encontre o equilíbrio entre intimidade, autonomia e presença na família.', xpPoints: 50 },
          { id: 'cp-2-28', subgroup: 'Convivência Real', title: 'Uma rotina que reduz atritos e deixa mais espaço para convivência', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Organize o cotidiano com combinados que diminuem conflitos e cobranças.', xpPoints: 50 },
          { id: 'cp-2-29', subgroup: 'Convivência Real', title: 'Brigas inúteis e repetitivas: como sair do mesmo ciclo', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Identifique padrões de conflito e mude a dinâmica antes que tudo vire disputa.', xpPoints: 50 },
          { id: 'cp-2-30', subgroup: 'Autonomia e Responsabilidade', title: 'Consequências naturais e lógicas: deixando a vida também ensinar', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Use consequências para ensinar responsabilidade sem transformar tudo em punição.', xpPoints: 50 },
          { id: 'cp-2-31', subgroup: 'Autonomia e Responsabilidade', title: 'Independência emocional e prática: preparando para a vida adulta', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Fortaleça habilidades práticas e emocionais para que seu filho ganhe autonomia.', xpPoints: 50 },
          { id: 'cp-2-32', subgroup: 'Autonomia e Responsabilidade', title: 'Confiando nos erros: quando deixar aprender também é cuidar', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Permita que erros e consequências ensinem, oferecendo apoio sem assumir o controle.', xpPoints: 50 },
          { id: 'cp-2-33', subgroup: 'Projeto de Futuro', title: 'Carreira e propósito: apoiando escolhas sem projetar seus desejos', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Apoie planos de futuro sem impor expectativas, deixando espaço para escolhas próprias.', xpPoints: 50 },
          { id: 'cp-2-34', subgroup: 'Projeto de Futuro', title: 'De pais-gestores a pais-mentores: uma nova forma de estar presente', duration: '24 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Faça a transição para uma presença baseada em confiança, orientação e apoio.', xpPoints: 50 }
        ]
      }
    ]
  },

  {
    id: 'singular',
    title: 'Singular',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Desenvolvimento atípico e neurodivergência: acolhendo cada ritmo e possibilidade.',
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
        title: 'Quando o Caminho Muda',
        lessons: [
          { id: 'sing-1-1', subgroup: 'Incerteza', title: 'Entre a suspeita e as respostas: como viver enquanto você ainda não sabe', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528224338-b31a12be.jpg', description: 'Atravesse a incerteza sem transformar cada dia numa busca urgente por uma explicação.', xpPoints: 0 },
          { id: 'sing-1-2', subgroup: 'Expectativas', title: 'Quando o filho real encontra a história que você tinha imaginado', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528246324-7c301630.jpg', description: 'Acolha o que muda em suas expectativas sem transformar seu filho em uma perda.', xpPoints: 0 },
          { id: 'sing-1-3', subgroup: 'Sentimentos', title: 'Quando amor, medo, culpa e cansaço aparecem ao mesmo tempo', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528280551-7e46ad0e.jpg', description: 'Reconheça sentimentos difíceis sem usá-los como medida do amor que você sente.', xpPoints: 0 },
          { id: 'sing-1-4', subgroup: 'Aceitação', title: 'Aceitar não é chegar a um lugar onde nada mais dói', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528321684-b250a167.jpg', description: 'Entenda por que novas fases podem reabrir sentimentos sem significar que você voltou ao começo.', xpPoints: 0 },
          { id: 'sing-1-5', subgroup: 'Relações familiares', title: 'Quando cada pessoa da família vive essa mudança de um jeito', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528346080-414099d4.jpg', description: 'Acolha ritmos diferentes entre parceiros e irmãos sem exigir que todos sintam ou reajam igual.', xpPoints: 0 },
          { id: 'sing-1-6', subgroup: 'Quem cuida', title: 'Como cuidar de você quando o cuidado já ocupa quase tudo', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788528381789-25a1df4d.jpg', description: 'Encontre formas possíveis de se incluir na rotina sem transformar autocuidado em outra obrigação.', xpPoints: 0 }
        ]
      },
      {
        id: 'sing-mod-2',
        number: 2, 
        title: 'Enxergando Seu Filho Inteiro',
        lessons: [
          { id: 'sing-2-1', subgroup: 'Além do diagnóstico', title: 'Seu filho é maior do que qualquer diagnóstico', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788529411115-033fb2b1.jpg', description: 'Use o diagnóstico como informação sem deixar que ele se torne a lente para enxergar tudo.', xpPoints: 0 },
          { id: 'sing-2-2', subgroup: 'Ritmo e sinais', title: 'O que muda quando você aprende a ler o ritmo do seu filho', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788529430503-7b142fbe.jpg', description: 'Observe sinais, necessidades e interesses sem medir cada diferença pela régua de outras crianças.', xpPoints: 0 },
          { id: 'sing-2-3', subgroup: 'Desenvolvimento', title: 'Progresso não precisa parecer com o caminho que você esperava', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788529445934-7ed6098e.jpg', description: 'Reconheça possibilidades e conquistas sem transformar desenvolvimento em cobrança permanente.', xpPoints: 0 },
          { id: 'sing-2-4', subgroup: 'Comunicação e vínculo', title: 'Quando seu filho se comunica de um jeito que pede outra forma de escutar', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788529503707-eaa20098.jpg', description: 'Amplie sua percepção sobre expressão e conexão para encontrar caminhos de encontro entre vocês.', xpPoints: 0 },
          { id: 'sing-2-5', subgroup: 'Autonomia e voz', title: 'Proteger, defender, decidir: onde começa a voz do seu filho?', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788530983155-6de672d3.jpg', description: 'Apoie necessidades e direitos enquanto cria espaço crescente para escolhas, preferências e autonomia.', xpPoints: 0 }
        ]
      },
      {
        id: 'sing-mod-3',
        number: 3, 
        title: 'Construindo uma Vida Possível',
        lessons: [
          { id: 'sing-3-1', subgroup: 'Rotina', title: 'Uma rotina que ajuda sem fazer a família viver em função dela', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788530941395-fa548059.jpg', description: 'Crie previsibilidade suficiente para sustentar o cotidiano sem transformar organização em rigidez.', xpPoints: 0 },
          { id: 'sing-3-2', subgroup: 'Cuidado x gerenciamento', title: 'Quando ser pai ou mãe começa a parecer um trabalho de gestão', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788530957900-5aaa739d.jpg', description: 'Abra espaço para o vínculo em meio a consultas, terapias, escola e agendas.', xpPoints: 0 },
          { id: 'sing-3-3', subgroup: 'Escola', title: 'Quando a escola também precisa aprender a enxergar seu filho', duration: '23 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788530999803-85334236.jpg', description: 'Construa diálogo com a escola sem reduzir a criança às suas dificuldades.', xpPoints: 0 },
          { id: 'sing-3-4', subgroup: 'Mundo ao redor', title: 'Como proteger seu filho sem ensiná-lo a se esconder do mundo', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788531029924-c6739f56.jpg', description: 'Crie limites para olhares e comentários sem transformar diferença em algo que precise ser escondido.', xpPoints: 0 },
          { id: 'sing-3-5', subgroup: 'Rede de apoio', title: 'Quem realmente ajuda a sustentar a vida de vocês?', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788531063900-ef0fa661.jpg', description: 'Construa uma rede que respeite seu filho, compreenda limites e também ofereça apoio a quem cuida.', xpPoints: 0 },
          { id: 'sing-3-6', subgroup: 'Futuro', title: 'Quando a cabeça tenta viver hoje todas as preocupações do futuro', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788531099274-4d08100a.jpg', description: 'Cuide do que pode ser construído agora sem exigir respostas antecipadas para todas as fases da vida.', xpPoints: 0 },
          { id: 'sing-3-7', subgroup: 'Confiança parental', title: 'Você não precisa saber tudo para conhecer profundamente seu filho', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788531116128-722bea8b.jpg', description: 'Troque a busca por certeza pela confiança que nasce de observar, aprender, ajustar e caminhar junto.', xpPoints: 0 }
        ]
      }
    ]
  },

  {
    id: 'amor-escolhido',
    title: 'Amor Escolhido',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Adoção: construindo vínculos e pertencimento entre histórias que se encontram.',
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
        title: 'Antes do Encontro',
        lessons: [
          { id: 'ae-1-1', subgroup: 'Desejo', title: 'Por que eu quero adotar?', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788535762597-e3534c6b.jpg', description: 'Olhe para desejos, expectativas e medos antes de transformá-los em lugar para uma criança.', xpPoints: 0 },
          { id: 'ae-1-2', subgroup: 'Espera', title: 'Quando a espera começa a ocupar a vida inteira', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788535814259-43aee260.jpg', description: 'Atravesse a incerteza sem colocar relações, planos e o presente em suspensão.', xpPoints: 0 },
          { id: 'ae-1-3', subgroup: 'Expectativas', title: 'A criança que você imaginou e a criança que vai chegar', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788535865152-6a033421.jpg', description: 'Reconheça expectativas para que elas não ocupem o lugar de conhecer seu filho real.', xpPoints: 0 },
          { id: 'ae-1-4', subgroup: 'Preparação', title: 'Como se preparar para um encontro que você não controla?', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788535848416-ec43d95b.jpg', description: 'Troque a busca por um encontro perfeito pela disponibilidade para acolher o imprevisível.', xpPoints: 0 },
          { id: 'ae-1-5', subgroup: 'Transição', title: 'O encontro não transforma desconhecidos em família de uma hora para outra', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788535900885-03ff0755.jpg', description: 'Dê espaço para emoção, estranhamento e descoberta enquanto a convivência começa.', xpPoints: 0 }
        ]
      },
      {
        id: 'ae-mod-2',
        number: 2, 
        title: 'Construindo Família',
        lessons: [
          { id: 'ae-2-1', subgroup: 'Vínculo', title: 'O amor não precisa chegar pronto', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788537949121-863b35d8.jpg', description: 'Entenda como vínculo e confiança podem nascer da presença e dos cuidados repetidos no cotidiano.', xpPoints: 0 },
          { id: 'ae-2-2', subgroup: 'Segurança', title: 'Antes de confiar, seu filho pode precisar descobrir se você fica', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788538000238-425fdb90.jpg', description: 'Responda a testes, afastamentos e inseguranças com constância sem tomar cada reação como rejeição.', xpPoints: 0 },
          { id: 'ae-2-3', subgroup: 'Rotina', title: 'Quando a rotina começa a transformar um lugar em casa', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788538037956-27e79b7a.jpg', description: 'Use previsibilidade e repetição para criar segurança sem exigir adaptação imediata.', xpPoints: 0 },
          { id: 'ae-2-4', subgroup: 'Reorganização', title: 'A chegada muda o lugar de todo mundo na família', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788538063508-ae0b61be.jpg', description: 'Reorganize ritmos, casal, irmãos e responsabilidades sem esperar que todos se adaptem do mesmo jeito.', xpPoints: 0 },
          { id: 'ae-2-5', subgroup: 'Rede e limites', title: 'Nem toda ajuda ajuda: protegendo o começo da convivência', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788538137404-debf4367.jpg', description: 'Defina limites com familiares e amigos para preservar o tempo e a intimidade que o vínculo precisa.', xpPoints: 0 },
          { id: 'ae-2-6', subgroup: 'Pertencimento', title: 'Quando deixamos de estar nos conhecendo e começamos a nos sentir família?', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788538154823-295c6cce.jpg', description: 'Perceba o pertencimento nos pequenos sinais de confiança e intimidade que a convivência constrói.', xpPoints: 0 }
        ]
      },
      {
        id: 'ae-mod-3',
        number: 3, 
        title: 'Uma História Inteira',
        lessons: [
          { id: 'ae-3-1', subgroup: 'Origem e identidade', title: 'Seu filho chegou com uma história - e ela continua pertencendo a ele', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788541941863-3a268b9d.jpg', description: 'Integre origem, experiências e memórias à identidade da criança sem transformar o passado em ameaça.', xpPoints: 0 },
          { id: 'ae-3-2', subgroup: 'Conversa sobre adoção', title: 'Como falar sobre adoção enquanto seu filho cresce?', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788541967620-1147619b.jpg', description: 'Faça da adoção uma conversa contínua, verdadeira e adequada às perguntas de cada fase.', xpPoints: 0 },
          { id: 'ae-3-3', subgroup: 'Família de origem e afetos', title: 'Quando seu filho quer saber, lembrar ou falar de quem veio antes', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788541986651-c4d7bf95.jpg', description: 'Acolha curiosidade, saudade e outros vínculos sem transformar amor e pertencimento em uma escolha.', xpPoints: 0 },
          { id: 'ae-3-4', subgroup: 'Insegurança parental', title: 'Quando a história do seu filho desperta medo em você', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788542044255-74cd4b6a.jpg', description: 'Reconheça ciúme, insegurança ou receio sem pedir que seu filho proteja você desses sentimentos.', xpPoints: 0 },
          { id: 'ae-3-5', subgroup: 'Privacidade', title: 'A história do seu filho não precisa responder à curiosidade dos outros', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788542061109-17bb4ce1.jpg', description: 'Proteja sua privacidade e ensine que ele pode escolher o que contar, para quem e quando.', xpPoints: 0 },
          { id: 'ae-3-6', subgroup: 'Continuidade', title: 'Nossa família não começou no mesmo lugar - e isso também é nossa história', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788542099704-7a7df0af.jpg', description: 'Construa pertencimento sem apagar capítulos anteriores nem exigir que todos contem a mesma versão da família.', xpPoints: 0 }
        ]
      }
    ]
  },

  {
    id: 'novos-caminhos',
    title: 'Novos Caminhos',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Filhos adultos e ninho vazio: novos jeitos de estar perto e seguir seu caminho.',
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
        title: 'Quando Eles Seguem Seus Caminhos',
        lessons: [
          { id: 'nc-1-1', subgroup: 'Fim de ciclo', title: 'Quando a casa muda e um ciclo termina', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545722137-7756f700.jpg', description: 'Entenda por que a saída dos filhos transforma muito mais do que a rotina da casa.', xpPoints: 0 },
          { id: 'nc-1-2', subgroup: 'Sentimentos misturados', title: 'Orgulho e saudade podem morar juntos', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545705353-8d070b4a.jpg', description: 'Acolha sentimentos diferentes sem transformar tristeza em falta de apoio aos filhos.', xpPoints: 0 },
          { id: 'nc-1-3', subgroup: 'Papel parental', title: 'Quando você sente falta de ser necessário', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545740476-0bf170ad.jpg', description: 'Perceba como a independência dos filhos também mexe com o lugar que você ocupava.', xpPoints: 0 },
          { id: 'nc-1-4', subgroup: 'Identidade', title: 'Quem sou eu quando meu papel de pai ou mãe muda?', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545758066-88000490.jpg', description: 'Reconheça quem você é além das funções de cuidado que organizaram tantos anos da vida.', xpPoints: 0 },
          { id: 'nc-1-5', subgroup: 'Espaços e memórias', title: 'O que fazer com o quarto, os objetos e os espaços que ficaram?', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545783658-da353483.jpg', description: 'Encontre seu próprio tempo para decidir o que preservar, transformar ou simplesmente deixar.', xpPoints: 0 },
          { id: 'nc-1-6', subgroup: 'Preocupação', title: 'Quando a preocupação continua, mesmo com os filhos longe', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545798918-7d2deeac.jpg', description: 'Diferencie cuidado de ansiedade quando você já não acompanha de perto cada detalhe.', xpPoints: 0 },
          { id: 'nc-1-7', subgroup: 'Soltar', title: 'Soltar não é deixar de cuidar', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnailUrl: 'https://mixedzmkjfzumeimfkfz.supabase.co/storage/v1/object/public/user-media/community/1788545817227-547a683a.jpg', description: 'Descubra por que dar espaço pode ser uma nova forma de confiança e presença.', xpPoints: 0 }
        ]
      },
      {
        id: 'nc-mod-2',
        number: 2, 
        title: 'Encontrando Novos Caminhos',
        lessons: [
          { id: 'nc-2-1', subgroup: 'Tempo e identidade', title: 'O que fazer com o tempo que voltou a ser seu?', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Experimente o espaço que surgiu sem a obrigação de preenchê-lo ou reinventar a vida depressa.', xpPoints: 0 },
          { id: 'nc-2-2', subgroup: 'Desejos e projetos', title: 'Você não precisa voltar a ser quem era antes dos filhos', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Reencontre interesses e desejos de hoje, mesmo que sejam diferentes dos seus planos antigos.', xpPoints: 0 },
          { id: 'nc-2-3', subgroup: 'Casal e relações', title: 'E agora, quem somos nós além de pais e mães?', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Redescubra conversas, intimidade, amizades e relações que podem ganhar novas formas.', xpPoints: 0 },
          { id: 'nc-2-4', subgroup: 'Novo papel parental', title: 'De quem resolve para quem acompanha', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Aprenda a continuar sendo referência sem assumir a direção da vida do seu filho adulto.', xpPoints: 0 },
          { id: 'nc-2-5', subgroup: 'Presença', title: 'Ligar, visitar, perguntar: qual é a nova medida da presença?', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Construa proximidade respeitando o espaço, o ritmo e a vida que seu filho está criando.', xpPoints: 0 },
          { id: 'nc-2-6', subgroup: 'Ajuda e autonomia', title: 'Quando ajudar começa a virar interferência', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Reconheça quando apoiar fortalece e quando é hora de deixar a decisão nas mãos dele.', xpPoints: 0 },
          { id: 'nc-2-7', subgroup: 'Escolhas e novos vínculos', title: 'A vida dele pode ser diferente da que você imaginou', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Sustente o vínculo diante de escolhas, parceiros e caminhos que talvez não fossem os seus.', xpPoints: 0 },
          { id: 'nc-2-8', subgroup: 'Porto seguro', title: 'A casa como porto seguro, não como âncora', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Continue oferecendo pertencimento sem fazer da proximidade uma condição para o amor.', xpPoints: 0 }
        ]
      }
    ]
  },

  {
    id: 'depois-do-silencio',
    title: 'Depois do Silêncio',
    subtitle: 'Jornadas que Transformam',
    tagline: 'Luto parental: um espaço para a saudade, a memória e o continuar no seu tempo.',
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
        title: 'Quando o Mundo Para',
        lessons: [
          { id: 'dds-1-1', subgroup: 'Descompasso', title: 'Quando parece que o mundo continuou - menos o seu', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Acolha o estranhamento de ver a vida seguir quando a sua parece ter parado.', xpPoints: 0 },
          { id: 'dds-1-2', subgroup: 'Luto sem manual', title: 'Não existe um jeito certo nem um tempo certo para viver o luto', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Deixe de medir sua dor por etapas, prazos ou expectativas de outras pessoas.', xpPoints: 0 },
          { id: 'dds-1-3', subgroup: 'Sentimentos', title: 'Quando você sente coisas que parecem não combinar com a saudade', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Abra espaço para raiva, silêncio, riso ou cansaço sem julgar o que sente.', xpPoints: 0 },
          { id: 'dds-1-4', subgroup: 'Culpa', title: 'A culpa e as perguntas que continuam procurando uma resposta', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Acolha os “e se...” sem exigir de si respostas que talvez não existam.', xpPoints: 0 },
          { id: 'dds-1-5', subgroup: 'Corpo', title: 'Quando o corpo também sente o peso de tudo o que aconteceu', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Perceba como o luto atravessa energia, sono e cotidiano sem cobrar normalidade.', xpPoints: 0 },
          { id: 'dds-1-6', subgroup: 'Rotina', title: 'Quando a rotina perde o sentido e os horários parecem vazios', duration: '15 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Atravesse pequenas partes do dia sem precisar reconstruir tudo de uma vez.', xpPoints: 0 },
          { id: 'dds-1-7', subgroup: 'Objetos e espaços', title: 'Roupas, fotos, o quarto: quando os objetos passam a dizer tanta coisa', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Encontre seu próprio tempo para guardar, mudar, tocar ou simplesmente deixar como está.', xpPoints: 0 },
          { id: 'dds-1-8', subgroup: 'Linguagem', title: 'Quando você não consegue responder à pergunta “como você está?”', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Encontre palavras e limites para os momentos em que explicar parece impossível.', xpPoints: 0 },
          { id: 'dds-1-9', subgroup: 'Um dia de cada vez', title: 'Hoje pode ser só hoje: quando pensar no futuro parece grande demais', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Diminua a medida do tempo e atravesse o que for possível neste dia.', xpPoints: 0 }
        ]
      },
      {
        id: 'dds-mod-2',
        number: 2, 
        title: 'O Amor que Permanece',
        lessons: [
          { id: 'dds-2-1', subgroup: 'Ausência', title: 'A ausência também ocupa espaço na casa, na rotina e nas lembranças', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Reconheça as formas como quem não está continua presente na vida da família.', xpPoints: 0 },
          { id: 'dds-2-2', subgroup: 'Nome e memória', title: 'Falar o nome do seu filho não faz a dor existir - ela já está aí', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Abra espaço para lembrar e falar sem tratar a memória como algo a evitar.', xpPoints: 0 },
          { id: 'dds-2-3', subgroup: 'Lembranças', title: 'Fotos, objetos e lembranças: cada família encontra o seu jeito', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Guarde, transforme ou espere sem precisar seguir uma regra para preservar memórias.', xpPoints: 0 },
          { id: 'dds-2-4', subgroup: 'Rituais', title: 'Encontrando maneiras de manter a memória presente sem criar obrigação', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Crie gestos e rituais que façam sentido para vocês, no tempo em que fizer sentido.', xpPoints: 0 },
          { id: 'dds-2-5', subgroup: 'Casal', title: 'Quando cada um sofre de um jeito e parece estar em lugares diferentes', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Reconheça formas diferentes de sentir sem medir o amor pela maneira de demonstrar.', xpPoints: 0 },
          { id: 'dds-2-6', subgroup: 'Relação', title: 'Quando a dor afasta justamente quem mais precisava estar perto', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', description: 'Procure pequenos caminhos de encontro sem exigir que vocês sofram do mesmo jeito.', xpPoints: 0 },
          { id: 'dds-2-7', subgroup: 'Irmãos', title: 'Os irmãos também perderam alguém - e vivem uma história só deles', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', description: 'Acolha a dor dos outros filhos sem esperar que ela se pareça com a sua.', xpPoints: 0 },
          { id: 'dds-2-8', subgroup: 'Mundo ao redor', title: 'Quando as pessoas não sabem o que dizer e algumas palavras machucam', duration: '16 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', description: 'Crie limites para frases e situações que não ajudam, mesmo quando há boa intenção.', xpPoints: 0 },
          { id: 'dds-2-9', subgroup: 'Rede de apoio', title: 'Quem consegue ficar perto quando você não precisa parecer bem?', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', description: 'Reconheça pessoas capazes de oferecer presença sem tentar consertar a sua dor.', xpPoints: 0 }
        ]
      },
      {
        id: 'dds-mod-3',
        number: 3, 
        title: 'Continuar, do Seu Jeito',
        lessons: [
          { id: 'dds-3-1', subgroup: 'Datas', title: 'Quando uma data importante chega antes de você se sentir pronto', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', description: 'Atravesse aniversários e celebrações do jeito que for possível para você.', xpPoints: 0 },
          { id: 'dds-3-2', subgroup: 'Retorno ao cotidiano', title: 'Quando voltar ao trabalho, aos amigos ou ao mundo parece estranho', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', description: 'Dê pequenos passos de volta ao cotidiano sem cobrar que tudo pareça normal.', xpPoints: 0 },
          { id: 'dds-3-3', subgroup: 'Culpa e alegria', title: 'Quando um momento bom aparece e logo depois vem a culpa', duration: '17 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', description: 'Permita que algum bem-estar exista sem tratá-lo como uma traição à memória.', xpPoints: 0 },
          { id: 'dds-3-4', subgroup: 'Identidade parental', title: 'Quem sou eu agora? As perguntas sobre continuar sendo pai ou mãe', duration: '21 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', description: 'Acolha uma identidade parental que continua existindo e também precisa mudar de forma.', xpPoints: 0 },
          { id: 'dds-3-5', subgroup: 'Gatilhos e marcos', title: 'Quando outras famílias e novos marcos fazem a ausência aparecer', duration: '19 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', description: 'Reconheça a saudade diante das vidas e possibilidades que continuam ao redor.', xpPoints: 0 },
          { id: 'dds-3-6', subgroup: 'Novos passos', title: 'Dar novos passos não significa deixar seu filho para trás', duration: '18 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', description: 'Permita que a vida se mova sem transformar movimento em esquecimento.', xpPoints: 0 },
          { id: 'dds-3-7', subgroup: 'Vida e saudade', title: 'A vida pode voltar a crescer ao redor da saudade', duration: '22 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackBranding.mp4', description: 'Descubra espaço para outras experiências sem exigir que a saudade desapareça.', xpPoints: 0 },
          { id: 'dds-3-8', subgroup: 'Esperança', title: 'A luz que retorna devagar: esperança sem pressa e sem euforia', duration: '20 min', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', description: 'Reconheça pequenos espaços de presença e vida sem exigir que os dias difíceis acabem.', xpPoints: 0 }
        ]
      }
    ]
  }
];
