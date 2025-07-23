# SkillSwap Web App

A modern React web application for the SkillSwap hyperlocal skill exchange marketplace, optimized for mobile browsers with Auth0 authentication.

## Features

- **Mobile-First Design**: Optimized for mobile browsers with responsive layout
- **Auth0 Integration**: Secure login and registration with Auth0
- **Modern Stack**: Built with React 18, TypeScript, Vite, and Tailwind CSS
- **Protected Routes**: Route protection for authenticated content
- **Fast Performance**: Vite for lightning-fast development and builds

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Auth0** for authentication
- **React Router** for routing

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Auth0 account and application setup

### Installation

1. Navigate to the web app directory:
   ```bash
   cd SkillSwapWeb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Auth0 configuration:
   ```
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

### Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new Single Page Application
3. Configure allowed callback URLs: `http://localhost:3000`
4. Configure allowed logout URLs: `http://localhost:3000`
5. Copy your domain and client ID to the `.env` file

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Mobile Optimization

The app is designed with mobile browsers in mind:

- Touch-friendly interface
- Responsive design that works on all screen sizes
- Fast loading with optimized assets
- Progressive Web App capabilities (ready for PWA enhancement)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── AuthButton.tsx   # Authentication button
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   └── Home.tsx        # Home/landing page
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles with Tailwind
```

## Backend Integration

The app is configured to work with the SkillSwapBE Go backend:

- API base URL: `http://localhost:8080/api/v1`
- CORS enabled for cross-origin requests
- Ready for skill listings and user management

## Deployment

Build for production:

```bash
npm run build
```

The `dist` folder contains the production-ready files that can be deployed to any static hosting service like Vercel, Netlify, or AWS S3.