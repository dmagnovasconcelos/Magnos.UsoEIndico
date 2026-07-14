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

Todo item de `links.ts` precisa ter `category` preenchido. Categorias já
em uso no projeto (usar exatamente esses nomes, sem acento/variação nova):

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
