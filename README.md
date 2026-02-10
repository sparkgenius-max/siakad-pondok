# SIAKAD Pondok Pesantren MVP

A simple, practical Academic Information System for a single Pondok Pesantren.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## Features
- **Dashboard**: Overview of santri, permissions, and payments.
- **Santri Management**: Add, edit, list santri (NIS, Class, Dorm).
- **Payments**: Record syahriah payments.
- **Permissions**: Manage logic for sick/permit/late.
- **Grades**: Input academic grades.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL script found in `SUPABASE_SCHEMA.sql` in your Supabase SQL Editor.
This will create:
- Tables: `profiles`, `santri`, `payments`, `permissions`, `grades`
- RLS Policies for security
- Triggers for user creation

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

## Folder Structure
```
/src
  /app
    /(auth)         -> Login/Auth pages
    /(dashboard)    -> Main app pages (protected)
      /santri       -> Santri management
      /payments     -> Payment management (TODO)
      /permissions  -> Permission management (TODO)
      /grades       -> Grade management (TODO)
  /components
    /ui             -> Reusable UI components (shadcn)
    /layout         -> Sidebar, Header
    /santri         -> Santri specific components
  /lib
    /supabase       -> Supabase clients (client/server/middleware)
  /types            -> Global TypeScript types
```

## Deployment
Deploy to Vercel and set the Environment Variables in the Vercel Project Settings.
