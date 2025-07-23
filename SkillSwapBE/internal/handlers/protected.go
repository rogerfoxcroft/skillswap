package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap-be/internal/middleware"
	"skillswap-be/internal/models"
	"time"
)

type DashboardData struct {
	User          *UserProfile `json:"user"`
	MySkills      []models.Skill `json:"my_skills"`
	RecentBookings []models.Booking `json:"recent_bookings"`
	Stats         *UserStats `json:"stats"`
}

type UserProfile struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Email    string  `json:"email"`
	Location string  `json:"location"`
	Rating   float64 `json:"rating"`
	JoinDate string  `json:"join_date"`
}

type UserStats struct {
	TotalSkillsOffered int `json:"total_skills_offered"`
	TotalBookings      int `json:"total_bookings"`
	TotalEarnings      float64 `json:"total_earnings"`
	AverageRating      float64 `json:"average_rating"`
}

func GetUserDashboard(w http.ResponseWriter, r *http.Request) {
	// Extract user info from JWT token
	userClaims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	// Create user profile from JWT claims
	userProfile := &UserProfile{
		ID:       userClaims.Sub,
		Name:     userClaims.Name,
		Email:    userClaims.Email,
		Location: "San Francisco, CA", // This would come from user preferences/database
		Rating:   4.8,
		JoinDate: time.Now().AddDate(0, -6, 0).Format("2006-01-02"),
	}

	// Filter skills for this user (in real app, this would be a database query)
	var userSkills []models.Skill
	for _, skill := range mockSkills {
		// In real implementation, you'd match by user ID from database
		if skill.User.Email == userClaims.Email {
			userSkills = append(userSkills, skill)
		}
	}

	// Create mock recent bookings
	recentBookings := []models.Booking{
		{
			ID:          "booking1",
			SkillID:     "1",
			StudentID:   "student1",
			TeacherID:   userClaims.Sub,
			ScheduledAt: time.Now().AddDate(0, 0, 2),
			Status:      models.BookingConfirmed,
			TotalPrice:  50.0,
			Notes:       "Looking forward to learning guitar basics!",
			CreatedAt:   time.Now().AddDate(0, 0, -3),
			UpdatedAt:   time.Now().AddDate(0, 0, -1),
		},
	}

	// Create user stats
	stats := &UserStats{
		TotalSkillsOffered: len(userSkills),
		TotalBookings:      len(recentBookings),
		TotalEarnings:      250.0,
		AverageRating:      4.8,
	}

	dashboardData := DashboardData{
		User:          userProfile,
		MySkills:      userSkills,
		RecentBookings: recentBookings,
		Stats:         stats,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dashboardData)
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userClaims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	userProfile := &UserProfile{
		ID:       userClaims.Sub,
		Name:     userClaims.Name,
		Email:    userClaims.Email,
		Location: "San Francisco, CA",
		Rating:   4.8,
		JoinDate: time.Now().AddDate(0, -6, 0).Format("2006-01-02"),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userProfile)
}

func GetMySkills(w http.ResponseWriter, r *http.Request) {
	userClaims, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unable to get user information", http.StatusUnauthorized)
		return
	}

	var userSkills []models.Skill
	for _, skill := range mockSkills {
		if skill.User.Email == userClaims.Email {
			userSkills = append(userSkills, skill)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userSkills)
}