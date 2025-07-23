#!/bin/bash

echo "🚀 Setting up SkillSwap for local development..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    exit 1
fi

# Create database if it doesn't exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw skillswap; then
    echo "📊 Creating skillswap database..."
    createdb skillswap
    psql -d skillswap -f SkillSwapBE/init_schema.sql
    echo "✅ Database created and schema applied"
else
    echo "✅ Database already exists"
fi

# Setup backend
echo "🔧 Setting up backend..."
cd SkillSwapBE
go mod tidy

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=skillswap
DB_PORT=5432
DB_SSLMODE=disable
DB_DEBUG=true

AUTH0_DOMAIN=foxcroft.uk.auth0.com
AUTH0_AUDIENCE=skillswapapi

GO_ENV=development
EOL
    echo "⚠️  Please update the .env file with your PostgreSQL password and Auth0 settings"
fi

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd SkillSwapWeb
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Backend:  cd SkillSwapBE && go run main.go"
echo "2. Frontend: cd SkillSwapWeb && npm run dev"
echo ""
echo "Backend will be at: http://localhost:8080"
echo "Frontend will be at: http://localhost:3000"