
# BookMyTicket – Reservation System API (Express + TypeScript + PostgreSQL)
seat-reservation-assessment

## Tech Stack
Node.js + Express + TypeScript, PostgreSQL, Zod validation, Helmet + CORS, Docker, node-cron, Postman documentation, Swagger documentation

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended)
- npm

### 1. Clone & Install
```bash
git clone <GITHUB_REPO_URL>
cd seat-reservation-assessment
npm install
````

### 2. Create Database

```sql
CREATE DATABASE reservation_db;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=4000
DATABASE_URL=postgres://{Your-username}:{Your-password}@localhost:5432/reservation_db
NODE_ENV=development
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Start the Server

```bash
npm run dev
```


---

## API URLs

API will run at:

* [http://localhost:4000](http://localhost:4000)

Health check:

* [http://localhost:4000/health](http://localhost:4000/health)

Swagger Docs:

* [http://localhost:4000/docs](http://localhost:4000/docs)

Postman Docs:

* [https://documenter.getpostman.com/view/36186170/2sB3dTu8RA](https://documenter.getpostman.com/view/36186170/2sB3dTu8RA)

```
```

### Key design decisions
- Clean layered structure (Controller → Service → Repository)
- Dedicated modules for Movies, Theatres, Seats, Reservations
- Design ErDiagram modeling real-world relationships
- Zod for request validation
- Consistent error format + mapped Postgres constraint errors
- Async/non-blocking handlers
- Pagination built-in for list endpoints
- Single query aggregation where useful
- Background cleanup job using node-cron
- Comprehensive API documentation (Swagger + Postman)





## Architecture diagrams

```mermaid
flowchart LR
User["User / Client (Postman / Frontend)"] --> API["BookMyTicket API (Node.js + Express + TypeScript)"]

API --> Movies["Movies & Shows Module"]
API --> Theatres["Theatres Module"]
API --> Seats["Seats Module"]
API --> Reservations["Reservations Module"]

Movies --> PG["PostgreSQL (reservation_db)"]
Theatres --> PG
Seats --> PG
Reservations --> PG

Reservations --> Concurrency["DB Constraint: UNIQUE(show_id, seat_id)\nPrevents double-booking"]

API --> Cron["Cron Job (Daily 00:05)\nCleanup expired reservations"]
Cron --> PG
```

## ErDiagram diagrams

```mermaid
erDiagram
THEATRES {
UUID id PK
TEXT name
TEXT image_url
NUMERIC rating
TEXT location
TIMESTAMPTZ created_at
}

SEATS {
UUID id PK
UUID theatre_id FK
TEXT label
TIMESTAMPTZ created_at
}

USERS {
UUID id PK
TEXT name
TEXT email
TEXT nic
TIMESTAMPTZ created_at
}

MOVIES {
UUID id PK
TEXT title
TEXT image_url
TIMESTAMPTZ created_at
}

SHOWS {
UUID id PK
UUID movie_id FK
UUID theatre_id FK
TIMESTAMPTZ start_time
TIMESTAMPTZ end_time
TIMESTAMPTZ created_at
}

RESERVATIONS {
UUID id PK
UUID show_id FK
UUID user_id FK
TIMESTAMPTZ created_at
}

RESERVATION_ITEMS {
UUID id PK
UUID reservation_id FK
UUID show_id FK
UUID seat_id FK
TIMESTAMPTZ created_at
}

%% Relationships
THEATRES ||--o{ SEATS : has
MOVIES   ||--o{ SHOWS : has
THEATRES ||--o{ SHOWS : hosts

SHOWS ||--o{ RESERVATIONS : has
USERS ||--o{ RESERVATIONS : makes

RESERVATIONS ||--o{ RESERVATION_ITEMS : contains
SHOWS        ||--o{ RESERVATION_ITEMS : for
SEATS        ||--o{ RESERVATION_ITEMS : books
```