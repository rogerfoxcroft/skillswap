package handlers

import (
	"encoding/json"
	"net/http"
	"skillswap-be/internal/models"
	"time"
	"github.com/gorilla/mux"
)

var mockUsers = []models.User{
	{
		ID:        "user1",
		Username:  "guitarmaster",
		Email:     "john@example.com",
		FullName:  "John Smith",
		Location:  "San Francisco, CA",
		Rating:    4.8,
		CreatedAt: time.Now().AddDate(0, -6, 0),
		UpdatedAt: time.Now().AddDate(0, 0, -1),
	},
	{
		ID:        "user2",
		Username:  "webdev_pro",
		Email:     "sarah@example.com",
		FullName:  "Sarah Johnson",
		Location:  "San Francisco, CA",
		Rating:    4.9,
		CreatedAt: time.Now().AddDate(0, -4, 0),
		UpdatedAt: time.Now().AddDate(0, 0, -2),
	},
	{
		ID:        "user3",
		Username:  "photoartist",
		Email:     "mike@example.com",
		FullName:  "Mike Davis",
		Location:  "San Francisco, CA",
		Rating:    4.7,
		CreatedAt: time.Now().AddDate(0, -8, 0),
		UpdatedAt: time.Now().AddDate(0, 0, -3),
	},
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mockUsers)
}

func GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]
	
	for _, user := range mockUsers {
		if user.ID == userID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)
			return
		}
	}
	
	http.NotFound(w, r)
}

func GetUserSkills(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]
	
	var userSkills []models.Skill
	for _, skill := range mockSkills {
		if skill.UserID == userID {
			userSkills = append(userSkills, skill)
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userSkills)
}