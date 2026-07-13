export type Platform = "MERCADO_LIVRE" | "SHOPEE" | "AMAZON" | "OUTRO";

export interface LinkConfig {
  /** Usado em /r/:slug — não mude depois de compartilhar */
  slug: string;
  /** URL de afiliado */
  url: string;
  platform: Platform;
  category: string;
  featured?: boolean;
  /** "Por que eu uso" — 1 frase, voz pessoal */
  review?: string;
  /** ISO date de quando começou a usar (exibido como "uso há X meses") */
  usingSince?: string;
  /**
   * Overrides manuais — o scraper só preenche o que estiver vazio.
   * Obrigatório para Shopee (SPA, não raspável server-side).
   */
  title?: string;
  image?: string;
  description?: string;
  /** Preço atual (com desconto, se houver) */
  price?: number;
  /** Preço "de" riscado, quando o item está em promoção */
  originalPrice?: number;
}

export const SITE_NAME = "Uso e Indico";
export const SITE_TAGLINE = "Só entra aqui o que eu realmente uso";

export const links: LinkConfig[] = [
  {
    slug: "mousepad-couro-volpe",
    url: "https://meli.la/22Jo5tQ",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Mouse Pad Couro Legítimo Volpe — Caramelo",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_957368-MLA110083075342_042026-O.webp",
    price: 29.95, // com desconto (23% OFF) — conferir periodicamente, preço do ML varia
    originalPrice: 38.9,
  },
  {
    slug: "suporte-celular-360",
    url: "https://meli.la/1s5Waug",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Suporte de Mesa para Celular Alumínio Giratório 360°",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_645748-MLB102235431879_122025-O.webp",
    price: 33.13, // com desconto (41% OFF) — conferir periodicamente, preço do ML varia
    originalPrice: 57,
  },
  {
    slug: "suporte-notebook-360",
    url: "https://meli.la/1Ua1tQD",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    featured: true,
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Suporte de Mesa para Notebook 360° Ajustável — Metal",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_877748-MLB105697398301_012026-O.webp",
    price: 129.9, // conferir — preço pode variar no ML
  },
  {
    slug: "apoio-para-pes-ergonomico-descanso-resistente-escr",
    url: "https://meli.la/1Yp2Psx",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Apoio Para Pés Ergonômico Descanso Resistente Escritório",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_707533-MLB105717403286_012026-V.webp",
    price: 42, // conferir periodicamente, preço do ML varia
    originalPrice: 59.9,
  },
  {
    slug: "tripe-para-celular-portatil-1-7m-universal-bastao",
    url: "https://meli.la/27dtUNA",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: card de destaque instável, conferir com Danilo — recarregamentos
    // mostraram título/produto diferente ("Tripé Bastão De Selfie Inova Cases...")
    title: "Tripé Para Celular Portátil 1.7m Universal Bastão Selfie Suporte Câmera Com Controle Remoto Bluetooth + Luz De Preenchimento Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_826328-MLA112451040791_052026-T.webp",
    price: 56.26, // conferir periodicamente, preço do ML varia
    originalPrice: 100,
  },
  {
    slug: "microfibra-pano-de-limpeza-para-iphone-macbook-cel",
    url: "https://meli.la/2iEaEPx",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Microfibra Pano De Limpeza Para iPhone Macbook Celular",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_739106-MLB69641898360_052023-T.webp",
    price: 29.73, // conferir periodicamente, preço do ML varia
    originalPrice: 36.9,
  },
  {
    slug: "bolsa-organizadora-cabos-case-estojo-bag-eletronic",
    url: "https://meli.la/2fVdxeZ",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Bolsa Organizadora Cabos Case Estojo Bag Eletrônico Grande Cor Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_753655-MLA108762406887_032026-V.webp",
    price: 32.01, // conferir periodicamente, preço do ML varia
    originalPrice: 37.5,
  },
  {
    slug: "base-suporte-para-pc-notebook-aluminio-portatil-ar",
    url: "https://meli.la/2fpNnyj",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Base Suporte Para PC Notebook Alumínio Portátil Articulado Dobrável Tablet Laptop Mesa Hytalux Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_719010-MLA110559363083_042026-V.webp",
    price: 24.15, // conferir periodicamente, preço do ML varia
    originalPrice: 32.9,
  },
  {
    slug: "teclado-ergonomico-sem-fio-logitech-wave-keys-graf",
    url: "https://meli.la/2UAfr3i",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Teclado Ergonômico Sem Fio Logitech Wave Keys - Grafite Inglês US",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_739716-MLA99453694320_112025-V.webp",
    price: 459, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "cabo-thunderbolt-3-ugreen-usb-c-para-hdmi-4k-refor",
    url: "https://meli.la/24JFJL6",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Cabo Thunderbolt 3 Ugreen USB-C Para HDMI 4K Reforçado - Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_852747-MLA99395901500_112025-V.webp",
    price: 121.91, // conferir periodicamente, preço do ML varia
    originalPrice: 153.39,
  },
  {
    slug: "mousepad-extra-grande-caramelo-90x40cm-deskpad-cou",
    url: "https://meli.la/2DDJo5k",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Mousepad Extra Grande Caramelo 90x40cm Deskpad Couro Antiderrapante Mesa - Kingpad",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_701855-MLA102404626214_122025-V.webp",
    price: 47.49, // conferir periodicamente, preço do ML varia
    originalPrice: 49.99,
  },
  {
    slug: "capa-protetora-e-case-para-teclado-laptop-16-poleg",
    url: "https://meli.la/2pRQRVh",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Capa Protetora e Case Para Teclado Laptop 16 Polegadas Transparente",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_851724-CBT112605370048_062026-T.webp",
    price: 158.88, // conferir periodicamente, preço do ML varia
    originalPrice: 371.98,
  },
  {
    slug: "fone-bluetooth-wave-buds-2-tws-azul",
    url: "https://meli.la/2QtskjE",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Fone Bluetooth Wave Buds 2 TWS Azul",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_811984-MLA99445406304_112025-V.webp",
    price: 219, // conferir periodicamente, preço do ML varia
    originalPrice: 299,
  },
  {
    slug: "headset-sem-fio-logitech-zone-vibe-100-grafite",
    url: "https://meli.la/2pC6977",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Headset Sem Fio Logitech Zone Vibe 100 - Grafite",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_866279-MLA99513179228_112025-V.webp",
    price: 546.62, // conferir periodicamente, preço do ML varia
    originalPrice: 699,
  },
  {
    slug: "capa-para-macbook-air-13-m4-m3-m2-protetor-teclado",
    url: "https://meli.la/2hrMDnX",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Capa Para Macbook Air 13 M4/M3/M2 Protetor Teclado + Bag Transparente Cristal",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_971777-MLA95522187642_102025-V.webp",
    price: 118.65, // conferir periodicamente, preço do ML varia
    originalPrice: 169.9,
  },
  {
    slug: "jogo-limpa-telas-pc-notebook-120ml-pano-microfibra",
    url: "https://meli.la/2qBZeEU",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Jogo Limpa Telas PC Notebook 120ml + Pano Microfibra Start",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_727350-MLA100087934009_122025-V.webp",
    price: 22.2, // conferir periodicamente, preço do ML varia
    originalPrice: 28.9,
  },
  {
    slug: "cabo-ugreen-quick-charge-4-0-usb-c-1m-blindado-cin",
    url: "https://meli.la/1nDCC7b",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Cabo Ugreen Quick Charge 4.0 USB-C 1m Blindado - Cinza",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_705800-MLA99599259526_122025-V.webp",
    price: 36.56, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "organizador-de-cabos-ugreen-fita-de-velcro-5-metro",
    url: "https://meli.la/1fjWsJZ",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Organizador De Cabos Ugreen Fita De Velcro - 5 Metros Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_683944-MLA100092977825_122025-T.webp",
    price: 23.91, // conferir periodicamente, preço do ML varia
    originalPrice: 49,
  },
  {
    slug: "mouse-sem-fio-logitech-mx-vertical-ergonomico-cinz",
    url: "https://meli.la/1iZ7b9D",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Mouse Sem Fio Logitech MX Vertical Ergonômico Cinza",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_926785-MLA99858509739_112025-V.webp",
    price: 378.2, // conferir periodicamente, preço do ML varia
    originalPrice: 579.9,
  },
  {
    slug: "teclado-sem-fio-signature-k650-grafite-logitech-ci",
    url: "https://meli.la/1Fe9x1H",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Teclado Sem Fio Signature K650 Grafite Logitech Cinza-Escuro",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_780490-MLA99929764499_112025-V.webp",
    price: 241.3, // conferir periodicamente, preço do ML varia
    originalPrice: 289.9,
  },
  {
    slug: "termolar-uniq-copo-termico-380ml-cafe-cha-preto-li",
    url: "https://meli.la/1FStUzP",
    platform: "MERCADO_LIVRE",
    category: "Casa",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Termolar Uniq Copo Térmico 380ml Café Chá Preto Liso",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_697340-MLA99533261448_122025-T.webp",
    price: 81, // conferir periodicamente, preço do ML varia
    originalPrice: 119.64,
  },
  {
    slug: "espuma-de-limpeza-para-teclado-kit-de-limpeza-home",
    url: "https://meli.la/21KQWD3",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Espuma de Limpeza para Teclado - Kit de Limpeza Home Office",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_675575-CBT113084551439_062026-T.webp",
    price: 108.71, // conferir periodicamente, preço do ML varia
    originalPrice: 164.43,
  },
  {
    slug: "cinto-de-fitness-com-alavanca-lever-buckle",
    url: "https://meli.la/2bjvGGT",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Cinto de Fitness com Alavanca (Lever Buckle)",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_920294-CBT80867282903_112024-T.webp",
    price: 283.27, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "silicone-spray-lubrificar-esteira-ergometrica-acad",
    url: "https://meli.la/2Y5nFAX",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Silicone Spray Lubrificar Esteira Ergométrica Academia 400ml",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_957923-MLA109946459038_042026-T.webp",
    price: 29.29, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "protetor-de-punho-profissional-crossfit-munhequeir",
    url: "https://meli.la/1Frc4Wu",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Protetor De Punho Profissional Crossfit Munhequeira Pulso - Rosa",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_721892-MLA99598079074_122025-V.webp",
    price: 33, // conferir periodicamente, preço do ML varia
    originalPrice: 45.54,
  },
  {
    slug: "kit-3-regata-masculina-americano-canelada-algodao",
    url: "https://meli.la/2iHrnTX",
    platform: "MERCADO_LIVRE",
    category: "Vestuario",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: card de destaque instável, conferir com Danilo — recarregamento
    // mostrou produto diferente ("Regata Americana Masculina Canelada... Branco G")
    title: "Kit 3 Regata Masculina Americano Canelada Algodão Premium",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_856120-MLB109278068437_032026-V-kit-3-regata-masculina-americano-canelada-algodo-premium.webp",
    price: 59.3, // conferir periodicamente, preço do ML varia
    originalPrice: 70,
  },
  {
    slug: "cinta-masculina-modeladora-abdominal-ajustavel-ema",
    url: "https://meli.la/233NUCw",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: imagem suspeita — parece colagem promocional (pessoa segurando
    // as costas, operário) de um anúncio de cinta LOMBAR, não uma foto limpa da
    // cinta modeladora abdominal. Título confirmado estável (4/5 recarregamentos),
    // mas a foto pode estar errada. Conferir com Danilo antes de confiar.
    title: "Cinta Masculina Modeladora Abdominal Ajustável Emagrecimento Preto GG",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_650266-MLA113054136531_062026-T.webp",
    price: 66.84, // conferir periodicamente, preço do ML varia
    originalPrice: 78.9,
  },
  {
    slug: "calca-tactel-masculino-jogger-com-elastano-academi",
    url: "https://meli.la/2gr6yyi",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: card de destaque instável, conferir com Danilo — recarregamento
    // mostrou produto diferente ("Calça Tactel Jogger Premium... 2 Bolsos 016")
    title: "Calça Tactel Masculino Jogger com Elastano Academia Treino",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_692315-MLB87398103458_072025-V-calca-tactel-masculino-jogger-c-elastano-academia-treino.webp",
    price: 36.17, // conferir periodicamente, preço do ML varia
    originalPrice: 69,
  },
  {
    slug: "munhequeira-musculacao-crossfit-lpo-elastica-alta",
    url: "https://meli.la/1KE8Dgv",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Munhequeira Musculação Crossfit LPO Elástica Alta Compressão - Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_825097-MLA105750783064_022026-V.webp",
    price: 34.44, // conferir periodicamente, preço do ML varia
    originalPrice: 39.9,
  },
  {
    slug: "shorts-2-em-1-termico-de-compressao-com-bolso-secr",
    url: "https://meli.la/1skhdLd",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: card de destaque muito instável, conferir com Danilo —
    // recarregamento mostrou um produto completamente diferente (short
    // feminino "Selene Zero Transparência", nada a ver com o item masculino)
    title: "Shorts 2 em 1 Térmico de Compressão com Bolso Secreto Academia",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_710628-MLB110967764522_052026-V-shorts-2-em-1-termico-de-compresso-bolso-secreto-academia.webp",
    price: 27.77, // conferir periodicamente, preço do ML varia
    originalPrice: 54.9,
  },
  {
    slug: "relogio-casio-unissex-vintage-aq-230a-1dmq-pratead",
    url: "https://meli.la/2RaFbfu",
    platform: "MERCADO_LIVRE",
    category: "Acessorios",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Relógio Casio Unissex Vintage AQ-230A-1DMQ Prateado",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_638064-MLA99489095824_112025-V.webp",
    price: 145.53, // conferir periodicamente, preço do ML varia
    originalPrice: 298.77,
  },
  {
    slug: "kit-3-regata-oversized-machao-streetwear-lisa-casu",
    url: "https://meli.la/12feN5K",
    platform: "MERCADO_LIVRE",
    category: "Vestuario",
    // TODO(Danilo): adicionar review pessoal e usingSince
    // VERIFICAR: card de destaque instável, conferir com Danilo — recarregamento
    // mostrou produto diferente ("Regata Americana Masculina Canelada... Branco G")
    title: "Kit 3 Regata Oversized Machão Streetwear Lisa Casual Básicas",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_839421-MLB104333596016_012026-V-kit-3-regata-oversized-macho-streetwear-lisa-casual-basicas.webp",
    price: 76.03, // conferir periodicamente, preço do ML varia
    originalPrice: 143.45,
  },
  {
    slug: "regata-oversized-masculino-tamanho-grande-basica-l",
    url: "https://meli.la/2bUEgJW",
    platform: "MERCADO_LIVRE",
    category: "Vestuario",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Regata Oversized Masculino Tamanho Grande Básica Lisa - Preto",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_944768-MLB94446815565_102025-V.webp",
    price: 27, // conferir periodicamente, preço do ML varia
    originalPrice: 64.14,
  },
  {
    slug: "suplemento-em-po-panic-150g-adaptogen-uva-com-crea",
    url: "https://meli.la/1USEMLc",
    platform: "MERCADO_LIVRE",
    category: "Fitness",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Suplemento em Pó Panic 150g Adaptogen Uva com Creatina",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_861264-MLA100080909647_122025-V.webp",
    price: 38.8, // conferir periodicamente, preço do ML varia
    originalPrice: 66,
  },
  {
    slug: "pedalboard-luxo-detalhe-em-madeira-universal-com-v",
    url: "https://meli.la/2vup3ow",
    platform: "MERCADO_LIVRE",
    category: "Musica",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Pedalboard Luxo Detalhe em Madeira Universal com Velcro Fuhrmann PB5",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_800509-MLA100008009715_122025-V.webp",
    price: 137.75, // conferir periodicamente, preço do ML varia
    originalPrice: 259.63,
  },
  {
    slug: "footswitch-cabo-50cm-hxstomp-ampero-nux-loop-core",
    url: "https://meli.la/2pDX1qr",
    platform: "MERCADO_LIVRE",
    category: "Musica",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Footswitch Cabo 50cm HXStomp Ampero NUX Loop Core Vamp FS2NL",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_949576-MLA105895323032_022026-V.webp",
    price: 209, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "adaptador-p10-femea-estereo-d-addario-pw-p047t",
    url: "https://meli.la/2nADtNJ",
    platform: "MERCADO_LIVRE",
    category: "Musica",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Adaptador P10 Fêmea Estéreo D'Addario PW-P047T",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_758937-MLA95878477340_102025-T.webp",
    price: 119.99, // conferir periodicamente, preço do ML varia
  },
  {
    slug: "kit-4-rolos-fita-tecido-gaffer-tesa-12mm-x-5m-fluo",
    url: "https://meli.la/23tv7hh",
    platform: "MERCADO_LIVRE",
    category: "Casa",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Kit 4 Rolos Fita Tecido Gaffer Tesa 12mm x 5m Fluorescente",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_686085-MLA103900568386_012026-T.webp",
    price: 58.69, // conferir periodicamente, preço do ML varia
    originalPrice: 72.61,
  },
  {
    slug: "mesa-dobravel-portatil-palisad-aluminio-branco-90x",
    url: "https://meli.la/1k5kKFp",
    platform: "MERCADO_LIVRE",
    category: "Casa",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Mesa Dobrável Portátil Palisad Alumínio Branco 90x60x70cm",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_879613-MLA96146063437_102025-V.webp",
    price: 119.2, // conferir periodicamente, preço do ML varia
    originalPrice: 149,
  },
  {
    slug: "bag-pedaleira-avs-gt10-gt100-preto-acolchoado-term",
    url: "https://meli.la/1Sa2yEP",
    platform: "MERCADO_LIVRE",
    category: "Musica",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Bag Pedaleira AVS GT10 GT100 Preto Acolchoado Térmico 55x28x11cm",
    image: "https://http2.mlstatic.com/D_Q_NP_2X_674157-MLA99459138414_112025-T.webp",
    price: 91.98, // conferir periodicamente, preço do ML varia
    originalPrice: 99.98,
  },
];
