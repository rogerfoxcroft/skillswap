.PHONY: build run test clean help

# Build the application
build:
	go build -o bin/skillswap-be cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run tests
test:
	go test ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Install dependencies
deps:
	go mod tidy
	go mod download

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Help
help:
	@echo "Available commands:"
	@echo "  build  - Build the application"
	@echo "  run    - Run the application"
	@echo "  test   - Run tests"
	@echo "  clean  - Clean build artifacts"
	@echo "  deps   - Install dependencies"
	@echo "  fmt    - Format code"
	@echo "  lint   - Lint code"
	@echo "  help   - Show this help message"