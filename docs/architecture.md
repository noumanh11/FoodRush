# FoodRush Architecture

FoodRush is a full-stack food ordering platform with three user roles (Customer, Restaurant, Admin) and an AI-powered food discovery chatbot. The system follows a classic three-tier architecture with clear separation between presentation, business logic, and data layers.

## High-Level Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Next.js 14 App<br/>(React + Tailwind)"]
    end

    subgraph API["API Layer"]
        NestJS["NestJS REST API<br/>Port 3001"]
        Auth["Auth Module<br/>JWT + Cookies"]
        Restaurants["Restaurants Module"]
        Menus["Menus Module"]
        Orders["Orders Module"]
        Chatbot["Chatbot Module"]
    end

    subgraph External["External Services"]
        Groq["Groq API<br/>(Llama 3)"]
    end

    subgraph Data["Data Layer"]
        PostgreSQL["PostgreSQL 16<br/>Port 5432"]
    end

    Browser -->|"HTTP + Cookies<br/>localhost:3000"| NestJS
    NestJS --> Auth
    NestJS --> Restaurants
    NestJS --> Menus
    NestJS --> Orders
    NestJS --> Chatbot
    Chatbot --> Groq
    Auth --> PostgreSQL
    Restaurants --> PostgreSQL
    Menus --> PostgreSQL
    Orders --> PostgreSQL
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14, React 18, TypeScript | Server/client components, routing |
| Styling | Tailwind CSS | Responsive UI design |
| State | React Context | Auth state, cart state |
| HTTP Client | Axios | API calls with credentials |
| Backend | NestJS 10, TypeScript | Modular REST API |
| ORM | TypeORM | Entity mapping, migrations |
| Database | PostgreSQL 16 | Persistent data storage |
| Auth | JWT, Passport, bcryptjs | Secure authentication |
| AI | Groq SDK (Llama 3) | Food discovery chatbot |

## Backend Module Structure

```mermaid
flowchart LR
    subgraph AppModule
        AppController["AppController"]
        AuthModule["AuthModule"]
        UsersModule["UsersModule"]
        RestaurantsModule["RestaurantsModule"]
        MenusModule["MenusModule"]
        OrdersModule["OrdersModule"]
        ChatbotModule["ChatbotModule"]
    end

    AuthModule --> UsersModule
    RestaurantsModule --> UsersModule
    MenusModule --> RestaurantsModule
    OrdersModule --> MenusModule
    OrdersModule --> RestaurantsModule
    ChatbotModule --> MenusModule
```

Each NestJS module encapsulates:

- **Controller** — HTTP route handlers and request validation
- **Service** — Business logic and database operations
- **Entity** — TypeORM database models (where applicable)
- **DTO** — Data transfer objects with `class-validator` rules

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant A as AuthController
    participant S as AuthService
    participant DB as PostgreSQL

    C->>A: POST /api/auth/login { email, password }
    A->>S: login(dto)
    S->>DB: findByEmail(email)
    DB-->>S: user record
    S->>S: bcrypt.compare(password)
    S->>S: jwtService.sign({ sub, email, role })
  S-->>A: { user, token }
    A->>C: Set-Cookie: access_token (httpOnly)
    A-->>C: { message, user }

    Note over C,A: Subsequent requests

    C->>A: GET /api/auth/me (Cookie: access_token)
    A->>A: JwtAuthGuard validates cookie
    A->>S: getProfile(user)
    S-->>A: safe user object
    A-->>C: user profile
```

### Security Measures

- Passwords hashed with bcrypt (12 rounds) before storage
- JWT stored in HTTP-only cookies (not accessible via JavaScript)
- `sameSite: lax` prevents CSRF on cross-site requests
- Role-based guards (`RolesGuard`) enforce RBAC on protected endpoints
- Global `ValidationPipe` strips unknown fields and validates DTOs

## Authorization (RBAC)

```mermaid
flowchart TD
    Request["Incoming Request"] --> JwtGuard{"JwtAuthGuard<br/>Valid token?"}
    JwtGuard -->|No| Reject401["401 Unauthorized"]
    JwtGuard -->|Yes| RolesGuard{"RolesGuard<br/>Role allowed?"}
    RolesGuard -->|No| Reject403["403 Forbidden"]
    RolesGuard -->|Yes| Handler["Route Handler"]

    subgraph Roles
        USER["user — Customer"]
        RESTAURANT["restaurant — Owner"]
        ADMIN["admin — Platform"]
    end
```

| Role | Capabilities |
|------|--------------|
| `user` | Browse, order, track orders, use chatbot |
| `restaurant` | Manage menu, view/update restaurant orders |
| `admin` | View all orders, cancel any pending order |

## Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Customer places order
    pending --> confirmed: Restaurant confirms
    pending --> cancelled: Restaurant or Admin cancels
    confirmed --> preparing: Restaurant starts cooking
    preparing --> ready: Food is ready
    ready --> delivered: Order delivered
    delivered --> [*]
    cancelled --> [*]
```

Restaurant owners can advance orders through the workflow. Admins can only cancel orders (set status to `cancelled`).

## Customer Order Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Next.js Frontend
    participant API as Orders API
    participant DB as PostgreSQL

    C->>FE: Browse restaurants, add items to cart
    C->>FE: Submit checkout with address
    FE->>API: POST /api/orders { items, deliveryAddress }
    API->>API: Validate menu items, same restaurant
    API->>API: Calculate totalAmount
    API->>DB: Save order + order_items
    DB-->>API: Order record
    API-->>FE: Created order
    FE-->>C: Redirect to order tracking page

    loop Track status
        C->>FE: View /orders/:id
        FE->>API: GET /api/orders/:id
        API-->>FE: Order with current status
    end
```

## Chatbot Architecture

The chatbot is structured as a Persistent Retrieval-Augmented Generation (RAG) assistant named **Foodie Chef Assistant**, scoped strictly to food discovery and culinary suggestions.

```mermaid
flowchart TD
    UserMsg["User message inside Chat Session"] --> Controller["ChatbotController"]
    Controller --> LoadSession["Load/Save Message History in DB"]
    LoadSession --> ScopeCheck["Off-topic pattern check"]
    ScopeCheck -->|Off-topic| RejectMsg["Return redirect message"]
    ScopeCheck -->|Food-related| KeywordExtract["Extract message keywords"]
    KeywordExtract --> PreFilterRAG["Pre-Filter DB Menu Items (Top 15 matches)"]
    PreFilterRAG --> BuildPrompt["Inject RAG Context + Dialogue History to Prompt"]
    BuildPrompt --> Groq["Groq API (llama-3.1-8b-instant) using native global.fetch"]
    Groq -->|Transient Error| Retry["Retry Connection (up to 2 times)"]
    Retry -->|API Fail Fallback| LocalSearch["Local search (fuzzy matches + stemming)"]
    Groq --> SaveResponse["Save LLM response to database"]
    SaveResponse --> Response["Food discovery reply with dynamic title generation"]
```

### Core Architecture Enhancements
1. **Persistent Database History**: Conversations (`ChatConversation` entity) and messages (`ChatMessageEntity`) are persisted in PostgreSQL.
2. **Context Pre-Filtering (RAG)**: Extracts search terms from queries and scores all menu items based on name/description matches, injecting only the top 15 most relevant candidates into the LLM context to optimize token limits.
3. **Fuzzy Local Fallback**: If the API key is unconfigured or rate-limited, the system falls back to a local keyword search using a Levenshtein-distance typo-tolerance calculator and suffix-reduction word stemmer.
4. **Transient Network Resiliency**: Connects to Groq using Node's native `global.fetch` to prevent legacy `node-fetch` decompressor socket drops, and retries failed calls up to 2 times automatically.
5. **Intelligent Title Summarization**: When starting a new session, dispatches a request to the LLM to generate a clean 2–4 word title (e.g. *"Spicy Burger Craving"*) based on the user's first query.

## Frontend Architecture

```mermaid
flowchart TB
    subgraph Pages
        Home["/ — Restaurant listing"]
        Restaurant["/restaurants/[id]"]
        Cart["/cart"]
        Orders["/my-orders"]
        OrderDetail["/orders/[id]"]
        Auth["/auth"]
        Dashboard["/dashboard — Restaurant"]
        Admin["/admin"]
        Chatbot["/chatbot"]
    end

    subgraph Context
        AuthCtx["AuthProvider<br/>useAuth()"]
        CartCtx["CartProvider<br/>useCart()"]
    end

    subgraph Shared
        API["lib/api.ts — Axios client"]
        Navbar["Navbar"]
        StatusBadge["StatusBadge"]
        RestaurantCart["RestaurantCart<br/>floating bar + sheet"]
    end

    subgraph Assets
        PublicImages["public/images/<br/>restaurant & menu SVGs"]
    end

    Pages --> AuthCtx
    Pages --> CartCtx
    Pages --> API
    Restaurant --> RestaurantCart
    Restaurant --> PublicImages
    AuthCtx --> API
    CartCtx --> API
```

### Role-Based Routing

- Unauthenticated users can browse restaurants and menus
- Login required for cart, orders, and chatbot
- `/dashboard` restricted to `restaurant` role
- `/admin` restricted to `admin` role
- Navbar links adapt based on current user role

### Cart UX (Restaurant Page)

- Desktop: sticky order sidebar appears only when the cart has items for the current restaurant
- Mobile: compact floating bar opens a bottom sheet for cart review before checkout
- Add-to-cart shows a brief toast confirmation

### Static Images

Restaurant and menu `imageUrl` values point to SVG assets in `frontend/public/images/`, generated via `npm run generate:images` and seeded by `npm run seed`.

## Deployment Topology (Production)

```mermaid
flowchart LR
    Users["Users"] --> CDN["CDN / Reverse Proxy"]
    CDN --> Frontend["Next.js<br/>(static + SSR)"]
    CDN --> Backend["NestJS API"]
    Backend --> DB["PostgreSQL"]
    Backend --> GroqAPI["Groq API"]
```

See [deployment-guide.md](./deployment-guide.md) for environment-specific setup instructions.

## Key Design Decisions

1. **HTTP-only cookies for JWT** — Reduces XSS token theft risk compared to localStorage
2. **Single-restaurant orders** — Cart enforces items from one restaurant per order
3. **Snapshot pricing** — Order items store `unitPrice` and `menuItemName` at order time
4. **Synchronize in development** — Schema auto-sync for fast iteration; migrations for production
5. **Chatbot context injection** — Menu data passed to Groq ensures grounded recommendations

## Related Documentation

- [Database Design](./database-design.md)
- [API Specification](./api-specification.md)
- [Testing Checklist](./testing-checklist.md)
- [Deployment Guide](./deployment-guide.md)
- [Requirements](./requirements.md)
