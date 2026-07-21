# KitchenOS v5.1 — Workspace Architecture

Clean static prototype implementing the agreed product architecture:

- Manager mode: Dashboard, Kitchen, Service, Setup
- Kitchen mode: Kitchen work only
- Service mode: Service work only
- Reports visible only from Manager Dashboard
- Editable module visibility in Setup
- No PIN/login yet; the top-right preview switch simulates the three access profiles
- No Supabase, service worker, build tools or legacy files

## Deploy

Upload these files to the root of the `KitchenOS-v5` GitHub repository. Vercel framework preset: **Other**. Leave build and output settings empty.
