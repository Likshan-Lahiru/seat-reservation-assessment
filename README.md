
# BookMyTicket – Reservation System API (Express + TypeScript + PostgreSQL)
seat-reservation-assessment

I selected the **movie theatre seat reservation system** scenario. This system handles **movies**, **theatres**, **shows**, **seats**, and **reservations** (seat + show time).

### Why I chose this scenario:
I chose this scenario because it is very relevant to real-world reservation system, and it allows me to handle **multiple resources**, not just a single resource.

## Live Demo

- Frontend (Vercel): https://seat-reservation-assessment-ui.vercel.app/

- Frontend (GitHub): https://github.com/Likshan-Lahiru/seat-reservation-assessment-ui.git

- Database: Neon Serverless PostgreSQL instance

- Backend: Deployed on a cloud hosting provider (REST API)


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

## Key design decisions
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


## Future improvements
- To better support the frontend, I would adapt my reservation flow using Firebase Realtime Database or WebSockets for live seat updates. When a user selects seats and moves to the proceed step, those seats would be marked as pending and pushed to Firebase in real time. Other users would instantly see the updated status and wouldn’t be able to select seats that are currently in the booking process.

- I would implement a dedicated user management service, or integrate a managed provider such as Clerk or an Azure user management service.

- I would improve scalability by introducing a proper load balancing setup.

- I would implement stronger security using OAuth 2.0. All requests would be validated using access tokens, reducing risks like scraping, unauthorized access, and sensitive data leakage.

- Finally, I would integrate a payment gateway to complete the end-to-end booking workflow.



## Trade-offs and assumptions
- Reservations will be disabled 30 minutes before the movie start time.

- Cancellation will be disabled 1 hour before the movie start time.

- If a large volume of API requests comes in, I plan to handle it using rate limiting / load balancing to prevent overloading.

- With Firebase Realtime Database seat status updates, the frontend can mark seats as temporarily unavailable during the proceed/checkout step. If a seat is locked/pending, the user will see a notice such as: “This seat is currently not available. Please check again after 30 minutes.”

- I can also create an admin dashboard, so the system can be managed more easily by administrators.

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