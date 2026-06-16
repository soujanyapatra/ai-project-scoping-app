# AI Project Scoping Tool

Laravel + Vue 3 (inside `resources/js`) with SSE streaming for multi-step scoping output.

## Run locally

```bash
composer install
npm install
npm run dev
```

- Laravel API: `http://localhost:8000`
- Vite frontend: `http://localhost:5173`

## Build assets

```bash
npm run build
```

## Key paths

- Frontend app: `resources/js`
- Blade entry: `resources/views/welcome.blade.php`
- API routes: `routes/api.php`
- Scope controller: `app/Http/Controllers/ScopeController.php`
- FastAPI bridge service: `app/Services/FastApiService.php`

