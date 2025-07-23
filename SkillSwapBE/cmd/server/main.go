package main

import (
	"log"
	"net/http"
	"os"
	"skillswap-be/internal/handlers"
	"skillswap-be/internal/middleware"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
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
	protected.HandleFunc("/dashboard", handlers.GetUserDashboard).Methods("GET")
	protected.HandleFunc("/profile", handlers.GetUserProfile).Methods("GET")
	protected.HandleFunc("/my-skills", handlers.GetMySkills).Methods("GET")

	// Apply middleware
	router.Use(middleware.LoggingMiddleware)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // React app origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
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