package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

type CustomClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (c *CustomClaims) Validate(ctx context.Context) error {
	// Custom validation logic if needed
	return nil
}

func EnsureValidToken(domain, audience string) func(next http.Handler) http.Handler {
	issuerURL, err := url.Parse("https://" + domain + "/")
	if err != nil {
		log.Fatalf("Failed to parse the issuer url: %v", err)
	}

	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)
	keyFunc := provider.KeyFunc
	
	validator, err := validator.New(
		keyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{audience},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		log.Fatalf("Failed to set up the validator: %v", err)
	}

	middleware := jwtmiddleware.New(
		validator.ValidateToken,
		jwtmiddleware.WithErrorHandler(func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("Encountered error while validating JWT: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "unauthorized", "message": "Invalid or missing token"}`))
		}),
		jwtmiddleware.WithTokenExtractor(func(r *http.Request) (string, error) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				return "", fmt.Errorf("authorization header is required")
			}

			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				return "", fmt.Errorf("authorization header format must be Bearer {token}")
			}

			return tokenParts[1], nil
		}),
	)

	return middleware.CheckJWT
}

// Helper function to extract user info from JWT token
func GetUserFromContext(ctx context.Context) (*CustomClaims, error) {
	claims, ok := ctx.Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
	if !ok {
		return nil, fmt.Errorf("no claims found in context")
	}

	customClaims, ok := claims.CustomClaims.(*CustomClaims)
	if !ok {
		return nil, fmt.Errorf("no custom claims found")
	}

	return customClaims, nil
}