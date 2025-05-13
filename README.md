# Journal My Mind

A mood tracking application built with Next.js, TypeScript, and Radix UI components.

## Features

- Track your daily mood with emoji selection
- Add notes to your mood entries
- View mood history and analytics
- Responsive design for all devices
- Secure authentication with NextAuth.js
- Real-time data with Supabase

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (package manager)
- Supabase account (for database and authentication)
- GitHub account (for deployment)
- Netlify account (for deployment)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mood-tracker.git
cd mood-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy the example environment file and update with your credentials:
```bash
cp env.example .env.local
```

4. Update the `.env.local` file with your Supabase credentials and NextAuth secret:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Deployment

### Deploy to Netlify

1. Push your code to a GitHub repository
2. Sign in to [Netlify](https://www.netlify.com/)
3. Click on "New site from Git"
4. Select your Git provider and repository
5. Configure the build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
   - Add environment variables from your `.env.local` file
6. Click "Deploy site"

### Environment Variables for Production

Make sure to set these environment variables in your Netlify site settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)

## Available Scripts

- `pnpm dev` - Starts the development server
- `pnpm build` - Builds the application for production
- `pnpm start` - Starts the production server
- `pnpm lint` - Runs ESLint for code linting
- `pnpm format` - Formats code with Prettier

## Technologies Used

- **Frontend Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: Supabase
- **Data Visualization**: Chart.js
- **Animations**: Framer Motion
- **Date Handling**: date-fns

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
