# SkillSwap Backend (SkillSwapBE)

A Go backend API server for the SkillSwap hyperlocal skill exchange marketplace.

## Features

- RESTful API for skills marketplace
- User management
- Skill listings and search
- Health check endpoint
- CORS support for React Native app
- Request logging middleware

## API Endpoints

### Health
- `GET /health` - Health check

### Skills
- `GET /api/v1/skills` - Get all skills
- `GET /api/v1/skills/{id}` - Get skill by ID
- `GET /api/v1/skills/search?category=&location=&query=` - Search skills

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{id}` - Get user by ID
- `GET /api/v1/users/{id}/skills` - Get skills by user

## Getting Started

### Prerequisites
- Go 1.21 or higher

### Installation

1. Navigate to the backend directory:
   ```bash
   cd SkillSwapBE
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

   Or use the Makefile:
   ```bash
   make run
   ```

The server will start on `http://localhost:8080`

### Environment Variables

- `PORT` - Server port (default: 8080)

## Development

### Build
```bash
make build
```

### Run
```bash
make run
```

### Test
```bash
make test
```

## Project Structure

```
SkillSwapBE/
├── cmd/server/          # Application entry point
├── internal/
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # HTTP middleware
│   └── models/          # Data models
├── pkg/utils/           # Utility functions
├── go.mod              # Go module definition
└── README.md           # This file
```