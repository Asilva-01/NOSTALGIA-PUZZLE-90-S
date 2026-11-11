export { LICENSE_ORIGIN_PHRASE as LICENSE_ORIGIN } from '../packages/content-manager/src/schema.ts';
import type { Difficulty } from '../packages/content-manager/src/schema.ts';
import type { PieceCount } from '@puzzle-universe/puzzle-engine';

export type Lote2Entry = {
  id: string;
  slug: string;
  app: 'nostalgia' | 'bible';
  file: string;
  name: string;
  collection: string;
  description: string;
  recommendedLevel: number;
  difficulty: Difficulty;
  defaultPieceCount: PieceCount;
  unlock: { type: 'phase'; phase: number };
  story?: {
    title: string;
    summary: string;
    reference: string;
    message: string;
    curiosity: string;
  };
};

export const LICENSE_DATE = '2026-11-11';

export const LOTE2_ENTRIES: Lote2Entry[] = [
  {
    id: 'orelhao',
    slug: 'orelhao',
    app: 'nostalgia',
    file: 'nostalgia/11-orelhao.jpg',
    name: 'Orelhão na calçada',
    collection: 'Cotidiano dos anos 90',
    description:
      'Calçada portuguesa, orelhão laranja sem marca e a fila do telefonema depois da escola. Padaria ao fundo com toldo liso, bicicleta e cachorro — rua brasileira, nenhum logo.',
    recommendedLevel: 11,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 11 },
  },
  {
    id: 'pipas',
    slug: 'pipas',
    app: 'nostalgia',
    file: 'nostalgia/12-pipas.jpg',
    name: 'Pipas no terreno baldio',
    collection: 'Lazer dos anos 90',
    description:
      'Terreno de terra vermelha, muro de bloco e o céu cheio de pipas geométricas. Crianças correm com a linha — sem desenho de franquia na rabiola, só cor e vento.',
    recommendedLevel: 12,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 12 },
  },
  {
    id: 'lanchonete',
    slug: 'lanchonete',
    app: 'nostalgia',
    file: 'nostalgia/13-lanchonete.jpg',
    name: 'Lanchonete de esquina',
    collection: 'Cotidiano dos anos 90',
    description:
      'Balcão de fórmica, coxinha, pastel e refrigerante em garrafa sem rótulo. Banquinho giratório, ventilador de teto e jukebox com painel geométrico — esquina sem marca.',
    recommendedLevel: 13,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 13 },
  },
  {
    id: 'shopping',
    slug: 'shopping',
    app: 'nostalgia',
    file: 'nostalgia/14-shopping.jpg',
    name: 'Shopping dos anos 90',
    collection: 'Lazer dos anos 90',
    description:
      'Átrio com fonte, elevador de vidro e vitrines de lojas genéricas. Sorvete no copinho, claraboia e gente no corrimão — shopping inventado, nenhuma fachada famosa.',
    recommendedLevel: 14,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 14 },
  },
  {
    id: 'clube-piscina',
    slug: 'clube-piscina',
    app: 'nostalgia',
    file: 'nostalgia/15-clube-piscina.jpg',
    name: 'Clube com piscina e toboágua',
    collection: 'Lazer dos anos 90',
    description:
      'Piscina turquesa, toboágua colorido e cadeira de praia. Crianças no splash, quiosque de suco sem logo e palmeira — domingo de clube, sem parque temático de franquia.',
    recommendedLevel: 15,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 15 },
  },
  {
    id: 'feira-livre',
    slug: 'feira-livre',
    app: 'nostalgia',
    file: 'nostalgia/16-feira-livre.jpg',
    name: 'Feira livre',
    collection: 'Cotidiano dos anos 90',
    description:
      'Barracas de lona listrada, banana pendurada, peixe no gelo e flor. Sacola na mão da criança, paralelepípedo e o cheiro da manhã — feira sem placa escrita.',
    recommendedLevel: 16,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 16 },
  },
  {
    id: 'aniversario',
    slug: 'aniversario',
    app: 'nostalgia',
    file: 'nostalgia/17-aniversario.jpg',
    name: 'Aniversário com bolo de brigadeiro',
    collection: 'Festas dos anos 90',
    description:
      'Sala enfeitada, bolo de brigadeiro sem letra, balão e chapéu de festa. Crianças ao redor da mesa, serpentinas e uma pinhata em estrela geométrica — festa caseira original.',
    recommendedLevel: 17,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 17 },
  },
  {
    id: 'cinema-bairro',
    slug: 'cinema-bairro',
    app: 'nostalgia',
    file: 'nostalgia/18-cinema-bairro.jpg',
    name: 'Cinema de bairro',
    collection: 'Lazer dos anos 90',
    description:
      'Marquise de lâmpadas, cartazes em branco com arte geométrica e a fila da pipoca. Bilheteria de madeira, carro antigo na rua — nenhum filme real no letreiro.',
    recommendedLevel: 18,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 18 },
  },
  {
    id: 'rolima',
    slug: 'rolima',
    app: 'nostalgia',
    file: 'nostalgia/19-rolima.jpg',
    name: 'Carrinho de rolimã',
    collection: 'Esporte dos anos 90',
    description:
      'Ladeira de paralelepípedo, carrinho de madeira com rolamento e capacete de panela. Cachorro correndo atrás, casas no morro — descida de fim de tarde, sem marca de skate shop.',
    recommendedLevel: 19,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 19 },
  },
  {
    id: 'gude',
    slug: 'gude',
    app: 'nostalgia',
    file: 'nostalgia/20-gude.jpg',
    name: 'Bolinha de gude na calçada',
    collection: 'Cotidiano dos anos 90',
    description:
      'Círculo de giz no mosaico português, bolinhas de vidro coloridas e mochila jogada no canto. Crianças agachadas no jogo — detalhe miúdo, contraste alto, nenhuma figurinha de franquia.',
    recommendedLevel: 20,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 20 },
  },
  {
    id: 'radio-fm',
    slug: 'radio-fm',
    app: 'nostalgia',
    file: 'nostalgia/21-radio-fm.jpg',
    name: 'Rádio FM no quarto',
    collection: 'Cotidiano dos anos 90',
    description:
      'Rádio-gravador grande com sintonizador analógico, fitas sem rótulo escrito e posters geométricos. Adolescente dança no tapete — aparelho genérico, nenhum logo de fabricante.',
    recommendedLevel: 21,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 21 },
  },
  {
    id: 'skate-praca',
    slug: 'skate-praca',
    app: 'nostalgia',
    file: 'nostalgia/22-skate-praca.jpg',
    name: 'Skate na praça',
    collection: 'Esporte dos anos 90',
    description:
      'Praça de concreto, shape pintado em geométrico sem marca e banco de praça. Fonte, mosaico e o salto no meio da tarde — original, sem logo de marca de skate.',
    recommendedLevel: 22,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 22 },
  },
  {
    id: 'casa-avo',
    slug: 'casa-avo',
    app: 'nostalgia',
    file: 'nostalgia/23-casa-avo.jpg',
    name: 'Casa da avó',
    collection: 'Cotidiano dos anos 90',
    description:
      'Cozinha-sala com renda, sofá encapado e a avó no fogão. Mangueira no quintal vista pela janela, gato no balcão, neto na cadeira — casa de verdade, sem mascote de desenho na parede.',
    recommendedLevel: 23,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 23 },
  },
  {
    id: 'padaria',
    slug: 'padaria',
    app: 'nostalgia',
    file: 'nostalgia/24-padaria.jpg',
    name: 'Padaria da esquina',
    collection: 'Cotidiano dos anos 90',
    description:
      'Balcão de vidro com pão francês, leite e café. Padeiro de touca, criança com moedas e azulejo até o teto — manhã de padaria, toldo liso, nenhum nome de padaria escrita.',
    recommendedLevel: 24,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 24 },
  },
  {
    id: 'acampamento',
    slug: 'acampamento',
    app: 'nostalgia',
    file: 'nostalgia/25-acampamento.jpg',
    name: 'Acampamento de férias',
    collection: 'Lazer dos anos 90',
    description:
      'Barracas entre eucaliptos, fogueira, lanterna e canoa no lago. Céu começando a estrelar, cabana simples ao fundo — colônia de férias inventada, sem logo de acampamento famoso.',
    recommendedLevel: 25,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 25 },
  },
  {
    id: 'noe-arca',
    slug: 'noe-arca',
    app: 'bible',
    file: 'bible/11-noe-arca.jpg',
    name: 'Noé e a arca',
    collection: 'Noé e a arca',
    description:
      'Arca de madeira enorme, pares de animais fofos e o arco-íris depois da chuva. Família de Noé na rampa — livro infantil, sem dilúvio assustador.',
    recommendedLevel: 11,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 11 },
    story: {
      title: 'A arca e o recomeço',
      summary:
        'Noé constrói a arca, a família e os animais entram, a chuva passa e um arco-íris assina a promessa de recomeçar a terra com cuidado.',
      reference: 'Gênesis 6–9',
      message: 'Cuidar da vida — gente e bicho — é parte da aliança, não um detalhe da história.',
      curiosity:
        'A arca do texto é um baú enorme de madeira (tebah), mais caixa do que barco de filme. O arco-íris entra como sinal, não como enfeite.',
    },
  },
  {
    id: 'abraao-estrelas',
    slug: 'abraao-estrelas',
    app: 'bible',
    file: 'bible/12-abraao-estrelas.jpg',
    name: 'Abraão e as estrelas',
    collection: 'Abraão',
    description:
      'Noite no deserto, tenda, fogueira e Abraão olhando o céu cheio de estrelas. Sara à entrada — promessa quieta, aquarela de livro.',
    recommendedLevel: 12,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 12 },
    story: {
      title: 'Conta as estrelas',
      summary:
        'Deus leva Abraão para fora da tenda e pede que olhe o céu: a descendência será como as estrelas — uma promessa grande para um homem ainda sem filho.',
      reference: 'Gênesis 15',
      message: 'Tem promessa que cabe no bolso de ninguém; a gente só consegue olhar para cima e confiar.',
      curiosity:
        'No deserto sem poluição luminosa, a Via Láctea é um rio. O texto usa o céu que Abraão realmente via — incontável de verdade.',
    },
  },
  {
    id: 'jose-manto',
    slug: 'jose-manto',
    app: 'bible',
    file: 'bible/13-jose-manto.jpg',
    name: 'José do Egito (manto)',
    collection: 'José do Egito',
    description:
      'José menino de manto listrado colorido entre os irmãos, poço ao fundo, ovelhas e camelos. Cena de ciúme e escolha, sem violência explícita.',
    recommendedLevel: 13,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 13 },
    story: {
      title: 'O manto e os irmãos',
      summary:
        'Jacó presenteia José com um manto especial. Os irmãos se irritam, e o presente vira o início de uma viagem longa até o Egito — e até o perdão.',
      reference: 'Gênesis 37',
      message: 'Ciúme parte família. O fim da história de José mostra que dá para costurar de novo.',
      curiosity:
        'O “manto de muitas cores” pode ter sido uma túnica de mangas longas, marca de quem não ia para o campo. O presente dizia status, não só moda.',
    },
  },
  {
    id: 'sarca-ardente',
    slug: 'sarca-ardente',
    app: 'bible',
    file: 'bible/14-sarca-ardente.jpg',
    name: 'Sarça ardente',
    collection: 'Moisés',
    description:
      'Arbusto em chamas douradas que não se consome, Moisés tirando as sandálias, ovelhas e monte ao fundo. Luz quente de livro infantil.',
    recommendedLevel: 14,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 14 },
    story: {
      title: 'O arbusto que não se apaga',
      summary:
        'Moisés pastoreia no deserto e vê um arbusto em fogo que não queima. Tira as sandálias: o chão é santo, e o recado é libertar o povo.',
      reference: 'Êxodo 3',
      message: 'Às vezes o chamado começa parado, descalço, prestando atenção no que já estava ali.',
      curiosity:
        'Sarça é um arbusto espinhoso do deserto. O milagre não é o fogo em si — é a planta continuar viva no meio dele.',
    },
  },
  {
    id: 'jerico',
    slug: 'jerico',
    app: 'bible',
    file: 'bible/15-jerico.jpg',
    name: 'Muralhas de Jericó',
    collection: 'Josué',
    description:
      'Muros altos de pedra, sacerdotes com shofares, o povo em volta e uma rachadura luminosa. Queda suave, sem batalha sangrenta.',
    recommendedLevel: 15,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 15 },
    story: {
      title: 'Sete voltas e o muro',
      summary:
        'O povo marcha ao redor de Jericó, os sacerdotes tocam as trombetas e, no sétimo dia, o muro cai. A vitória não vem de um exército barulhento de filme.',
      reference: 'Josué 6',
      message: 'Tem muralha que não cai na força — cai quando a gente insiste no passo certo juntos.',
      curiosity:
        'Jericó é das cidades habitadas mais antigas do mundo. O texto fala em shofar, trombeta de chifre, não em fanfarra de metal.',
    },
  },
  {
    id: 'rute-noemi',
    slug: 'rute-noemi',
    app: 'bible',
    file: 'bible/16-rute-noemi.jpg',
    name: 'Rute e Noemi',
    collection: 'Antigo Testamento',
    description:
      'Estrada de colheita, campo de cevada dourada e duas mulheres caminhando juntas. Aldeia ao fundo, pôr do sol — lealdade em aquarela.',
    recommendedLevel: 16,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 16 },
    story: {
      title: 'Onde fores, irei',
      summary:
        'Noemi perde marido e filhos e manda as noras voltarem para casa. Rute recusa: vai com ela para Belém, e as duas recomeçam no campo de cevada.',
      reference: 'Rute 1',
      message: 'Família também é quem escolhe ficar quando seria mais fácil ir embora.',
      curiosity:
        'Rute era moabita, estrangeira. A bisneta de uma “de fora” entra na árvore de Davi — o livro inteiro é sobre acolher quem veio de longe.',
    },
  },
  {
    id: 'ester',
    slug: 'ester',
    app: 'bible',
    file: 'bible/17-ester.jpg',
    name: 'Ester',
    collection: 'Antigo Testamento',
    description:
      'Salão dourado com colunas, Ester em traje simples e elegante diante do rei. Tom de livro infantil, coragem quieta, sem palácio de filme adulto.',
    recommendedLevel: 17,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 17 },
    story: {
      title: 'Para um tempo como este',
      summary:
        'Ester, rainha no palácio da Pérsia, arrisca a vida ao se aproximar do rei para defender o seu povo. Coragem com medo, não coragem de cartaz.',
      reference: 'Ester 4–7',
      message: 'Às vezes o lugar em que a gente está não é acaso — é o lugar de falar por quem não entra na sala.',
      curiosity:
        'O livro de Ester é um dos dois da Bíblia hebraica com nome de mulher (o outro é Rute). Deus não é citado diretamente; a providência aparece nas viradas da história.',
    },
  },
  {
    id: 'salomao-templo',
    slug: 'salomao-templo',
    app: 'bible',
    file: 'bible/18-salomao-templo.jpg',
    name: 'Salomão e o templo',
    collection: 'Salomão',
    description:
      'Templo de pedra e cedro, artesãos, pombas e Salomão em manto simples. Luz dourada na inauguração — construção, não palácio de videogame.',
    recommendedLevel: 18,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 18 },
    story: {
      title: 'A casa que Salomão levantou',
      summary:
        'Salomão constrói o templo em Jerusalém com cedro e pedra. Na inauguração, pede que aquele lugar seja casa de oração — não um monumento para ele.',
      reference: '1 Reis 6–8',
      message: 'Obra bonita sem coração vira vitrine. O pedido de Salomão é que a casa sirva quem chega.',
      curiosity:
        'O cedro vinha do Líbano, em parceria com Hiram de Tiro. O templo unia ofício local e madeira de longe — obra de muitos nomes, não de um só.',
    },
  },
  {
    id: 'elias-corvos',
    slug: 'elias-corvos',
    app: 'bible',
    file: 'bible/19-elias-corvos.jpg',
    name: 'Elias e os corvos',
    collection: 'Antigo Testamento',
    description:
      'Riacho no deserto, Elias sentado na pedra e corvos trazendo pão. Rocha, água e céu — provisão quieta, sem terror.',
    recommendedLevel: 19,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 19 },
    story: {
      title: 'Pão que veio pelo ar',
      summary:
        'Durante a seca, Elias se esconde junto a um riacho. Corvos lhe trazem pão de manhã e à tarde — o profeta aprende a receber o suficiente para o dia.',
      reference: '1 Reis 17',
      message: 'Cuidado às vezes chega de um jeito estranho. O suficiente de hoje já é milagre.',
      curiosity:
        'Corvo na cultura antiga era animal “impuro”. O texto escolhe o mensageiro improvável de propósito: provisão não escolhe o carteiro bonito.',
    },
  },
  {
    id: 'samuel-menino',
    slug: 'samuel-menino',
    app: 'bible',
    file: 'bible/20-samuel-menino.jpg',
    name: 'Samuel menino',
    collection: 'Antigo Testamento',
    description:
      'Noite no santuário, lamparina, Samuel menino acordado e o velho Eli ao fundo. Luz quente, chamado suave, adequado para criança.',
    recommendedLevel: 20,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 20 },
    story: {
      title: 'Fala, que o teu servo ouve',
      summary:
        'Samuel dorme no santuário e ouve alguém chamar. Três vezes vai até Eli; na quarta, aprende a responder a Deus. O chamado chega a uma criança acordada.',
      reference: '1 Samuel 3',
      message: 'Idade não é o filtro do recado. Prestação de ouvido, sim.',
      curiosity:
        'A lamparina do santuário queimava até de manhã. O narrador nota que “a lâmpada de Deus ainda não se tinha apagado” — é madrugada, não pesadelo.',
    },
  },
  {
    id: 'bodas-cana',
    slug: 'bodas-cana',
    app: 'bible',
    file: 'bible/21-bodas-cana.jpg',
    name: 'Bodas de Caná',
    collection: 'Milagres de Jesus',
    description:
      'Festa de casamento, talhas de pedra, uvas e Jesus abençoando a água que vira vinho. Convidados alegres, videira, tons de livro infantil.',
    recommendedLevel: 21,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 21 },
    story: {
      title: 'Água que virou festa',
      summary:
        'Acaba o vinho no casamento. Maria avisa, Jesus manda encher talhas de água — e o festim continua. O primeiro sinal é cuidar da alegria de uma casa simples.',
      reference: 'João 2',
      message: 'Milagre também é não deixar a festa de alguém morrer no meio por falta do básico.',
      curiosity:
        'As talhas de pedra serviam para a purificação judaica. João escolhe justamente esses jarros: o sinal começa no que já estava ali para o rito.',
    },
  },
  {
    id: 'jesus-aguas',
    slug: 'jesus-aguas',
    app: 'bible',
    file: 'bible/22-jesus-aguas.jpg',
    name: 'Jesus anda sobre as águas',
    collection: 'Milagres de Jesus',
    description:
      'Lago à noite, ondas, barco e Jesus caminhando sobre a água. Pedro dá o primeiro passo, lua rasgando nuvem — drama fofo, sem terror.',
    recommendedLevel: 22,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 22 },
    story: {
      title: 'Vem',
      summary:
        'Os discípulos lutam contra o vento no lago. Jesus vem andando sobre a água, Pedro pede para ir até ele, afunda no medo e é seguro pela mão.',
      reference: 'Mateus 14:22–33',
      message: 'Medo e fé podem molhar o mesmo pé. A mão que segura vale mais do que o passo perfeito.',
      curiosity:
        'Mateus é o único que narra Pedro saindo do barco. Os outros evangelhos contam Jesus sobre a água; este acrescenta o convite “vem”.',
    },
  },
  {
    id: 'zaqueu',
    slug: 'zaqueu',
    app: 'bible',
    file: 'bible/23-zaqueu.jpg',
    name: 'Zaqueu no sicômoro',
    collection: 'Milagres de Jesus',
    description:
      'Rua de Jericó, sicômoro frondoso, Zaqueu pequeno no galho e Jesus olhando para cima. Multidão colorida, casas de adobe, tom alegre.',
    recommendedLevel: 23,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 23 },
    story: {
      title: 'Desce depressa',
      summary:
        'Zaqueu, cobrador pequeno e malvisto, sobe num sicômoro para ver Jesus. Jesus para, chama pelo nome e vai jantar na casa dele — a rua inteira resmunga, e a vida dele vira.',
      reference: 'Lucas 19:1–10',
      message: 'Ser visto de verdade muda mais do que ser aplaudido de longe.',
      curiosity:
        'Sicômoro é figueira larga, fácil de subir. Lucas detalha a árvore para a gente enxergar o homem baixo fazendo papel de menino só para alcançar o olhar.',
    },
  },
  {
    id: 'ovelha-perdida',
    slug: 'ovelha-perdida',
    app: 'bible',
    file: 'bible/24-ovelha-perdida.jpg',
    name: 'A ovelha perdida',
    collection: 'Parábolas',
    description:
      'Pastor carrega o cordeiro nos ombros, rebanho no morro, pôr do sol. Jesus como pastor gentil — parábola em aquarela, um foco claro.',
    recommendedLevel: 24,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 24 },
    story: {
      title: 'A que faltava',
      summary:
        'Um pastor deixa as noventa e nove no campo e vai atrás da ovelha perdida. Quando acha, carrega no ombro e chama os amigos para comemorar.',
      reference: 'Lucas 15:1–7',
      message: 'Ninguém é “o resto que se perde”. A festa é por uma.',
      curiosity:
        'Lucas junta três parábolas de “perdido e achado”: ovelha, moeda, filho. A ovelha é a primeira — a mais simples de desenhar e a mais difícil de viver.',
    },
  },
  {
    id: 'tumulo-vazio',
    slug: 'tumulo-vazio',
    app: 'bible',
    file: 'bible/25-tumulo-vazio.jpg',
    name: 'Túmulo vazio',
    collection: 'Crucificação e ressurreição',
    description:
      'Amanhecer no jardim, pedra rolada, luz dourada saindo do túmulo. Mulheres com perfume, anjo suave, lírios — alegria da ressurreição, sem gore.',
    recommendedLevel: 25,
    difficulty: 'medium',
    defaultPieceCount: 24,
    unlock: { type: 'phase', phase: 25 },
    story: {
      title: 'Ele não está aqui',
      summary:
        'Ao amanhecer, as mulheres encontram a pedra rolada e o túmulo vazio. A notícia não é terror: é que a morte não segurou Jesus, e o jardim acorda primeiro.',
      reference: 'João 20:1–18',
      message: 'O fim que a gente temia pode ser porta. A manhã começa no lugar em que se chorava.',
      curiosity:
        'João destaca Maria Madalena como a primeira a ver o Ressuscitado. Numa cultura em que o testemunho de mulher pesava menos, o evangelho escolhe ela.',
    },
  },
];
