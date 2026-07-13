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
