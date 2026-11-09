export { LICENSE_ORIGIN_PHRASE as LICENSE_ORIGIN } from '../packages/content-manager/src/schema.ts';

export type Lote1Entry = {
  id: string;
  slug: string;
  app: 'nostalgia' | 'bible';
  file: string;
  name: string;
  collection: string;
  description: string;
  recommendedLevel: number;
  story?: {
    title: string;
    summary: string;
    reference: string;
    message: string;
    curiosity: string;
  };
};

export const LICENSE_DATE = '2026-11-08';

export const LOTE1_ENTRIES: Lote1Entry[] = [
  {
    id: 'quarto-tv',
    slug: 'quarto-tv',
    app: 'nostalgia',
    file: 'nostalgia/01-quarto-tv.jpg',
    name: 'Quarto com TV de tubo',
    collection: 'Cotidiano dos anos 90',
    description:
      'Quarto de sábado de manhã: TV de tubo, um console oval original e controles em gota. Sem marca, sem mascote de franquia — só a memória do tapete e do controle compartilhado.',
    recommendedLevel: 1,
  },
  {
    id: 'fliperama',
    slug: 'fliperama',
    app: 'nostalgia',
    file: 'nostalgia/02-fliperama.jpg',
    name: 'Fliperama',
    collection: 'Lazer dos anos 90',
    description:
      'Loja de fliperama de esquina, cabinets geométricos, tela em branco e a máquina de pelúcia com bichos inventados. Neon, pizza e moeda no bolso.',
    recommendedLevel: 2,
  },
  {
    id: 'locadora',
    slug: 'locadora',
    app: 'nostalgia',
    file: 'nostalgia/03-locadora.jpg',
    name: 'Locadora de vídeo',
    collection: 'Cotidiano dos anos 90',
    description:
      'Prateleiras de VHS com lombadas lisas, caixa registradora ao lado de uma TV e pipoca no balcão. A família escolhe o filme da noite sem logotipo de estúdio.',
    recommendedLevel: 3,
  },
  {
    id: 'recreio',
    slug: 'recreio',
    app: 'nostalgia',
    file: 'nostalgia/04-recreio.jpg',
    name: 'Recreio na escola',
    collection: 'Escola dos anos 90',
    description:
      'Pátio brasileiro no recreio: amarelinha, ioiô, figurinha e uma pelada improvisada. Uniforme, sol e giz no chão — nenhum personagem de desenho alheio.',
    recommendedLevel: 4,
  },
  {
    id: 'festa-junina',
    slug: 'festa-junina',
    app: 'nostalgia',
    file: 'nostalgia/05-festa-junina.jpg',
    name: 'Festa Junina',
    collection: 'Festas dos anos 90',
    description:
      'Noite de arraial: bandeirinhas, fogueira, espiga, sanfona e roupa xadrez. Espantalho e milho no palito, cena original de festa junina.',
    recommendedLevel: 5,
  },
  {
    id: 'praia-walkman',
    slug: 'praia-walkman',
    app: 'nostalgia',
    file: 'nostalgia/06-praia-walkman.jpg',
    name: 'Praia com Walkman',
    collection: 'Lazer dos anos 90',
    description:
      'Areia, fone de espuma, fita cassete e um rádio portátil ao lado do castelo. Carrinho de picolé e vôlei — verão sem console de videogame na toalha.',
    recommendedLevel: 6,
  },
  {
    id: 'banca-jornal',
    slug: 'banca-jornal',
    app: 'nostalgia',
    file: 'nostalgia/07-banca-jornal.jpg',
    name: 'Banca de jornal',
    collection: 'Cotidiano dos anos 90',
    description:
      'Banca de rua com revistas de capa lisa, figurinhas e adesivos genéricos. Crianças escolhem o que levar, sem gibi de franquia no expositor.',
    recommendedLevel: 7,
  },
  {
    id: 'pelada',
    slug: 'pelada',
    app: 'nostalgia',
    file: 'nostalgia/08-pelada.jpg',
    name: 'Pelada na rua',
    collection: 'Esporte dos anos 90',
    description:
      'Rua de paralelepípedo, gol de chinelo e camisa lisa. Varal nas janelas, bola miúda e ninguém com escudo de clube — só a pelada depois da escola.',
    recommendedLevel: 8,
  },
  {
    id: 'sala-auditorio',
    slug: 'sala-auditorio',
    app: 'nostalgia',
    file: 'nostalgia/09-sala-auditorio.jpg',
    name: 'Sala — programa de auditório',
    collection: 'TV dos anos 90',
    description:
      'Sala com sofá floral, pipoca e um programa de auditório inventado na TV de tubo. Apresentador fictício, plateia colorida, nenhum apresentador real.',
    recommendedLevel: 9,
  },
  {
    id: 'parque',
    slug: 'parque',
    app: 'nostalgia',
    file: 'nostalgia/10-parque.jpg',
    name: 'Parque de diversões',
    collection: 'Lazer dos anos 90',
    description:
      'Entardecer no parque: roda-gigante, carrossel, algodão-doce e pelúcias originais no estande de prêmios. Luzes quentes, sem marca de parque famoso.',
    recommendedLevel: 10,
  },
  {
    id: 'eden',
    slug: 'eden',
    app: 'bible',
    file: 'bible/01-eden.jpg',
    name: 'Criação / Éden',
    collection: 'Antigo Testamento',
    description:
      'Jardim recém-criado: Adão e Eva, riacho, árvores e animais em paz sob o arco-íris. Ilustração original em estilo livro infantil.',
    recommendedLevel: 1,
    story: {
      title: 'A criação e o jardim',
      summary:
        'Deus cria o mundo e coloca o casal no jardim para cuidar da terra. É o começo da história — um convite à vida, não a um conto de fadas.',
      reference: 'Gênesis 1–3',
      message: 'Cuidar da criação e uns dos outros é a primeira tarefa que recebemos.',
      curiosity:
        'Éden significa “delícia” ou “prazer” em hebraico — um jardim para habitar, não um palácio para visitar.',
    },
  },
  {
    id: 'mar-vermelho',
    slug: 'mar-vermelho',
    app: 'bible',
    file: 'bible/02-mar-vermelho.jpg',
    name: 'Moisés e o Mar Vermelho',
    collection: 'Antigo Testamento',
    description:
      'Duas paredes de água, caminho seco e Moisés com o cajado. Famílias, ovelhas e a coluna de nuvem ao longe — a travessia sem fauna de zoológico.',
    recommendedLevel: 2,
    story: {
      title: 'A travessia do mar',
      summary:
        'O povo sai do Egito e se vê encurralado. Moisés estende o cajado, as águas se abrem e a caminhada continua em terra seca.',
      reference: 'Êxodo 14',
      message: 'Há caminhos que só aparecem quando a gente dá o primeiro passo juntos.',
      curiosity:
        'O texto hebraico fala em “mar de juncos” (Yam Suph). A tradição cristã consolidou o nome Mar Vermelho.',
    },
  },
  {
    id: 'davi-golias',
    slug: 'davi-golias',
    app: 'bible',
    file: 'bible/03-davi-golias.jpg',
    name: 'Davi e Golias',
    collection: 'Antigo Testamento',
    description:
      'O menino pastor com a funda diante do gigante no vale. Ovelhas ao fundo, pastel de livro ilustrado, sem armadura de filme de Hollywood.',
    recommendedLevel: 3,
    story: {
      title: 'O pastor e o gigante',
      summary:
        'Davi, o mais novo dos irmãos, enfrenta Golias com funda e pedra. A coragem não vem do tamanho da arma, e sim de quem ele escolhe servir.',
      reference: '1 Samuel 17',
      message: 'Tamanho e barulho não decidem a história quando o coração está no lugar certo.',
      curiosity:
        'A funda era arma de verdade de pastores e soldados — não um brinquedo. Davi já a usava para proteger o rebanho.',
    },
  },
  {
    id: 'daniel-leoes',
    slug: 'daniel-leoes',
    app: 'bible',
    file: 'bible/04-daniel-leoes.jpg',
    name: 'Daniel na cova dos leões',
    collection: 'Antigo Testamento',
    description:
      'Daniel em oração na cova iluminada pela lua, leões serenos ao redor. Grades, pedra e um silêncio que o decreto do rei não conseguiu quebrar.',
    recommendedLevel: 4,
    story: {
      title: 'A cova e a oração',
      summary:
        'Daniel continua orando mesmo quando a lei proíbe. Lançado à cova, amanhece ileso: a fidelidade pesou mais do que o decreto.',
      reference: 'Daniel 6',
      message: 'A fé discreta, repetida todo dia, é mais forte do que o espetáculo do medo.',
      curiosity:
        'Daniel era um exilado em cargo alto na Pérsia — a cova é o preço de não trocar a oração por um cargo.',
    },
  },
  {
    id: 'jonas',
    slug: 'jonas',
    app: 'bible',
    file: 'bible/05-jonas.jpg',
    name: 'Jonas e o grande peixe',
    collection: 'Antigo Testamento',
    description:
      'Mar aberto, um peixe enorme e amigável, algas e Jonas a caminho de um recado que ele tentou fugir. Cena de livro, não de terror oceânico.',
    recommendedLevel: 5,
    story: {
      title: 'O profeta que fugiu',
      summary:
        'Jonas foge do recado de Deus, cai no mar e é engolido por um grande peixe. De dentro da escuridão, ora — e ganha uma segunda chance.',
      reference: 'Jonas 1–2',
      message: 'Dá para recomeçar mesmo depois de ter corrido para o lado errado.',
      curiosity:
        'O texto fala em “grande peixe”, não necessariamente baleia. A tradição popular é que preencheu o animal.',
    },
  },
  {
    id: 'manjedoura',
    slug: 'manjedoura',
    app: 'bible',
    file: 'bible/06-manjedoura.jpg',
    name: 'Nascimento de Jesus',
    collection: 'Novo Testamento',
    description:
      'Presépio original: Maria, José, o bebê, pastores, magos e a estrela. Estábulo simples, animais da roça, sem cartão-postal de shopping.',
    recommendedLevel: 6,
    story: {
      title: 'O nascimento em Belém',
      summary:
        'Jesus nasce longe dos palácios, numa manjedoura. Pastores chegam primeiro; depois vêm visitantes do oriente guiados pela estrela.',
      reference: 'Lucas 2',
      message: 'A notícia boa começa no lugar humilde, no meio de quem estava acordado no campo.',
      curiosity:
        'Manjedoura é comedouro de animais. Lucas destaca isso para dizer onde o recém-nascido foi deitado — não num berço real.',
    },
  },
  {
    id: 'tempestade',
    slug: 'tempestade',
    app: 'bible',
    file: 'bible/07-tempestade.jpg',
    name: 'Jesus acalma a tempestade',
    collection: 'Novo Testamento',
    description:
      'Barco de pesca inclinado, ondas altas, raios e discípulos nas cordas. Jesus à proa, um feixe de luz rasgando as nuvens.',
    recommendedLevel: 7,
    story: {
      title: 'A paz no meio do vento',
      summary:
        'Uma tempestade pega o barco no lago. Os discípulos entram em pânico; Jesus fala com o vento e o mar, e tudo se acalma.',
      reference: 'Marcos 4:35–41',
      message: 'Medo e fé podem ocupar o mesmo barco — o que muda é para quem a gente grita.',
      curiosity:
        'O lago da Galileia desce cerca de 200 m abaixo do nível do mar; ventos súbitos descem das colinas e viram temporal em minutos.',
    },
  },
  {
    id: 'paes-peixes',
    slug: 'paes-peixes',
    app: 'bible',
    file: 'bible/08-paes-peixes.jpg',
    name: 'Multiplicação dos pães',
    collection: 'Novo Testamento',
    description:
      'Encosta ao ar livre, cestos, pães e peixes. Jesus abençoa o lanche de uma criança e a multidão se senta para comer junta.',
    recommendedLevel: 8,
    story: {
      title: 'Pães e peixes para todos',
      summary:
        'Uma multidão tem fome e quase nada para comer. Jesus abençoa cinco pães e dois peixes — e todos se alimentam, com sobra.',
      reference: 'João 6:1–14',
      message: 'O pouco oferecido com generosidade chega mais longe do que o muito guardado.',
      curiosity:
        'Os quatro evangelhos narram esta cena. João é o único que aponta que o lanche veio de um menino.',
    },
  },
  {
    id: 'bom-samaritano',
    slug: 'bom-samaritano',
    app: 'bible',
    file: 'bible/09-bom-samaritano.jpg',
    name: 'Bom Samaritano',
    collection: 'Novo Testamento',
    description:
      'Estrada ao entardecer, oliveiras, um viajante ferido e o samaritano que para com o jumento. A parábola em aquarela, sem vilão de fantasia.',
    recommendedLevel: 9,
    story: {
      title: 'Quem foi o próximo',
      summary:
        'Um homem cai nas mãos de assaltantes. Quem deveria ajudar passa longe; um samaritano — o vizinho improvável — cuida, paga e volta.',
      reference: 'Lucas 10:25–37',
      message: 'Próximo não é quem se parece conosco: é quem para quando a gente precisa.',
      curiosity:
        'Judeus e samaritanos evitavam convívio. Jesus escolhe o “errado” do mapa social para ensinar o amor que atravessa fronteira.',
    },
  },
  {
    id: 'filho-prodigo',
    slug: 'filho-prodigo',
    app: 'bible',
    file: 'bible/10-filho-prodigo.jpg',
    name: 'Filho Pródigo',
    collection: 'Novo Testamento',
    description:
      'Abraço do pai no filho que volta, o irmão mais velho à porta, casa e festa ao pôr do sol. Reconciliação em cores de livro ilustrado.',
    recommendedLevel: 10,
    story: {
      title: 'O filho que voltou',
      summary:
        'O filho mais novo gasta tudo, passa fome e decide voltar. O pai corre para abraçá-lo; o mais velho resmunga a festa — e ainda assim é convidado a entrar.',
      reference: 'Lucas 15:11–32',
      message: 'Casa é o lugar aonde se pode voltar. E também o lugar que precisa abrir a porta de novo.',
      curiosity:
        '“Pródigo” quer dizer perdulário, não arrependido. O título fala do desperdício; a parábola fala do pai que não desiste.',
    },
  },
];
