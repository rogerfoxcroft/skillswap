# SkillSwap

**Learn anything. Teach everything. The hyperlocal skill exchange marketplace.**

A full-stack application for connecting local learners and teachers in a skill exchange marketplace. Built with modern web technologies and optimized for mobile browsers.

## 🏗️ Architecture

This repository contains two main components:

- **SkillSwapWeb** - React web application (Frontend)
- **SkillSwapBE** - Go backend API server

## 🚀 Features

### Frontend (SkillSwapWeb)
- **Mobile-First Design** - Optimized for mobile browsers with responsive layout
- **Auth0 Integration** - Secure authentication and user management
- **Modern Stack** - React 18, TypeScript, Vite, Tailwind CSS
- **Protected Routes** - Authentication-gated content
- **Real-time Dashboard** - User profile, skills, bookings, and statistics

### Backend (SkillSwapBE)
- **REST API** - Complete skill marketplace API
- **JWT Authentication** - Auth0 token validation
- **CORS Support** - Cross-origin requests from web app
- **Go Performance** - Fast, concurrent HTTP server
- **Structured Architecture** - Clean separation of concerns

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Auth0 React SDK (authentication)
- React Router (routing)

### Backend
- Go 1.21+
- Gorilla Mux (HTTP router)
- Auth0 Go JWT Middleware
- CORS middleware

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- Auth0 account and application

### Auth0 Setup
1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a Single Page Application
3. Create an API with identifier: `skillswapapi`
4. Configure application settings:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

### Installation & Running

#### 1. Clone the repository
```bash
git clone git@github.com:rogerfoxcroft/skillswap.git
cd skillswap
```

#### 2. Setup Backend (SkillSwapBE)
```bash
cd SkillSwapBE
go mod tidy
go run cmd/server/main.go
```

The backend will run on `http://localhost:8080`

#### 3. Setup Frontend (SkillSwapWeb)
```bash
cd SkillSwapWeb
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Auth0 credentials:
# VITE_AUTH0_DOMAIN=your-domain.auth0.com
# VITE_AUTH0_CLIENT_ID=your-client-id

npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication Flow

1. User visits the React web app at `http://localhost:3000`
2. User clicks login and is redirected to Auth0
3. After successful login, user is redirected back with authentication
4. React app obtains an access token for the `skillswapapi` audience
5. API calls to protected endpoints include `Authorization: Bearer <token>` header
6. Go backend validates JWT token against Auth0
7. Backend extracts user information from JWT claims
8. Dashboard displays personalized data fetched from backend

## 📁 Project Structure

```
skillswap/
├── SkillSwapWeb/           # React web application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript definitions
│   ├── public/
│   └── package.json
├── SkillSwapBE/            # Go backend server
│   ├── cmd/server/         # Application entry point
│   ├── internal/
│   │   ├── handlers/       # HTTP request handlers
│   │   ├── middleware/     # HTTP middleware
│   │   └── models/         # Data models
│   ├── go.mod
│   └── Makefile
└── README.md
```

## 🌐 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/v1/public/skills` - Get all skills
- `GET /api/v1/public/skills/{id}` - Get skill by ID
- `GET /api/v1/public/skills/search` - Search skills
- `GET /api/v1/public/users` - Get all users
- `GET /api/v1/public/users/{id}` - Get user by ID

### Protected Endpoints (Requires Auth0 JWT)
- `GET /api/v1/protected/dashboard` - User dashboard data
- `GET /api/v1/protected/profile` - User profile
- `GET /api/v1/protected/my-skills` - User's skills

## 🚀 Deployment

### Frontend (SkillSwapWeb)
Build for production:
```bash
cd SkillSwapWeb
npm run build
```
Deploy the `dist` folder to any static hosting service (Vercel, Netlify, AWS S3).

### Backend (SkillSwapBE) - Heroku
The backend is configured for Heroku deployment from the root directory:

#### Quick Deploy (Recommended)
```bash
# Run the deployment script
./deploy-heroku.sh [app-name]
```

#### Manual Deploy
1. **Create Heroku app**:
   ```bash
   heroku create your-skillswap-backend
   heroku addons:create heroku-postgresql:essential-0
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set AUTH0_DOMAIN=foxcroft.uk.auth0.com
   heroku config:set AUTH0_AUDIENCE=skillswapapi
   heroku config:set GO_ENV=production
   ```

3. **Set buildpack and deploy**:
   ```bash
   heroku buildpacks:set heroku/go
   git push heroku master
   ```

#### Deployment Features
- ✅ **PostgreSQL Database** automatically provisioned
- ✅ **Auto-migrations** run on startup
- ✅ **Environment variables** configured
- ✅ **CORS** enabled for frontend integration
- ✅ **Go modules** automatically resolved

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or need help setting up the project, please open an issue on GitHub.

---

**Built with ❤️ for local skill sharing communities**