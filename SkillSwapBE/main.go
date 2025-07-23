package main

import (
	"log"
	"net/http"
	"os"
	"skillswap/internal/database"
	"skillswap/internal/handlers"
	"skillswap/internal/middleware"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file in development
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(".env"); err != nil {
			log.Println("No .env file found, using environment variables")
		}
	}

	// Initialize database connection
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run database migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Auth0 configuration
	domain := os.Getenv("AUTH0_DOMAIN")
	if domain == "" {
		domain = "foxcroft.uk.auth0.com" // Default for development
	}
	
	audience := os.Getenv("AUTH0_AUDIENCE")
	if audience == "" {
		audience = "skillswapapi" // Default API identifier
	}

	router := mux.NewRouter()

	// Health check endpoint
	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()

	// Public routes (no authentication required)
	public := api.PathPrefix("/public").Subrouter()
	public.HandleFunc("/skills", handlers.GetSkills).Methods("GET")
	public.HandleFunc("/skills/{id}", handlers.GetSkillByID).Methods("GET")
	public.HandleFunc("/skills/search", handlers.SearchSkills).Methods("GET")
	public.HandleFunc("/users", handlers.GetUsers).Methods("GET")
	public.HandleFunc("/users/{id}", handlers.GetUserByID).Methods("GET")
	public.HandleFunc("/users/{id}/skills", handlers.GetUserSkills).Methods("GET")

	// Protected routes (authentication required)
	protected := api.PathPrefix("/protected").Subrouter()
	protected.Use(middleware.EnsureValidToken(domain, audience))
	protected.Use(middleware.EnsureUserExists()) // Automatically create users if they don't exist
	protected.HandleFunc("/dashboard", handlers.GetUserDashboard).Methods("GET")
	protected.HandleFunc("/profile", handlers.GetUserProfile).Methods("GET")
	protected.HandleFunc("/profile", handlers.UpdateUserProfile).Methods("PUT")
	protected.HandleFunc("/profile/{id}", handlers.GetUserProfile).Methods("GET")
	protected.HandleFunc("/my-skills", handlers.GetMySkills).Methods("GET")

	// Apply middleware
	router.Use(middleware.LoggingMiddleware)

	// Setup CORS - get allowed origins from environment or use defaults
	allowedOrigins := []string{
		"http://localhost:3000", 
		"http://localhost:3001", 
		"https://skillswap.softfox.com", // Frontend custom domain
	}
	if corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); corsOrigins != "" {
		// Split comma-separated origins from environment
		allowedOrigins = append(allowedOrigins, corsOrigins)
	}
	// Add common deployment platforms
	allowedOrigins = append(allowedOrigins, 
		"https://skillswapweb.vercel.app",
		"https://skillswapweb-git-main.vercel.app",
		"https://skillswapweb-rogerfoxcroft.vercel.app",
	)
	
	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"},
		AllowCredentials: true,
		Debug:            true, // Enable CORS debugging
	})

	handler := c.Handler(router)

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("SkillSwap Backend server starting on port %s", port)
	log.Printf("Health check available at: http://localhost:%s/health", port)
	log.Printf("Public API base URL: http://localhost:%s/api/v1/public", port)
	log.Printf("Protected API base URL: http://localhost:%s/api/v1/protected", port)
	log.Printf("Auth0 Domain: %s", domain)
	log.Printf("Auth0 Audience: %s", audience)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}