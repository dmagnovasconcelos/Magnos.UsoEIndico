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

1. Carregar o link do afiliado e extrair título + imagem do card em
   destaque via JS (`img.alt === title`, não pegar imagem solta pela
   posição no DOM).
2. **Recarregar a mesma URL pelo menos mais 1 vez** e conferir se o
   título/MLB code do produto em destaque continua o mesmo. Se mudar
   entre recarregamentos, **não confiar no scraping automático** — marcar
   o item para conferência manual do Danilo em vez de adivinhar.
3. Nunca usar imagem de um "produto similar" ou de recomendação da
   mesma categoria só porque o título parece parecido — tem que ser o
   exato SKU/variante do anúncio.
4. Navegar direto pela URL do produto (`/p/MLB...`) costuma cair em wall
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

## Método de extração (script JS testado)

Rodar isso via `javascript_tool` na página carregada do link `meli.la/...`
pra pegar título, preço (com desconto) e imagem certa do card em destaque:

```js
(function() {
  const link = document.querySelector('a[href*="/p/MLB"]') || document.querySelector('a[href*="/up/MLBU"]');
  const title = link ? link.textContent.trim() : null;
  const img = title ? [...document.querySelectorAll('img')].find(i => i.alt === title) : null;
  const bodyText = document.body.innerText;
  const idx = title ? bodyText.indexOf(title) : -1;
  const nearText = idx >= 0 ? bodyText.slice(idx, idx + 200) : null; // tem preço "de/por" e % OFF
  return JSON.stringify({ title, imgSrc: img ? img.src : null, nearText, productUrl: link ? link.href.split('?')[0] : null });
})()
```

Alguns links não usam `/p/MLB...` (produtos com variação/cor usam
`/up/MLBU...` ou até `produto.mercadolivre.com.br/MLB-...`). Se o seletor
não achar nada, usar fallback: procurar a primeira linha do texto da
página depois de `"1 seguidor"` pra achar o título manualmente.

**Preço**: pegar da `nearText` — formato é `R$ [de] R$ [por] [%] OFF`. Se
tiver "no Pix" / "em outros meios", usar o valor do Pix como `price` e o
valor riscado como `originalPrice`. Se não tiver desconto visível, usar
o único preço mostrado e omitir `originalPrice`.

**Nunca navegar direto pra URL do produto** (`/p/MLB...` fora da página
de recomendações) — cai em wall de login do Mercado Livre quase sempre.
`curl` direto na mesma URL também é bloqueado (detecção de bot). Só
funciona carregando a página de recomendações (`meli.la/...`) e lendo o
card em destaque nela mesma.

## Itens pendentes de conferência manual (2026-07-13)

Estes 6 itens foram marcados com `// VERIFICAR` no `links.ts` porque o
card de destaque mostrou produtos diferentes em recarregamentos — o
Danilo precisa confirmar manualmente qual é o produto/imagem correto:
`tripe-para-celular-portatil-1-7m-universal-bastao`,
`kit-3-regata-masculina-americano-canelada-algodao`,
`cinta-masculina-modeladora-abdominal-ajustavel-ema` (imagem suspeita),
`calca-tactel-masculino-jogger-com-elastano-academi`,
`shorts-2-em-1-termico-de-compressao-com-bolso-secr`,
`kit-3-regata-oversized-machao-streetwear-lisa-casu`.
