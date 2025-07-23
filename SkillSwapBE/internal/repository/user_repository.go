package repository

import (
	"skillswap/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// CreateUser creates a new user
func (r *UserRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

// GetUserByID retrieves a user by ID with relationships
func (r *UserRepository) GetUserByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Skills").Preload("ReviewsReceived.Reviewer").Find(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByAuth0ID retrieves a user by Auth0 ID
func (r *UserRepository) GetUserByAuth0ID(auth0ID string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "auth0_id = ?", auth0ID).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email
func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser updates a user
func (r *UserRepository) UpdateUser(userID string, updateReq *models.UpdateUserRequest) error {
	updates := make(map[string]interface{})
	
	if updateReq.Username != "" {
		updates["username"] = updateReq.Username
	}
	if updateReq.FullName != "" {
		updates["full_name"] = updateReq.FullName
	}
	if updateReq.Location != "" {
		updates["location"] = updateReq.Location
	}
	if updateReq.Bio != "" {
		updates["bio"] = updateReq.Bio
	}
	if updateReq.Avatar != "" {
		updates["avatar"] = updateReq.Avatar
	}
	
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
}

// SaveUser saves a complete user model
func (r *UserRepository) SaveUser(user *models.User) error {
	return r.db.Save(user).Error
}

// GetUserProfile retrieves complete user profile with skills and reviews
func (r *UserRepository) GetUserProfile(userID string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Skills", "is_active = ?", true).
		Preload("ReviewsReceived.Reviewer").
		Preload("ReviewsReceived", "is_public = ?", true).
		Find(&user, "id = ?", userID).Error
	
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUserPoints updates user points and rank
func (r *UserRepository) UpdateUserPoints(userID string, pointsToAdd int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			return err
		}
		
		user.Points += pointsToAdd
		user.UpdateRank()
		
		return tx.Save(&user).Error
	})
}

// GetUsersByRank retrieves users by rank
func (r *UserRepository) GetUsersByRank(rank models.UserRank, limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("rank = ?", rank).Limit(limit).Find(&users).Error
	return users, err
}

// GetTopUsers retrieves top users by points
func (r *UserRepository) GetTopUsers(limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Order("points DESC").Limit(limit).Find(&users).Error
	return users, err
}