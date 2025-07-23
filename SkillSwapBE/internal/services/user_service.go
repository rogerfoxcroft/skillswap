package services

import (
	"fmt"
	"log"
	"skillswap/internal/database"
	"skillswap/internal/models"
	"strings"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

// GetOrCreateUser retrieves an existing user or creates a new one from Auth0 claims
func (s *UserService) GetOrCreateUser(auth0ID, email, name string) (*models.User, error) {
	// First, try to find existing user by Auth0 ID
	var user models.User
	result := database.DB.Where("auth0_id = ?", auth0ID).First(&user)
	
	if result.Error == nil {
		// User exists, return it
		log.Printf("Found existing user with Auth0 ID: %s", user.Auth0ID)
		return &user, nil
	}

	// User doesn't exist, create a new one
	log.Printf("Creating new user for Auth0 ID: %s", auth0ID)
	
	// Generate a username from email
	username := s.generateUsername(email)
	
	// Extract full name, fallback to email local part if name is empty
	fullName := name
	if fullName == "" && email != "" {
		fullName = strings.Split(email, "@")[0]
	}

	newUser := models.User{
		Auth0ID:     auth0ID,
		Username:    username,
		FullName:    fullName,
		Points:      0,
		Rank:        models.Novice,
		Rating:      0.0,
		ReviewCount: 0,
	}

	// Create user in database
	if err := database.DB.Create(&newUser).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	log.Printf("Successfully created new user with Auth0 ID: %s", newUser.Auth0ID)
	return &newUser, nil
}

// generateUsername creates a unique username from email
func (s *UserService) generateUsername(email string) string {
	// Start with the local part of email
	baseName := strings.Split(email, "@")[0]
	
	// Clean up the username (remove special characters, convert to lowercase)
	baseName = strings.ToLower(baseName)
	baseName = strings.ReplaceAll(baseName, ".", "")
	baseName = strings.ReplaceAll(baseName, "+", "")
	baseName = strings.ReplaceAll(baseName, "-", "")
	
	// Check if username is available
	username := baseName
	counter := 1
	
	for {
		var existingUser models.User
		result := database.DB.Where("username = ?", username).First(&existingUser)
		
		if result.Error != nil {
			// Username is available
			break
		}
		
		// Username exists, try with a number suffix
		username = fmt.Sprintf("%s%d", baseName, counter)
		counter++
		
		// Prevent infinite loop
		if counter > 1000 {
			username = fmt.Sprintf("%s_%d", baseName, models.GenerateRandomInt())
			break
		}
	}
	
	return username
}

// UpdateUserProfile updates user profile information
func (s *UserService) UpdateUserProfile(userID string, updates map[string]interface{}) error {
	result := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates)
	if result.Error != nil {
		return fmt.Errorf("failed to update user profile: %v", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found")
	}
	
	return nil
}

// GetUserByAuth0ID retrieves a user by their Auth0 ID
func (s *UserService) GetUserByAuth0ID(auth0ID string) (*models.User, error) {
	var user models.User
	result := database.DB.Where("auth0_id = ?", auth0ID).First(&user)
	
	if result.Error != nil {
		return nil, fmt.Errorf("user not found: %v", result.Error)
	}
	
	return &user, nil
}

// GetUserByID retrieves a user by their UUID
func (s *UserService) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	result := database.DB.Where("id = ?", userID).First(&user)
	
	if result.Error != nil {
		return nil, fmt.Errorf("user not found: %v", result.Error)
	}
	
	return &user, nil
}