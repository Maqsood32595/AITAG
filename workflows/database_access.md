# Database Access Workflow

## Architecture
The AITAG project uses Supabase as a PostgreSQL backend with resilient in-memory fallbacks when Supabase is disconnected.

## Environments
1. **Production (main)**
   - **Project Ref:** byekbjxiowkrtwpsxevz
   - **URL:** https://byekbjxiowkrtwpsxevz.supabase.co
   - **Password:** Configured in secure secret store / `.env`
   - **Env File:** `.env`

2. **Development (dev)**
   - **Project Ref:** trdwewugrqdpopzqhkuk
   - **URL:** https://trdwewugrqdpopzqhkuk.supabase.co
   - **Password:** Configured in secure secret store / `.env.development`
   - **Env File:** `.env.development`

## How to Manage the Database Schema
Instead of connecting directly to Postgres via standard connection strings (which fail on IPv4 networks due to Supabase enforcing IPv6), use the **Supabase CLI**.

### Linking to a Project
To link the local CLI to a specific project (e.g., Development):
```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_YOUR_PAT_TOKEN"
npx supabase link --project-ref <PROJECT_REF> -p "<DB_PASSWORD>"
```

### Pushing Schema Changes
1. Write raw SQL into a new migration file inside `supabase/migrations/` (e.g. `20261012000000_new_table.sql`).
2. Run `npx supabase db push` to push the changes to the currently linked project.

### Fetching Data
You can query the database directly using `pg` inside a Node script, but you **must use the pooler connection string** instead of the direct IP connection string to bypass IPv6 limits. Alternatively, testing queries with `supabase-js` (via `.env` keys) is preferred.
