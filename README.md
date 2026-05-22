# Mini JSONPlaceholder — Full Stack

Una versione semplificata di [JSONPlaceholder](https://jsonplaceholder.typicode.com/), pensata per valutare conoscenze su concetti di backend e REST API.

---

## Stack tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Backend | Express 4 |
| Frontend | HTML / CSS / Vanilla JS |
| Database | MySQL 8 (via Docker) |
| Driver DB | mysql2/promise (SQL raw, nessun ORM) |
| Package manager | npm |

---

## Struttura del monorepo

```
mini-jsonplaceholder/
├── CLAUDE.md
├── .gitignore
├── docker-compose.yml             # Container MySQL 8, auto-seed al primo avvio
├── docs/
│   ├── guida-setup-mysql.md       # Guida step-by-step al setup (in italiano)
│   ├── cheatsheet-sql.md          # Riferimento SQL per il progetto
│   └── spiegazione-migrazione.md  # Perché e come è avvenuta la migrazione da array a MySQL
├── api/                           # Backend — REST API con Express
│   ├── .env.example               # Template credenziali DB
│   ├── .env                       # Credenziali reali (gitignored)
│   ├── server.js                  # Entry point — dotenv, cors, routes, logger, :3000
│   ├── data/
│   │   └── database.vecchio.js    # Vecchio DB in-memory (conservato come riferimento)
│   ├── database/
│   │   ├── connessione.js         # Connection pool mysql2
│   │   ├── schema.sql             # CREATE TABLE (eseguito automaticamente da Docker)
│   │   ├── seed.sql               # INSERT dati iniziali (eseguito automaticamente da Docker)
│   │   └── queries/
│   │       ├── utenti.js
│   │       ├── post.js
│   │       └── commenti.js
│   ├── routes/
│   │   ├── utenti.js              # /api/utenti — CRUD
│   │   ├── post.js                # /api/post — CRUD
│   │   └── commenti.js            # /api/commenti — CRUD
│   └── package.json
└── web/                           # Frontend — HTML/CSS/JS puro
    ├── index.html
    ├── stile.css
    ├── js/
    │   ├── api.js
    │   ├── ui.js
    │   └── app.js
    └── package.json
```

---

## Avvio rapido

### 1. Database (da root del progetto)

```bash
docker compose up -d       # Avvia MySQL + phpMyAdmin
docker compose down        # Ferma i container
docker compose down -v     # Ferma e cancella tutti i dati (ri-seed al prossimo avvio)
```

### 2. Backend

```bash
cd api
npm install
npm run dev                # node --watch server.js (riavvio automatico)
```

### 3. Frontend

```bash
cd web
npm run dev                # serve -l 8080
```

| Servizio | URL |
|----------|-----|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

> CORS è abilitato. Prima di avviare il backend, copia `api/.env.example` in `api/.env` e inserisci le credenziali del database.

---

## Endpoint API

Tutte le risposte e i nomi dei campi sono in italiano.

### Utenti — `/api/utenti`

Campi: `id`, `nome`, `email`, `citta`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/utenti` | Lista tutti (filtro: `?citta=Roma`) |
| GET | `/api/utenti/:id` | Singolo utente |
| POST | `/api/utenti` | Crea utente (`nome`, `email` obbligatori; `citta` opzionale) |
| PUT | `/api/utenti/:id` | Aggiornamento completo (`nome`, `email` obbligatori) |
| PATCH | `/api/utenti/:id` | Aggiornamento parziale |
| DELETE | `/api/utenti/:id` | Elimina (cascade su post e commenti) |

### Post — `/api/post`

Campi: `id`, `userId`, `titolo`, `corpo`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/post` | Lista tutti (filtro: `?userId=1`) |
| GET | `/api/post/:id` | Singolo post |
| POST | `/api/post` | Crea post (`userId`, `titolo`, `corpo` obbligatori) |
| PUT | `/api/post/:id` | Aggiornamento completo |
| PATCH | `/api/post/:id` | Aggiornamento parziale |
| DELETE | `/api/post/:id` | Elimina (cascade su commenti) |

### Commenti — `/api/commenti`

Campi: `id`, `postId`, `nome`, `email`, `corpo`

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/commenti` | Lista tutti (filtro: `?postId=4`) |
| GET | `/api/commenti/:id` | Singolo commento |
| POST | `/api/commenti` | Crea commento (tutti i campi obbligatori) |
| PUT | `/api/commenti/:id` | Aggiornamento completo |
| PATCH | `/api/commenti/:id` | Aggiornamento parziale |
| DELETE | `/api/commenti/:id` | Elimina |

---

## Architettura Backend

- **`database/connessione.js`** — crea un connection pool mysql2 a partire dalle variabili `.env`
- **`database/queries/*.js`** — un modulo per entità, esporta funzioni async (es. `trovaUtenti`, `creaUtente`, `eliminaUtente`). Tutte usano query parametrizzate (`?`) per prevenire SQL injection
- **`routes/*.js`** — handler Express async con try/catch; importano da `queries/`, validano l'input e restituiscono JSON
- **`schema.sql` + `seed.sql`** — eseguiti automaticamente da Docker al primo avvio via `/docker-entrypoint-initdb.d/`

## Architettura Frontend

- **Nessun build tool, nessun framework** — HTML/CSS/JS puro con ES Modules
- **Navigazione:** 3 elementi `<section>` alternati tramite la classe CSS `.nascosta`
- **Drill-down:** click utente → post filtrati → click post → commenti filtrati (con breadcrumb)
- **Moduli JS:**
  - `api.js` — wrapper fetch con `BASE_URL`, una funzione esportata per ogni chiamata API
  - `ui.js` — funzioni di rendering che ricevono dati + container + callback
  - `app.js` — orchestratore: importa api e ui, gestisce navigazione, form, cancellazioni e stato drill-down

---

## Convenzioni

- Le risposte di errore usano `{ "errore": "..." }`
- Il DELETE restituisce `{ "messaggio": "... eliminato", "<risorsa>": { ... } }`
- Codici di stato: `201` per POST, `400` per errori di validazione, `404` per non trovato, `500` per errori DB
- Gli ID sono generati automaticamente da MySQL (`AUTO_INCREMENT`)
- Foreign keys: `post.userId → utenti.id` e `commenti.postId → post.id` (entrambe `ON DELETE CASCADE`)
- Le credenziali DB vivono in `api/.env` (gitignored); il template è in `api/.env.example`

---

## Documentazione (`docs/`)

| File | Contenuto |
|------|-----------|
| `guida-setup-mysql.md` | Setup Docker, verifica DB, configurazione env, troubleshooting |
| `cheatsheet-sql.md` | Comandi SQL usati nel progetto, query parametrizzate, tipi di risultato |
| `spiegazione-migrazione.md` | Confronto array vs MySQL, async/await, try/catch, connection pool, foreign key |

---

## Note per gli studenti

- `api/data/database.vecchio.js` è il vecchio approccio in-memory — conservato come confronto didattico
- I dati persistono tra i riavvii del server (memorizzati nel volume Docker di MySQL)
- Per resettare tutto: `docker compose down -v && docker compose up -d`
- Il linguaggio del progetto (commenti, nomi dei campi, messaggi di errore) è in italiano