package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap/internal/models"
	"time"
	"github.com/gorilla/mux"
)

var mockSkills = []models.Skill{
	{
		ID:          "1",
		Title:       "Guitar Lessons for Beginners",
		Description: "Learn to play guitar from basics to intermediate level. Perfect for complete beginners!",
		Category:    "Music",
		UserID:      "user1",
		User: models.User{
			ID:       "user1",
			Username: "guitarmaster",
			FullName: "John Smith",
			Location: "San Francisco, CA",
			Rating:   4.8,
		},
		Price:     50.0,
		Duration:  60,
		Location:  "San Francisco, CA",
		IsActive:  true,
		CreatedAt: time.Now().AddDate(0, 0, -5),
		UpdatedAt: time.Now().AddDate(0, 0, -1),
	},
	{
		ID:          "2",
		Title:       "Web Development Fundamentals",
		Description: "Learn HTML, CSS, and JavaScript basics. Build your first website!",
		Category:    "Technology",
		UserID:      "user2",
		User: models.User{
			ID:       "user2",
			Username: "webdev_pro",
			FullName: "Sarah Johnson",
			Location: "San Francisco, CA",
			Rating:   4.9,
		},
		Price:     75.0,
		Duration:  90,
		Location:  "San Francisco, CA",
		IsActive:  true,
		CreatedAt: time.Now().AddDate(0, 0, -3),
		UpdatedAt: time.Now().AddDate(0, 0, -1),
	},
	{
		ID:          "3",
		Title:       "Photography Basics",
		Description: "Master the fundamentals of photography. Learn composition, lighting, and camera settings.",
		Category:    "Arts",
		UserID:      "user3",
		User: models.User{
			ID:       "user3",
			Username: "photoartist",
			FullName: "Mike Davis",
			Location: "San Francisco, CA",
			Rating:   4.7,
		},
		Price:     60.0,
		Duration:  120,
		Location:  "San Francisco, CA",
		IsActive:  true,
		CreatedAt: time.Now().AddDate(0, 0, -7),
		UpdatedAt: time.Now().AddDate(0, 0, -2),
	},
}

func GetSkills(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mockSkills)
}

func GetSkillByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	skillID := vars["id"]
	
	for _, skill := range mockSkills {
		if skill.ID == skillID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(skill)
			return
		}
	}
	
	http.NotFound(w, r)
}

func SearchSkills(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	location := r.URL.Query().Get("location")
	query := r.URL.Query().Get("query")
	
	var filteredSkills []models.Skill
	
	for _, skill := range mockSkills {
		match := true
		
		if category != "" && skill.Category != category {
			match = false
		}
		
		if location != "" && skill.Location != location {
			match = false
		}
		
		if query != "" {
			// Simple text search in title and description
			if !contains(skill.Title, query) && !contains(skill.Description, query) {
				match = false
			}
		}
		
		if match {
			filteredSkills = append(filteredSkills, skill)
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredSkills)
}

func contains(str, substr string) bool {
	return len(str) >= len(substr) && (str == substr || 
		(len(substr) > 0 && (str[:len(substr)] == substr || 
		str[len(str)-len(substr):] == substr || 
		findInString(str, substr))))
}

func findInString(str, substr string) bool {
	for i := 0; i <= len(str)-len(substr); i++ {
		if str[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}