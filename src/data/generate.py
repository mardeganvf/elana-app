import json, random

authors = [
    {'id': 'u-1', 'name': 'Mariana Costa', 'avatar': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', 'role': 'guia'},
    {'id': 'u-2', 'name': 'Carlos Mendes', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'role': 'guia'},
    {'id': 'u-3', 'name': 'Melina Curadoria', 'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'role': 'curadoria'},
    {'id': 'u-4', 'name': 'Camila Fernandes', 'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-5', 'name': 'Beatriz Lima', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-6', 'name': 'Thiago Oliveira', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-7', 'name': 'Renata Castro', 'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-8', 'name': 'Gisele Santos', 'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-9', 'name': 'Marcelo Ribeiro', 'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-10', 'name': 'Patricia & Roberto', 'avatar': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-11', 'name': 'Luciana Ferreira', 'avatar': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-12', 'name': 'Vanessa Alencar', 'avatar': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-13', 'name': 'Rodrigo Prado', 'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-14', 'name': 'Fernanda Vasconcelos', 'avatar': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80', 'role': 'membro'},
    {'id': 'u-15', 'name': 'Eduardo Silveira', 'avatar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', 'role': 'membro'}
]

journeys = ['pais-recem-nascidos', 'construindo-pontes', 'singular', 'amor-escolhido', 'novos-caminhos', 'depois-do-silencio']
intentions = ['ajuda', 'desabafar', 'celebrar']
transversal_rooms = ['boas-vindas', 'confessionario', 'cantinho-mel', 'espaco-dois', 'cuidando-quem-cuida']
age_brackets = ['0-2', '3-6', '7-10', '11-14', '15-18', '18-plus']
reaction_keys = ['estou_aqui', 'vai_dar_certo', 'que_alivio', 'aqui_tambem', 'mandou_bem', 'ajudou_muito', 'alegria']

titles_and_contents = [
    # Pais Recém Nascidos
    ('O cansaço da madrugada e a rotina do sono', 'Meninas, hoje às 3h da manhã eu só conseguia chorar enquanto o bebê mamava. Como vocês conseguem reorganizar o sono sem surtar?', 'pais-recem-nascidos', 'desabafar'),
    ('Primeiro dente nascendo e febrezinha', 'O primeiro dentinho começou a rasgar a gengiva por aqui. Alguém tem dicas naturais de alívio além do mordedor gelado?', 'pais-recem-nascidos', 'ajuda'),
    ('Conquistamos 7 horas de sono direto!', 'Gente, não estou acreditando! Pela primeira vez em 5 meses conseguimos dormir 7 horas seguidas. Há esperança no fim do túnel!', 'pais-recem-nascidos', 'celebrar'),
    ('Como conciliar a volta ao trabalho pós-maternidade?', 'Faltam 2 semanas para minha licença acabar e um nó se forma na garganta só de pensar em deixar meu filho com a berçarista.', 'pais-recem-nascidos', 'desabafar'),
    ('A participação do pai no banho da noite', 'Criamos o ritual do banho com o pai todas as noites e isso mudou a dinâmica da nossa casa. O vínculo cresceu demais!', 'pais-recem-nascidos', 'celebrar'),

    # Construindo Pontes (Adolescência)
    ('Meu filho de 15 anos só responde com monosílabos', 'Entro no quarto pra conversar e recebo apenas um "uhum" ou "tá". Como criar pontes de diálogo sem parecer interrogatório?', 'construindo-pontes', 'ajuda'),
    ('Consegui uma conversa profunda de 40 minutos no carro!', 'Aproveitei uma viagem curta só nos dois e ele abriu o coração sobre os medos da escola. Que vitória linda!', 'construindo-pontes', 'celebrar'),
    ('O medo do acesso irrestrito às redes sociais', 'Estabelecemos limites de tela e recolhemos os celulares às 22h. Houve chiado no começo, mas a paz voltou à casa.', 'construindo-pontes', 'ajuda'),
    ('A dor de ver o filho crescer e procurar distância', 'É natural eles quererem o espaço deles, mas dói a transição de herói para apenas o pai que paga as contas.', 'construindo-pontes', 'desabafar'),

    # Singular (Desenvolvimento Atípico)
    ('O diagnóstico do TEA e a sensação de alívio e medo', 'Recebemos o laudo do neuro hoje. Um misto de alívio por finalmente entender como ajudá-lo e ansiedade pelo futuro.', 'singular', 'desabafar'),
    ('Primeira palavra falada espontaneamente aos 4 anos!', 'Ele olhou nos meus olhos e disse "água" sem precisar de prancha de comunicação. Chorei de emoção!', 'singular', 'celebrar'),
    ('Dicas de estimulação sensorial em casa', 'Compartilhando uma caixa tátil que fiz com arroz colorido e texturas que ajudou muito nas crises de desregulação.', 'singular', 'ajuda'),
    ('A busca por uma escola verdadeiramente inclusiva', 'Depois de passar por 3 recusas disfarçadas, finalmente encontramos uma equipe pedagógica de braços abertos.', 'singular', 'celebrar'),

    # Amor Escolhido (Adoção)
    ('A ansiedade da fila de habilitação', 'Estamos há 1 ano e 8 meses na fila. Cada toque do telefone faz o coração disparar. Como lidar com a espera?', 'amor-escolhido', 'desabafar'),
    ('O primeiro "mãe" dito do fundo do coração', 'Hoje na pracinha ele se assustou com um cachorro e correu gritando "mãe, me segura!". A vinculação é real!', 'amor-escolhido', 'celebrar'),
    ('Como responder perguntas indiscretas de parentes?', 'Sempre surgem comentários insensíveis sobre a história biológica. Qual a melhor resposta elegante?', 'amor-escolhido', 'ajuda'),

    # Novos Caminhos (Ninho Vazio)
    ('O silêncio da casa depois que a última filha foi pra faculdade', 'A casa parece grande demais. Os quartos organizados demais. Redescobrindo quem eu sou além da maternidade.', 'novos-caminhos', 'desabafar'),
    ('Nossa primeira viagem a dois depois de 25 anos!', 'Redescobrindo a namorada e o marido. O ninho vazio também abre espaço para novos horizontes incríveis!', 'novos-caminhos', 'celebrar'),

    # Depois do Silêncio (Luto Parental)
    ('Hoje meu anjo completaria 3 anos', 'Acordei com o peito apertado. Acendi uma vela e olhei o céu. A saudade não passa, mas o amor permanece infinito.', 'depois-do-silencio', 'desabafar'),
    ('Um abraço apertado em cada mãe que chora em silêncio', 'Se você está passando por datas difíceis esta semana, saiba que seu filho é lembrado com todo o carinho e honra.', 'depois-do-silencio', 'celebrar'),

    # Transversais
    ('Confissão: às vezes me tranco no banheiro só pra ter 5 min de silêncio', 'Sem celular, sem cobrança, só fechando os olhos e respirando. Alguém mais faz isso?', 'confessionario', 'desabafar'),
    ('🍯 Dúvida para a Melina: Como criar rotinas sem rigidez punitiva?', 'Melina, adoraria ver um post seu sobre como ter limites claros mantendo o acolhimento afetivo.', 'cantinho-mel', 'ajuda'),
    ('Como manter a chama do relacionamento acesa após os filhos?', 'Quais pequenos rituais diários vocês usam pra não deixar o casamento virar apenas sociedade de criação?', 'espaco-dois', 'ajuda'),
    ('Autocuidado não é luxo: minha caminhada de 20 min pela manhã', 'Comecei a acordar 30 min antes de todos pra tomar café quente e caminhar. Minha paciência no dia quadruplicou!', 'cuidando-quem-cuida', 'celebrar')
]

comments_pool = [
    'Te acolho profundamente. O que você está sentindo é 100% legítimo e compreensível.',
    'Aqui em casa passamos exatamente por isso! O tempo e a consistência trazem a leveza de volta.',
    'Que relato lindo e emocionante! Obrigado por compartilhar com tanta generosidade.',
    'Um abraço bem apertado no seu coração. Você é uma mãe/pai extraordinário!',
    'Essa dica do banho/rotina salvou nossas noites por aqui também. Que alegria ver o avanço!',
    'Respira fundo. O processo de criação é cheio de altos e baixos, mas estamos juntos nessa jornada.',
    'Me identifiquei em cada palavra. É um alívio saber que não estou sozinha nesse sentimento.',
    'Parabéns por essa conquista maravilhosa! Cada pequeno avanço merece ser celebrado com festa.',
    'Como guia da comunidade, reforço que a paciência com você mesma é o melhor presente para sua família.',
    'Excelente reflexão. Vou colocar essa prática em teste hoje mesmo com meus filhos!'
]

posts = []
total_comments = 0
total_reactions = 0

for i in range(120):
    t_idx = i % len(titles_and_contents)
    item = titles_and_contents[t_idx]
    author = random.choice(authors)
    
    is_anon = False
    if item[2] == 'confessionario':
        is_anon = True
        author_name = f'Luz em Aprendizado #{random.randint(100, 999)}'
        author_avatar = 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80'
    else:
        author_name = author['name']
        author_avatar = author['avatar']

    sens = 'padrao'
    if item[2] in ['singular', 'amor-escolhido', 'espaco-dois']:
        sens = 'elevado'
    elif item[2] in ['depois-do-silencio', 'confessionario']:
        sens = 'critico'

    num_comments = random.randint(5, 10)
    comments = []
    for c_i in range(num_comments):
        total_comments += 1
        c_author = random.choice(authors)
        comments.append({
            'id': f'comm-{i}-{c_i}',
            'authorId': c_author['id'],
            'authorName': c_author['name'],
            'authorAvatar': c_author['avatar'],
            'authorRole': c_author['role'],
            'content': random.choice(comments_pool),
            'createdAt': f'Há {random.randint(1, 23)} horas'
        })

    reactions = {rk: random.randint(5, 48) for rk in random.sample(reaction_keys, k=random.randint(4, 7))}
    total_reactions += sum(reactions.values())

    p_data = {
        'id': f'post-mass-{i+1}',
        'title': f'{item[0]} (#{i+1})' if i >= len(titles_and_contents) else item[0],
        'content': item[1],
        'authorId': author['id'],
        'authorName': author_name,
        'authorAvatar': author_avatar,
        'authorRole': author['role'],
        'isAnonymous': is_anon,
        'sensitivityLevel': sens,
        'createdAt': f'Há {random.randint(1, 5)} dias',
        'reactions': reactions,
        'userReactions': {},
        'comments': comments
    }

    if item[2] in journeys:
        p_data['journeyId'] = item[2]
        p_data['emotionalIntention'] = item[3]
    elif item[2] in transversal_rooms:
        p_data['transversalRoomId'] = item[2]
    else:
        p_data['ageBracketId'] = random.choice(age_brackets)

    posts.append(p_data)

ts_content = f"import {{ CommunityPost }} from '../types';\n\nexport const MASSIVE_POSTS: CommunityPost[] = {json.dumps(posts, ensure_ascii=False, indent=2)};\n"

with open('/Users/vitormardegan/Desktop/Elana/05. App/src/data/massivePostsData.ts', 'w') as f:
    f.write(ts_content)

print(f"SUCCESS: Generated {len(posts)} posts with {total_comments} comments and {total_reactions} reactions! TOTAL = {len(posts) + total_comments + total_reactions}")
