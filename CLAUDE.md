## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Framework**: SvelteKit (Svelte 5 runes mode)
- **UI**: shadcn-svelte (vega style), Lucide icons
- **Styling**: Tailwind CSS 4
- **Database**: MySQL (mysql2)
- **Adapter**: @sveltejs/adapter-node

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**rina-inventa** is an inventory inspection dashboard. It manages asset master data from Excel files and inspection records. Refactored from `../rina-inventa-2`.

## Build & Run

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm check        # Type checking
```

## Repository Structure

```
src/
├── lib/
│   ├── server/          # Server-only: db.ts, auth.ts, crud.ts, excel.ts, table-config.ts
│   ├── components/
│   │   └── shadcn-ui/   # Generated shadcn-svelte components
│   ├── types.ts         # Shared TypeScript interfaces
│   └── format.ts        # Rupiah formatting utilities
├── app/
│   ├── components/      # App-specific components (Navbar, Sidebar, dialogs, etc.)
│   ├── content/         # Page content components
│   └── styles/          # Base CSS styles
├── routes/
│   ├── admin/[table]/   # Dynamic CRUD routes for source tables
│   ├── admin/room/      # Room CRUD with QR code
│   ├── admin/unit/      # Unit CRUD
│   ├── admin/users/     # User management (admin only)
│   ├── admin/tool-machine-inspection/  # Inspection CRUD with image
│   ├── inspections/     # Public inspection list
│   ├── login/           # Authentication
│   └── api/upload/image/  # Image upload endpoint
├── hooks.server.ts      # Auth middleware
└── app.d.ts             # App type definitions
resources/               # Source Excel files
```

## Conventions

- **Table names**: camelCase (e.g., `toolMachine`, `permanentAsset`)
- **Column names**: camelCase (e.g., `bookDate`, `acquisitionValue`)
- **URL paths**: kebab-case (e.g., `/admin/tool-machine`)
- **Query params**: kebab-case (e.g., `?room-id=1`)
- **KIB column**: always renamed to `code`

## Database

- Schema: `src/lib/server/schema.sql`
- Default admin: `admin` / `admin`
- Session-based auth with 7-day cookie expiry
