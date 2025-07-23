package middleware

import (
	"context"
	"net/http"
	"skillswap/internal/services"
)

// EnsureUserExists middleware that creates a user if they don't exist
func EnsureUserExists() func(next http.Handler) http.Handler {
	userService := services.NewUserService()
	
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user claims from JWT
			claims, err := GetUserFromContext(r.Context())
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Get or create user in database
			user, err := userService.GetOrCreateUser(claims.Sub, claims.Email, claims.Name)
			if err != nil {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			// Add user to request context for handlers to use
			ctx := context.WithValue(r.Context(), "user", user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}