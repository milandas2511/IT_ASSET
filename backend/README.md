# IT Asset Management System - Backend

## Setup
```bash
cd backend
npm install
```

Create `.env` from `.env.example` and make sure MongoDB is running.

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## REST APIs
- `GET /api/assets`
- `GET /api/assets?search=AST-001`
- `GET /api/assets?status=Available`
- `GET /api/assets/stats`
- `GET /api/assets/:id`
- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`
