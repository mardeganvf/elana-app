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
