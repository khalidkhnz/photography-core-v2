# Photography Core

A central nucleus for photography operations built with Next.js, Prisma, and NextAuth.js.

## Features

- **Authentication**: Email/password authentication with NextAuth.js
- **Dashboard**: Comprehensive admin dashboard for managing photography operations
- **Shoot Management**: Create, view, edit, and delete photography shoots
- **Team Management**: Manage photographers and editors
- **Client Management**: Track clients and their shoots
- **Dark/Light Mode**: Full theme support with CSS variables
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **UI**: Shadcn/ui components with Tailwind CSS
- **Theme**: next-themes for dark/light mode
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd photography-core
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Update the `.env` file with your database URL and other required variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/photography_core"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed the database with initial data
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Account

After running the seed script, you can log in with:

- **Email**: admin@photography-core.com
- **Password**: admin123

## Database Schema

The application includes the following main entities:

- **Users**: Admin users with authentication
- **Clients**: Photography clients
- **Shoot Types**: Different types of photography shoots (Real Estate, Drone, Event, etc.)
- **Locations**: Shoot locations
- **Photographers**: Photography team members
- **Editors**: Editing team members
- **Shoots**: Main photography projects with relationships to all other entities

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (dashboard)/       # Dashboard layout and pages
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── server/                # Server-side code
│   ├── actions/           # Server actions for database operations
│   └── auth/              # Authentication configuration
├── styles/                # Global styles and theme variables
└── lib/                   # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Features Overview

### Dashboard

- Overview of all photography operations
- Quick stats and metrics
- Recent shoots and quick actions

### Shoot Management

- Create new shoots with comprehensive details
- Assign photographers and editors
- Track shoot status and timeline
- Manage deliverables and notes

### Team Management

- Manage photographer profiles and specialties
- Manage editor profiles and skills
- Track team assignments to shoots

### Client Management

- Maintain client database
- Track client shoot history
- Manage client contact information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
