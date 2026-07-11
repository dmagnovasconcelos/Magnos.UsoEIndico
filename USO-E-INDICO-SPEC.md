# Uso e Indico — Spec Técnica

> Nome interno de projeto: `magnos-indica` (segue padrão Magnos.Control)
> Nome de marca/domínio: **Uso e Indico**

## Problem statement
Vitrine pública de produtos que o Danilo usa no dia a dia, com links de afiliado (Mercado Livre, Shopee, Amazon etc), organizados por categoria, com painel admin pra gerenciar itens e analytics de clique pra saber o que performa. Single-tenant (uso pessoal, sem multi-empresa).

## Stack
- Backend: NestJS 11, DDD, Prisma
- Frontend: Next.js 15 (App Router)
- DB: PostgreSQL
- IDs: `cuid()`
- Padrão de módulo igual ao Magnos.Control, mas **sem** `contractId`/`companyId` (single-tenant)

## Acceptance criteria
- Given um visitante acessa a home, When a página carrega, Then vê categorias ativas com seus itens ativos, ordenados por `order`.
- Given um visitante clica num item, When o clique acontece, Then é redirecionado (302) pra URL de afiliado em <150ms e um `ClickEvent` é registrado de forma assíncrona (não bloqueia o redirect).
- Given o Danilo está autenticado como admin, When cria/edita/exclui categoria ou item, Then a mudança reflete no site público imediatamente.
- Given um item tem clicks registrados, When alguém tenta deletá-lo, Then o sistema faz soft-delete (preserva histórico de analytics). Se não tem clicks, hard-delete.
- Given o admin acessa o dashboard, When filtra por período e/ou item, Then vê contagem de cliques, top itens e breakdown por plataforma/referrer.

## API contract
```
# Público
GET /api/v1/public/categories        → [{ id, name, slug, order, items: [...] }]
GET /api/v1/public/items?category=:slug
GET /r/:slug                          → 302 redirect + log ClickEvent (fire-and-forget)

# Admin (Auth: Bearer, role: ADMIN)
POST   /api/v1/admin/categories       Request: { name, order?, icon? }
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id   → soft-delete (active=false)

POST   /api/v1/admin/items            Request: { title, description?, imageUrl?, categoryId, platform, originalUrl, order? }
PATCH  /api/v1/admin/items/:id
DELETE /api/v1/admin/items/:id        → soft-delete se clickCount > 0, senão hard-delete

GET /api/v1/admin/analytics/summary?from&to
GET /api/v1/admin/analytics/clicks?itemId&from&to

Response 422: { errors: [{ field, message }] }
Response 401/403: standard error shape
```

## Data model
```
Entity: Category
Fields: id (cuid), name (string), slug (string, unique), order (int, default 0),
        icon (string?), active (bool, default true), createdAt, updatedAt
Indexes: slug — lookup rápido
Relations: has_many Item

Entity: Item
Fields: id (cuid), title (string), description (text?), imageUrl (string?),
        categoryId (FK), platform (enum: MERCADO_LIVRE | SHOPEE | AMAZON | OUTRO),
        originalUrl (string), slug (string, unique — usado em /r/:slug),
        order (int, default 0), active (bool, default true),
        clickCount (int, default 0 — cache denormalizado), createdAt, updatedAt
Indexes: slug, categoryId
Relations: belongs_to Category — RESTRICT on delete; has_many ClickEvent

Entity: ClickEvent
Fields: id (cuid), itemId (FK), createdAt, userAgent (string?),
        referrer (string?), ipHash (string? — hash, não IP cru, por privacidade)
Indexes: (itemId, createdAt) — para agregações por período
Relations: belongs_to Item — CASCADE se Item for hard-deletado
Invariants: clickCount de Item é incrementado no insert (via trigger ou job, não bloqueante)
```

## Business rules
- Slug do item é auto-gerado do título (slugify), editável, precisa ser único.
- Item/Category inativos somem do público mas continuam no admin e nos analytics.
- Redirect não pode esperar o insert do ClickEvent — dispara redirect e loga em background (fila leve ou insert assíncrono sem `await` bloqueante).
- Sem detecção de fraude de clique nessa fase (fora de escopo).

## Diferenciais de mercado (pesquisa 2026-07-11)
Baseado em análise de Linktree, Beacons, LTK, ShopMy e cenário BR (Shopee Minha Coleção, WDNA):
- **Curadoria pessoal como diferencial**: campo `review` ("Por que eu uso") + `usingSince` — tendência validada pelo ShopMy Noir (curadoria humana). Nenhum player BR faz vitrine com review pessoal.
- **Featured acima da dobra**: cada clique extra reduz conversão 20-30%; produto destaque deve ser visível sem scroll.
- **SEO como ativo**: SSR + schema.org Product + OG images + rota `/[categoria]` — vitrine vira ativo de busca orgânica, coisa que Linktree não entrega.
- **v2 (schema preparado, não implementar no MVP)**: entidade Collection — coleções temáticas transversais às categorias ("Setup 2026", "Abaixo de R$100"), padrão LTK Collections.

## Out of scope
- Multi-tenancy
- Contas de usuário para visitantes públicos
- Detecção de fraude/bot em clique
- Deep linking / apps nativos
- i18n
- Coleções temáticas (v2 — ver Diferenciais de mercado)

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Auth | JWT + tabela `User` no banco | Permite troca de senha sem redeploy |
| clickCount | Fire-and-forget no NestJS (sem `await`) | Zero infra extra, simples para volume pessoal |
| Redirect miss (slug inexistente) | 404 JSON | Semanticamente correto |
| Redirect miss (item inativo) | 302 para `/` | Silencioso, não quebra UX |
| Estrutura | pnpm monorepo com workspaces | apps/api + apps/web + packages/shared |
| Analytics summary shape | `{ totalClicks, topItems: [{id, title, clicks}], byPlatform: [{platform, clicks}] }` | Cobre as 3 visões úteis |
| ipHash | SHA-256 do IP (sem salt) | Simples e suficiente para privacidade |
| Auth token | JWT 7 dias, sem refresh token | Single-tenant pessoal, baixa frequência de acesso |
| Auth routes | `POST /api/v1/auth/login` → `{ accessToken }` | Padrão REST |

## Decisões em aberto
- Domínio: registrar `usoeindico.com.br` (ou variação) — verificar disponibilidade
- Banco: instância Postgres separada do Magnos.Control (projeto independente)
- Hosting: Next.js na Vercel, NestJS na Railway ou Fly.io

## API contract (completo)
```
# Auth
POST /api/v1/auth/login   Request: { email, password }   Response 200: { accessToken }

# Público
GET /api/v1/public/categories        → [{ id, name, slug, order, icon, items: [{ id, title, slug, description, imageUrl, platform, order }] }]
GET /api/v1/public/items?category=:slug  → [{ id, title, slug, description, imageUrl, platform, order }]
GET /r/:slug                          → 302 (item ativo) | 302 para / (item inativo) | 404 (slug não existe)
                                        + log ClickEvent fire-and-forget

# Admin (Auth: Bearer JWT, role: ADMIN)
POST   /api/v1/admin/categories       Request: { name, order?, icon? }   Response 201: Category
PATCH  /api/v1/admin/categories/:id   Request: { name?, order?, icon?, active? }
DELETE /api/v1/admin/categories/:id   → soft-delete (active=false)   Response 204

POST   /api/v1/admin/items            Request: { title, description?, imageUrl?, categoryId, platform, originalUrl, review?, usingSince?, featured?, order? }   Response 201: Item
PATCH  /api/v1/admin/items/:id        Request: { title?, description?, imageUrl?, categoryId?, platform?, originalUrl?, slug?, review?, usingSince?, featured?, order?, active? }
DELETE /api/v1/admin/items/:id        → soft-delete se clickCount > 0, senão hard-delete   Response 204

GET /api/v1/admin/analytics/summary?from=ISO&to=ISO
  → { totalClicks: number, topItems: [{ id, title, clicks }], byPlatform: [{ platform, clicks }] }
GET /api/v1/admin/analytics/clicks?itemId=:id&from=ISO&to=ISO
  → [{ date: ISO, clicks: number }]

Response 422: { errors: [{ field, message }] }
Response 401/403: { error: string }
```

## Data model (completo)
```
Entity: User
Fields: id (cuid), email (string, unique), passwordHash (string), createdAt, updatedAt
Indexes: email

Entity: Category
Fields: id (cuid), name (string), slug (string, unique), order (int, default 0),
        icon (string?), active (bool, default true), createdAt, updatedAt
Indexes: slug
Relations: has_many Item

Entity: Item
Fields: id (cuid), title (string), description (text?), imageUrl (string?),
        categoryId (FK), platform (enum: MERCADO_LIVRE | SHOPEE | AMAZON | OUTRO),
        originalUrl (string), slug (string, unique),
        review (text? — "Por que eu uso": mini-review pessoal, diferencial de curadoria),
        usingSince (date? — desde quando usa o produto, exibido como "uso há X meses"),
        featured (bool, default false — destaque acima da dobra na home),
        order (int, default 0), active (bool, default true),
        clickCount (int, default 0), createdAt, updatedAt
Indexes: slug, categoryId, featured (partial: where featured=true)
Relations: belongs_to Category — RESTRICT on delete; has_many ClickEvent

Entity: ClickEvent
Fields: id (cuid), itemId (FK), createdAt, userAgent (string?),
        referrer (string?), ipHash (string? — SHA-256 do IP)
Indexes: (itemId, createdAt)
Relations: belongs_to Item — CASCADE on delete
Invariants: após INSERT de ClickEvent, Item.clickCount++ via fire-and-forget (sem trigger)
```

## Dependencies
- Prisma schema: User, Category, Item, ClickEvent
- NestJS modules: auth, public, admin/categories, admin/items, admin/analytics
- Next.js App Router: `/` (vitrine pública) + `/admin` (painel protegido)
