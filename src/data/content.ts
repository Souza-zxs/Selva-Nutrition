export const navLinks = [
  { label: "A Marca", href: "#manifesto" },
  { label: "Coleções", href: "#colecao" },
  { label: "Journal", href: "#journal" },
];

export const hero = {
  eyebrow: "SELVA NUTRITION",
  title: "Biologia sem filtros.",
  subtitle:
    "Recupere sua vitalidade ancestral com o poder da gordura animal pura. Nutrição Ancestral. Performance Moderna.",
  primaryCta: "Explorar Coleção",
  secondaryCta: "Nossa Origem",
};

export const manifesto = {
  eyebrow: "O MANIFESTO",
  title: "Autonomia Biológica em um mundo industrial.",
  body: "A indústria moderna falhou. Fomos convencidos de que óleos vegetais e açúcares refinados são o combustível da vida. Na SELVA, resgatamos a sabedoria ancestral para destravar a performance humana superior.",
  image: "/products/manifesto-tallow-trio.webp",
  points: [
    {
      icon: "verified",
      title: "Sabedoria Ancestral",
      body: "Gorduras saturadas nobres e densidade nutricional que sustentou impérios.",
    },
    {
      icon: "bolt",
      title: "Performance Moderna",
      body: "Biohacking através da natureza. Sem atalhos químicos, apenas biologia pura.",
    },
  ],
};

export const comparison = {
  title: "A Verdade Inconveniente",
  quote: '"Nem tudo que reluz... é Ouro."',
  image: "/products/selva-jar-signature.svg",
  enemy: {
    title: "O Inimigo",
    icon: "dangerous",
    items: [
      { label: "Óleos Vegetais de Sementes", value: "Inflamação Crônica" },
      { label: "Açúcar & Carboidratos Refinados", value: "Pico de Insulina" },
      { label: "Ultraprocessados", value: "Vazio Nutricional" },
      { label: "Alumínio & Parabenos", value: "Dano Hormonal" },
    ],
  },
  solution: {
    title: "A Solução SELVA",
    icon: "shield_heart",
    items: [
      { label: "Gordura Animal Pura", value: "Estabilidade & Saúde" },
      { label: "Ingredientes Sem Aditivos", value: "Pureza Absoluta" },
      { label: "Cosméticos de Base Comestível", value: "Biocompatibilidade" },
      { label: "Desodorante Sem Alumínio", value: "Saúde Hormonal" },
    ],
  },
};

export type Product = {
  id: string;
  tag: string;
  name: string;
  body: string;
  /** Placeholder pricing (BRL) until real price list is provided — swap once business data lands. */
  price: number;
  image?: string;
  icon?: string;
  /** Long-form narrative for the PDP (Fase 2) — populada once the dossiê copy is provided. */
  narrative?: string;
  /** Technical spec bullets for the PDP (Fase 2) — populada once the dossiê copy is provided. */
  specs?: string[];
};

export const products: Product[] = [
  {
    id: "tallow-texana",
    tag: "OURO LÍQUIDO",
    name: "Manteiga Tallow (Texana)",
    body: "A gordura mais estável e nutritiva do mundo para elevar sua performance na cozinha e na vida.",
    price: 79.9,
    image: "/products/tallow-texana.webp",
  },
  {
    id: "tallow-ervas-finas",
    tag: "GASTRONOMIA ANCESTRAL",
    name: "Manteiga Tallow de Ervas Finas",
    body: "Sabor gastronômico com densidade nutricional ancestral.",
    price: 89.9,
    image: "/products/tallow-ervas-finas.webp",
  },
  {
    id: "ghee-tradicional",
    tag: "AYURVEDA CORE",
    name: "Manteiga Ghee Tradicional",
    body: "O combustível puro para o seu cérebro e a cura para o seu intestino.",
    price: 69.9,
    // sem foto dedicada ainda — ilustração vetorial autoral até a foto chegar
    image: "/products/ghee-tradicional.svg",
  },
  {
    id: "ghee-ervas-finas",
    tag: "AYURVEDA REFINADO",
    name: "Manteiga Ghee Ervas Finas",
    body: "Digestibilidade máxima e sabor refinado em cada colherada.",
    price: 79.9,
    image: "/products/ghee-ervas-finas.svg",
  },
  {
    id: "hidratante-facial-tallow",
    tag: "SKINCARE BIOLÓGICO",
    name: "Hidratante Facial Tallow, Vitamina E + Cacau e Baunilha",
    body: "Nutrição biológica profunda para um rosto rejuvenescido e livre de químicos.",
    price: 99.9,
    image: "/products/hidratante-facial-tallow.webp",
  },
  {
    id: "hidratante-aloe-vera",
    tag: "REGENERAÇÃO BOTÂNICA",
    name: "Hidratante Tallow + Aloe Vera",
    body: "O equilíbrio perfeito entre regeneração animal e hidratação botânica.",
    price: 89.9,
    image: "/products/hidratante-aloe-vera.svg",
  },
  {
    id: "desodorante-barra",
    tag: "SAÚDE HORMONAL",
    name: "Desodorante sem Alumínio",
    body: "Proteção real contra o odor sem comprometer sua saúde hormonal.",
    price: 49.9,
    image: "/products/desodorante-barra.webp",
  },
];

export const trustBadges = [
  {
    title: "Aprovado pelo seu Avô",
    body: "Desde sempre. Sem indústria.",
    image: "/products/badge-heritage.svg",
  },
  {
    title: "Comida de Verdade",
    body: "Recomendado para humanos. Natural, Simples, Essencial.",
    image: "/products/badge-real-food.svg",
  },
  {
    title: "Produto do Agro Brasileiro",
    body: "Origem, Qualidade, Tradição.",
    image: "/products/badge-agro-brasil.svg",
  },
];

export const ecosystem = {
  title: "O Ecossistema SELVA",
  subtitle:
    "Mais do que suplementação. Um compromisso com a excelência biológica.",
  source: {
    title: "A Fonte Original",
    body: "Conheça os biomas de onde extraímos cada componente da nossa fórmula.",
    cta: "Explorar Origem",
    image: "/products/origem-fazenda.webp",
  },
  tiles: [
    {
      icon: "groups",
      title: "Comunidade",
      body: "Protocolos exclusivos para membros da elite performática.",
    },
    {
      icon: "menu_book",
      title: "O Diário",
      body: "Artigos semanais sobre biohacking e filosofia primitiva.",
    },
  ],
  lab: {
    icon: "science",
    title: "Laboratório Próprio",
    body: "Controle total da síntese à embalagem. Padrão farmacêutico em nutrição orgânica.",
  },
};

export const footerLinks = {
  explore: ["A Marca", "Coleções", "Journal"],
  legal: ["Privacy Policy", "Terms of Service", "Sustainability"],
};
