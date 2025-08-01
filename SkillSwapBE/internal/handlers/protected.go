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
	// Get user from context (created by EnsureUserExists middleware)
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	// Get JWT claims for email
	claims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user claims", http.StatusUnauthorized)
		return
	}

	// Get user profile with relationships
	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)
	
	profile, err := userRepo.GetUserProfile(user.ID)
	if err != nil {
		http.Error(w, "Failed to get user profile", http.StatusInternalServerError)
		return
	}

	// Add email from JWT claims to user profile
	profileWithEmail := *profile
	profileWithEmail.Email = claims.Email

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
		User:          &profileWithEmail,
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
	var isCurrentUser bool
	var currentUserClaims *middleware.CustomClaims
	
	// If no ID provided, get current user's profile
	if userID == "" {
		userClaims, err := middleware.GetUserFromContext(r.Context())
		if err != nil {
			http.Error(w, "Unable to get user information", http.StatusUnauthorized)
			return
		}
		currentUserClaims = userClaims
		isCurrentUser = true
		
		db := database.GetDB()
		userRepo := repository.NewUserRepository(db)
		
		user, err := userRepo.GetUserByAuth0ID(userClaims.Sub)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		userID = user.ID
	} else {
		// Check if this is the current user's own profile
		if userClaims, err := middleware.GetUserFromContext(r.Context()); err == nil {
			db := database.GetDB()
			userRepo := repository.NewUserRepository(db)
			currentUser, err := userRepo.GetUserByAuth0ID(userClaims.Sub)
			if err == nil && currentUser.ID == userID {
				isCurrentUser = true
				currentUserClaims = userClaims
			}
		}
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

	// Add email from JWT claims if this is the current user
	if isCurrentUser && currentUserClaims != nil {
		userWithEmail := *user
		userWithEmail.Email = currentUserClaims.Email
		user = &userWithEmail
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

func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	// Get user from context (created by EnsureUserExists middleware)
	user, ok := r.Context().Value("user").(*models.User)
	if !ok {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var updateReq models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get database connection
	db := database.GetDB()
	userRepo := repository.NewUserRepository(db)

	// Update user profile
	err := userRepo.UpdateUser(user.ID, &updateReq)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	// Get updated profile
	updatedProfile, err := userRepo.GetUserProfile(user.ID)
	if err != nil {
		http.Error(w, "Failed to get updated profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedProfile)
}