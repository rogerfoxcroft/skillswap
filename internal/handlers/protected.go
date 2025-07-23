package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/internal/database"
	"skillswap/internal/middleware"
	"skillswap/internal/models"
	"skillswap/internal/repository"
	"github.com/gorilla/mux"
)

type DashboardData struct {
	User          *models.User `json:"user"`
	MySkills      []models.Skill `json:"my_skills"`
	RecentBookings []models.Booking `json:"recent_bookings"`
	Stats         *UserStats `json:"stats"`
}

type UserStats struct {
	TotalSkillsOffered int `json:"total_skills_offered"`
	TotalBookings      int `json:"total_bookings"`
	TotalEarnings      float64 `json:"total_earnings"`
	AverageRating      float64 `json:"average_rating"`
	Points            int `json:"points"`
	Rank              string `json:"rank"`
}

type ProfileResponse struct {
	User    *models.User          `json:"user"`
	Skills  []models.Skill        `json:"skills"`
	Reviews []models.Review       `json:"reviews"`
	Summary *models.ReviewSummary `json:"review_summary"`
}

func GetUserDashboard(w http.ResponseWriter, r *http.Request) {
	// Extract user info from JWT token
	userClaims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	// Get database connection
	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)

	// Get or create user from database
	user, err := userRepo.GetUserByAuth0ID(userClaims.Sub)
	if err != nil {
		// User doesn't exist, create new user
		user = &models.User{
			Auth0ID:  userClaims.Sub,
			Email:    userClaims.Email,
			FullName: userClaims.Name,
			Username: userClaims.Email, // Use email as username initially
			Points:   0,
			Rank:     models.RankNovice,
		}
		if err := userRepo.CreateUser(user); err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	// Get user profile with relationships
	profile, err := userRepo.GetUserProfile(user.ID)
	if err != nil {
		http.Error(w, "Failed to get user profile", http.StatusInternalServerError)
		return
	}

	// Calculate user stats
	stats := &UserStats{
		TotalSkillsOffered: len(profile.Skills),
		TotalBookings:      0, // TODO: Calculate from bookings
		TotalEarnings:      0, // TODO: Calculate from completed bookings
		AverageRating:      profile.Rating,
		Points:            profile.Points,
		Rank:              string(profile.Rank),
	}

	dashboardData := DashboardData{
		User:          profile,
		MySkills:      profile.Skills,
		RecentBookings: []models.Booking{}, // TODO: Get recent bookings
		Stats:         stats,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dashboardData)
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameter or use current user
	vars := mux.Vars(r)
	userID := vars["id"]
	
	// If no ID provided, get current user's profile
	if userID == "" {
		userClaims, err := middleware.GetUserFromContext(r.Context())
		if err != nil {
			http.Error(w, "Unable to get user information", http.StatusUnauthorized)
			return
		}
		
		db := database.GetDB()
		userRepo := repository.NewUserRepository(db)
		
		user, err := userRepo.GetUserByAuth0ID(userClaims.Sub)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		userID = user.ID
	}

	// Get repositories
	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)
	reviewRepo := repository.NewReviewRepository(db)

	// Get user profile
	user, err := userRepo.GetUserProfile(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Get reviews
	reviews, err := reviewRepo.GetReviewsByUser(userID, true)
	if err != nil {
		http.Error(w, "Failed to get reviews", http.StatusInternalServerError)
		return
	}

	// Get review summary
	summary, err := reviewRepo.GetReviewSummary(userID)
	if err != nil {
		http.Error(w, "Failed to get review summary", http.StatusInternalServerError)
		return
	}

	profileResponse := ProfileResponse{
		User:    user,
		Skills:  user.Skills,
		Reviews: reviews,
		Summary: summary,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profileResponse)
}

func GetMySkills(w http.ResponseWriter, r *http.Request) {
	userClaims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)

	// Get user
	user, err := userRepo.GetUserByAuth0ID(userClaims.Sub)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Get user profile with skills
	profile, err := userRepo.GetUserProfile(user.ID)
	if err != nil {
		http.Error(w, "Failed to get user skills", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile.Skills)
}