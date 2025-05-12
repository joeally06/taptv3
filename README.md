# Tennessee Association of Pupil Transportation

The official website for the Tennessee Association of Pupil Transportation (TAPT), promoting safe transportation for all Tennessee school children through education, training, and advocacy.

## 🚀 Features

- Conference registration and management
- Regional luncheon registration
- Hall of Fame nominations and member directory
- Board member directory
- Resource library
- Administrative dashboard
- User authentication and role-based access
- Secure database integration

## 🛠️ Tech Stack

- [Astro](https://astro.build) - Web framework for content-focused websites
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Supabase](https://supabase.com) - Open source Firebase alternative
  - Authentication
  - PostgreSQL Database
  - Row Level Security
- TypeScript - Type-safe JavaScript

## 📦 Dependencies

```json
{
  "dependencies": {
    "astro": "^5.2.5",
    "@astrojs/tailwind": "^5.1.0",
    "@supabase/supabase-js": "^2.39.0",
    "tailwindcss": "^3.4.1"
  }
}
```

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Available Commands

| Command                   | Action                                           |
| :----------------------- | :----------------------------------------------- |
| `npm install`            | Installs dependencies                            |
| `npm run dev`            | Starts local dev server at `localhost:4321`      |
| `npm run build`          | Build your production site to `./dist/`          |
| `npm run preview`        | Preview your build locally, before deploying     |
| `npm run astro ...`      | Run CLI commands like `astro add`, `astro check` |

## 🗄️ Database

This project uses Supabase for data storage and authentication:

- PostgreSQL database with Row Level Security
- Built-in authentication
- Secure API access
- Real-time capabilities
- Type-safe database operations

## 🔐 Authentication

- Email/password authentication
- Role-based access control
- Secure session management
- Protected admin routes

## 📄 License

All rights reserved. © Tennessee Association of Pupil Transportation.