# Journal My Mind

A mood tracking application built with Next.js, TypeScript, and Radix UI components.

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (package manager)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Starts the development server
- `pnpm build` - Builds the application for production
- `pnpm start` - Starts the production server
- `pnpm lint` - Runs ESLint for code linting

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Radix UI Components
- Supabase (Authentication)
- Chart.js (Data Visualization)
- Framer Motion (Animations)
- date-fns (Date Handling)
