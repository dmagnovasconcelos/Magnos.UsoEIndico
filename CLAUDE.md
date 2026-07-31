# Uso e Indico — instruções do projeto

## Regra: imagem do produto tem que ser a do anúncio, sempre

Ao adicionar ou corrigir um item em `src/lib/links.ts`, o campo `image`
**precisa ser exatamente a imagem que aparece no anúncio/página do produto**,
nunca uma imagem de produto parecido, substituto ou de outra variante
(cor/tamanho diferente).

**Por quê isso é arriscado nos links do Mercado Livre (`meli.la/...`):**
os links curtos de afiliado do Mercado Livre redirecionam para uma página
de perfil social (`/social/<usuario>`) que exibe um card "destaque"
(`card-featured`) com **recomendações que podem rotacionar a cada
carregamento da mesma URL** — já confirmado na prática: a mesma URL
`meli.la/233NUCw` mostrou em recarregamentos seguidos duas cintas
modeladoras diferentes (cores/SKUs diferentes: preto GG vs. cinza G).
Ou seja, **pegar "o primeiro card da página" não garante pegar o produto
certo**.

## Como validar antes de salvar

**IMPORTANTE (2026-07-13): o método antigo de extração (achar link
`/p/MLB` + imagem por `alt === title`) já causou produto ERRADO no site em
produção — o texto/imagem encontrados por esse método podem estar
desincronizados do destino real do botão "Ir para produto" (bug grave,
confirmado com o Danilo clicando e caindo em produto diferente do
anunciado). **Não usar mais o método antigo.** Usar sempre o método do
container do botão, descrito abaixo em "Método de extração".

1. Carregar o link do afiliado e localizar o elemento cujo texto é
   exatamente "Ir para produto" — esse é o destino real que o usuário vai
   clicar.
2. Subir pelos `parentElement` a partir desse botão até achar o primeiro
   container que tenha uma `<img>` dentro — título, preço e imagem
   extraídos **desse mesmo container** (nunca de um elemento solto
   encontrado por busca global no DOM).
3. **Recarregar a mesma URL pelo menos mais 1 vez** e conferir se o
   `href` do botão (MLB/MLBU id) continua o mesmo. Se mudar entre
   recarregamentos, **não confiar no scraping automático** — marcar o
   item para conferência manual do Danilo em vez de adivinhar.
4. Nunca usar imagem de um "produto similar" ou de recomendação da
   mesma categoria só porque o título parece parecido — tem que ser o
   exato SKU/variante do anúncio.
5. Navegar direto pela URL do produto (`/p/MLB...`) costuma cair em wall
   de login do Mercado Livre — não é um sinal confiável pra verificação.
   Preferir clicar no link real dentro da página carregada (evita o
   bloqueio na maioria dos casos).

## Se um item tiver imagem/título suspeitos

Marcar com comentário `// VERIFICAR: card de destaque instável, conferir com Danilo`
em vez de deixar silenciosamente errado.

## Categorias em uso — reutilizar, não inventar variação

Todo item de `links.ts` precisa ter `categories` preenchido (array de
string, **não** `category` — mudou em 2026-07-22 pra permitir um item
pertencer a mais de uma categoria, ex: a calça de treino aparece em
`Fitness` E `Vestuário`). Categorias já em uso no projeto (usar exatamente
esses nomes, sem acento/variação nova):

| Categoria | Exemplos |
|---|---|
| `Tech` | fones, teclados, mouses, cabos, capas de notebook, limpeza de tela |
| `Setup` | apoios de mesa, suportes, mousepads — mobiliário de escritório |
| `Fitness` | roupas de treino, suplementos, cintas, munhequeiras, itens de academia |
| `Vestuário` | roupas do dia a dia (não-fitness) — regatas, camisetas |
| `Casa` | itens domésticos gerais (copo térmico, mesa dobrável, fita adesiva) |
| `Música` | instrumentos, pedaleiras, cabos de áudio, acessórios musicais |
| `Acessórios` | relógios, joias, itens pessoais que não cabem nas outras |

Antes de criar uma categoria nova, checar se um item parecido já existe
numa dessas — evita fragmentar em "Vestuario" vs "Roupas" vs "Moda" etc.

## Duas prateleiras: "Eu uso" e "Na minha lista" (`kind`, criado 2026-07-24)

O site nasceu com a promessa "Só entra aqui o que eu realmente uso". Quando o
Danilo quis incluir produtos que ele **não usa**, isso quebraria a promessa em
4 lugares (tagline, seção Sobre, `<title>`, e os reviews em 1ª pessoa) e —
pior — jogaria suspeita sobre os itens verificados ("se tem coisa que ele não
usa, será que usa os outros?").

Solução aprovada por ele: o nome da marca já tem **dois verbos** ("Uso" E
"Indico"). A prateleira nova ativa a segunda metade do nome em vez de
contradizer a primeira. Decisões:

- `kind?: "uso" | "lista"` em `LinkConfig`. **Ausente = "uso"** (padrão
  histórico dos 47 itens; nunca precisa preencher pra item que ele usa).
- Tagline mudou pra **"O que eu uso. E o que eu indico."** (hero, `<title>`,
  OG description, e o final do texto da seção Sobre).
- Filtro `?tipo=lista` — eixo **acima** das categorias, não misturado nelas.
- **O filtro só aparece quando as duas prateleiras têm item** (`hasBothKinds`).
  Com a lista vazia o site se comporta exatamente como antes — foi assim que
  deu pra fazer deploy antes de existir qualquer item na lista.
- Contadores de categoria e destaques **respeitam a prateleira ativa** (senão
  "Tech (15)" mostrando 2 itens confunde).
- Busca opera dentro da prateleira ativa, MAS se não achar nada ali e achar na
  outra, o estado vazio vira um botão "Ver N resultados em '{outra}' →". Sem
  isso, metade do acervo sumiria pra quem busca na aba errada.
- Selo `NA MINHA LISTA` (âmbar `--color-wish: #eeb04a`, com ícone de marcador)
  **só nos itens da lista**. O "eu uso" é a norma e não leva selo — marcar só
  a exceção evita poluir 47 cards e identifica o item mesmo fora da aba.
- Texto de contexto no topo da lista: "Esses eu ainda não comprei — pesquisei,
  gostei e estão na minha lista. Não posso dizer 'eu uso', mas posso dizer
  'eu quero'." Honestidade explícita, não letra miúda.

**Regra dura:** item com `kind: "lista"` **não pode ter `review`** em 1ª pessoa
de uso ("uso todo dia…"), porque o review é justamente a prova de que ele usa.
Se for escrever algo, é no registro do desejo ("quero pra…", "vou testar…").

## Ofertas multiplataforma (`offers`, criado 2026-07-23)

Cada item pode ter `offers: Offer[]` — o mesmo produto em outra plataforma
(Amazon, Shopee, TikTok) ou outra entrega no ML. O card mostra "Também na
{plataforma} · R$ X" abaixo do CTA, e o clique passa por
`/r/{slug}?p={PLATFORM}` (mantém o tracking; fallback pro link principal se
a plataforma não existir no item).

**Amazon (2026-07-23):** 34 dos 45 itens têm oferta Amazon cadastrada. Links
construídos como `https://www.amazon.com.br/dp/{ASIN}?tag=dmagno04-20`
(tag de Associado do Danilo, extraída do SiteStripe — formato oficial do
"link completo"). Cada ASIN foi verificado abrindo a página real do produto
e comparando título/tipo com o item do catálogo. **11 itens ficaram SEM
oferta Amazon de propósito** (produto não existe lá ou só havia
marca/modelo/direção diferente — ex: cinturão Rudel só tinha Pentágono,
Casio prateado só tinha dourado, adaptador D'Addario só tinha genérico de
R$ 4). Não cadastrar "equivalente de outra marca" — contradiz a curadoria.

Shopee/TikTok: bloqueiam automação mesmo logado (renderização virtualizada
anti-bot). O mapeamento pro Danilo preencher manualmente está no Artifact
"Mapa multiplataforma". Preços das ofertas seguem a mesma regra do `price`
principal: conferir periodicamente.

## Painel de edição local (`/admin`, criado 2026-07-22)

Existe um painel de edição em `/admin` (`src/app/admin/`) que lê e escreve
direto em `src/lib/links.ts` via API route (`src/app/api/admin/links/route.ts`),
usando o formatter em `src/lib/linksFormat.ts` — **só funciona rodando
localmente** (`pnpm dev`); em produção a rota da API retorna 403 e a página
mostra um aviso, porque o filesystem da Vercel é read-only e porque não há
autenticação (não deve ficar navegável/editável publicamente).

Uso: `pnpm dev` → abrir `http://localhost:3000/admin` → editar/adicionar/
excluir itens (inclui multi-categoria via botões toggle) → o arquivo
`src/lib/links.ts` é reescrito na hora. Depois disso, o fluxo normal
continua igual: conferir `git diff`, rodar `pnpm build`, testar no browser,
e só então commit/push.

**Cuidado ao reescrever `links.ts` manualmente depois de usar o painel**:
o formatter (`formatLinksFile`) é a fonte da verdade do formato do arquivo
— se editar o arquivo à mão, seguir a mesma ordem de campos que ele gera
(`slug, url, platform, categories, featured, review, usingSince, verifiedAt,
verificationNote, title, image, description, price, originalPrice`) pra
não gerar diffs gigantes desnecessários da próxima vez que o painel salvar.

As antigas notas de verificação em comentário (`// CORRIGIDO 2026-07-13:
...`) foram migradas pra campos estruturados `verifiedAt` (data) e
`verificationNote` (texto livre) nessa mesma mudança — nenhuma informação
foi perdida, só reformatada pra ser editável pelo painel.

## Página de cupons (`/cupons`, criada 2026-07-31)

Vitrine de cupons de desconto (`src/lib/coupons.ts` + `src/app/cupons/`).
Pesquisa de mercado antes de construir apontou o erro nº 1 dessas páginas:
**o cupom do ML NÃO vai colado no link de afiliado — o visitante digita o
código no carrinho.** Por isso a seção "Como usar" (3 passos) vem ANTES dos
produtos, e cada card repete "use {CÓDIGO} no carrinho".

**Achados de promo NÃO entram no `links.ts`.** `PromoPick` vive em
`coupons.ts` porque o catálogo é curadoria pessoal ("eu uso" / "na minha
lista") e achado de promoção não é nenhum dos dois — misturar jogaria
suspeita sobre os itens verificados. Slugs levam prefixo `promo-` pra
separar no analytics; o `/r/[slug]` resolve `links` **e** `promoPicks`
(fallback), então o clique continua sendo contado.

**Auto-expiração é a peça de segurança — não mexer sem entender.**
`validUntil` (YYYY-MM-DD, inclusive, fuso de Brasília) faz a página trocar
de estado sozinha: passou a data, o código some, vira "Nenhum cupom ativo"
e a faixa da home desaparece. Testado simulando data passada. Por isso o
`revalidate` da home caiu de 24h pra 1h (senão a home anunciaria desconto
morto por até um dia); isso **não** aumenta scraping, porque cada `fetch`
do `enrich` tem cache próprio de 24h.

Outras decisões:
- **Compra mínima**: se algum achado custa menos que `minPurchase`, a página
  avisa e sugere levar dois (só se a dupla realmente passar do mínimo). Sem
  isso o cupom é recusado no carrinho e o visitante culpa o site — os
  mousepads de R$ 19,90 com mínimo de R$ 29 são exatamente esse caso.
- **Copiar código** (`CopyCode.tsx`, client): `navigator.clipboard` com
  fallback `execCommand` — o tráfego vem do navegador interno do
  Instagram/WhatsApp, que às vezes bloqueia a Clipboard API. Se os dois
  falharem, mostra "selecione e copie" em vez de fingir sucesso.
- **CTA pro catálogo**: o cupom vale em qualquer item do ML, então a página
  é porta de entrada pros 66 produtos, não vitrine de 4.
- Urgência é derivada da data real (`isLastDay`/`daysLeft`), nunca inventada.

## Analytics (`src/lib/analytics.ts`, Upstash Redis — histórico por dia)

Contador de pageviews/cliques **sem banco relacional**, no Upstash Redis
(via marketplace da Vercel). **Por que Redis e não arquivo:** o filesystem
do deploy na Vercel é read-only, e contador em arquivo (JSON no Blob/GitHub)
faz lê-soma-grava, que **perde incrementos em rajada** (comprovado em prod:
5 cliques → 2). `INCR`/`HINCRBY` somam no servidor, atômico. Histórico de
backends abandonados: GitHub Contents API (token nunca persistiu escrita) →
Vercel Blob (subconta) → **Redis (atual, correto)**.

**Modelo por DIA (chaves `av:*`, fuso de Brasília via `bucketDate`):**
`av:pv:{data}` (visitas), `av:ck:{data}` (cliques), `av:it:{data}` (hash
slug→cliques), sorted set `av:days` pra enumerar. Somar um intervalo = ler
só os dias que existem nele (barato). As chaves antigas `analytics:*` (total
acumulado, sem data) são legado — não usar.

- Funções: `trackRedirect(slug)` (1 clique/dia, chamada no `/r/[slug]`),
  `trackPageview()` (`/api/track`, disparada pelo client `TrackPageview`),
  `getStats({from,to})` (soma o intervalo), `isBot(ua)`.
- **Filtro de bot:** `/r/[slug]` e `/api/track` só contam se `!isBot(ua)` —
  crawler e preview de link (WhatsApp/Telegram/indexador) NÃO inflam. Sem
  user-agent também é tratado como bot.
- `/estatisticas` (server-render, `force-dynamic`): atalhos Hoje/7/30/Tudo +
  seletor de/até (`?preset=` ou `?from=&to=`). Sem client JS — presets são
  `<Link>`, o intervalo é um `<form method=get>`.
- **Envs:** `KV_REST_API_URL` + `KV_REST_API_TOKEN`, injetadas pela
  integração Upstash na Vercel. Sem elas, tudo é best-effort silencioso
  (site funciona, `getStats` retorna null → página mostra "indisponível").
- **Reset dos contadores:** REPL do store no painel Upstash (Storage →
  o store → REPL). Executa com **Cmd/Ctrl+Enter** (Enter só quebra linha), e
  **Safe Mode bloqueia `DEL`** — desligar o toggle antes.

## Destaque (`featured`) — poucos, ou vira "destaque de nada"

`featured: true` joga o item na seção "Destaques" do topo como um card
grande (`FeaturedCard`). **Regra prática: manter ~2-4 destaques.** Featurar
muita coisa (ex: 7 roupas de uma vez) faz um paredão de ~2500px no topo que
empurra o grid pra baixo e esvazia o sentido de destaque — o Danilo pediu
"tudo em destaque" uma vez, mostrei o efeito, e ele preferiu enxugar pra
calça + 1 regata. **Preferir destacar itens COM `review`** (o card grande
mostra a frase pessoal; sem review fica um card vazio e fraco). Destaques
respeitam a prateleira/categoria ativa (ver seção das prateleiras).

## Método de extração (script JS testado — método correto, baseado no botão)

Rodar isso via `javascript_tool` na página carregada do link `meli.la/...`
pra pegar título, preço (com desconto) e imagem certa, **garantidos
consistentes com o destino real do clique**:

```js
(function() {
  const btn = [...document.querySelectorAll('a,button')].find(el => /ir para produto/i.test(el.textContent));
  if (!btn) return JSON.stringify({ error: "botao nao encontrado" });
  let node = btn;
  let container = null;
  for (let i = 0; i < 8 && node; i++) {
    node = node.parentElement;
    if (node && node.querySelector('img')) { container = node; break; }
  }
  const img = container ? container.querySelector('img') : null;
  return JSON.stringify({
    href: btn.href,                                  // destino real do clique
    imgSrc: img ? img.src : null,
    containerText: container ? container.innerText : null, // tem título e preço "de/por R$ ... % OFF"
  });
})()
```

Por que não usar mais `document.querySelector('a[href*="/p/MLB"]')` +
`img.alt === title`: esse método antigo pode encontrar um `<a>`/`<img>`
soltos no DOM que **não pertencem ao mesmo card** do botão "Ir para
produto" — resultando em título/imagem de um produto e link de clique de
outro completamente diferente. Já causou pelo menos 2 casos confirmados
de produto errado em produção (cinto de fitness e straps/silicone-spray).

**Preço**: pegar do `containerText` — formato é `R$ [de] R$ [por] [%]
OFF`. Se tiver "no Pix" / "em outros meios", usar o valor do Pix como
`price` e o valor riscado como `originalPrice`. Se não tiver desconto
visível, usar o único preço mostrado e omitir `originalPrice`.

**Nunca navegar direto pra URL do produto** (`/p/MLB...` fora da página
de recomendações) — cai em wall de login do Mercado Livre quase sempre.
`curl` direto na mesma URL também é bloqueado (detecção de bot). Só
funciona carregando a página de recomendações (`meli.la/...`) e lendo o
card em destaque nela mesma.

## Reverificação completa (2026-07-13)

Todos os 40 itens de `links.ts` foram reverificados com o método do
container do botão "Ir para produto" (acima), após descoberta de que o
método antigo por `alt`-text causava produto errado em produção. Boa
parte dos itens tinha título/imagem/preço desatualizados ou
desincronizados do destino real do link — todos corrigidos. Slugs de
itens cujo produto mudou completamente também foram atualizados para
refletir o produto real.

## Conteúdo pessoal (`review` / `usingSince`) — preenchido em 2026-07-13

Os campos `review` (frase pessoal "por que eu uso") e `usingSince` do
`LinkConfig` estavam vazios em todos os 40 itens desde o início — o
componente (`FeaturedCard`/`ProductCard` em `page.tsx`) já sabia
renderizar os dois, só faltava o conteúdo. Esse foi identificado como o
item de maior alavancagem de uma auditoria cruzada (UX/UI, visual,
conversão, copy, marca) porque sem ele a promessa do site ("só entra
aqui o que eu realmente uso") não aparecia em nenhum card.

**Como foi coletado:** criei uma ferramenta HTML standalone (formulário
com os 40 itens agrupados por categoria, salva em localStorage, botão
"Gerar arquivo" que exporta um `.json`) e publiquei como Artifact pro
Danilo preencher no próprio ritmo. Ele preencheu e colou o JSON de volta
no chat (incluindo uma foto em base64 gigante, que não tentei
retranscrever manualmente por risco de corromper — pedi anexo direto
pra isso). Os textos foram então passados pela skill `/copywriter`
(revisão de gramática/concisão, mantendo a voz pessoal) antes de entrar
no `links.ts` via script Python (mais seguro que editar 40 blocos à
mão).

**Se for repetir esse processo pra itens novos**: esse padrão (form
HTML → Artifact → JSON de volta → aplicar via script) funciona bem pra
coletar conteúdo pessoal em lote; evitar pedir pra colar arquivos
binários grandes (fotos) via texto no chat, sempre pedir anexo direto.

## Lockup do header/hero (revisado 2026-07-14)

Depois de iterar, o layout final ficou:
- **Barra fixa do topo**: só emblema DMAGNO + wordmark "DMAGNO" (assinatura
  da marca pessoal, visível durante o scroll).
- **Hero**: só o wordmark grande "Uso e Indico" + tagline (nome do
  produto, sem repetir DMAGNO ali).

Isso substituiu uma versão anterior que mostrava as duas wordmarks nos
dois lugares (achado redundante/repetitivo pelo Danilo). Cada área tem
um papel único agora — não juntar as duas wordmarks de novo sem pedido
explícito.

## Melhorias de UX/conversão aplicadas (2026-07-14, fases 2 e 3)

A partir de uma auditoria cruzada (UX/UI, visual, e-commerce, copy,
marca — publicada como Artifact), foram aplicadas em 3 fases, cada uma
testada no browser (desktop + mobile) e commitada separadamente:

- **Fase 1**: reviews + `usingSince` (ver seção acima) + seção "Sobre o
  Danilo" no topo da home.
- **Fase 2**: ícone de linha SVG no lugar do emoji de plataforma
  (`PlatformIcon` em `page.tsx`), "plate" claro (`#f4f2ee`) atrás das
  fotos de produto pra não parecerem coladas no card escuro, botão de
  compartilhar por WhatsApp (`ShareButton.tsx`, client component),
  dropdown de ordenação por preço/desconto (`SortSelect.tsx` +
  `?sort=` na URL), contador de itens por categoria nos pills, CTA
  renomeado de "Ver produto" pra "Quero esse" (copy em 1ª pessoa).
- **Fase 3**: cor do desconto recalibrada de `#4ade80` (verde genérico)
  pra `#3ee0a8` (verde-azulado, conversa com a paleta navy/violeta),
  destaques expandidos de 1 pra 2 itens.
- **Adiado de propósito**: página de produto própria (contexto extra já
  resolvido pelos reviews inline nos cards, custo de engenharia não
  se justifica agora).

**Padrão operacional**: sempre que `pnpm build` (produção) roda com o
dev server ativo na mesma pasta, o `.next/` fica corrompido (erros tipo
`Cannot find module './845.js'`). Depois de rodar build pra validar
tipos, sempre `rm -rf .next` e reiniciar o dev server antes de testar
no browser.
