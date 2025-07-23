package models

import (
	"time"
	"gorm.io/gorm"
)

type UserRank string

const (
	RankNovice     UserRank = "Novice"
	RankBeginner   UserRank = "Beginner"
	RankIntermediate UserRank = "Intermediate"
	RankAdvanced   UserRank = "Advanced"
	RankExpert     UserRank = "Expert"
	RankMaster     UserRank = "Master"
)

type User struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Auth0ID     string         `json:"auth0_id" gorm:"uniqueIndex;not null"`
	Username    string         `json:"username" gorm:"uniqueIndex;not null"`
	Email       string         `json:"email" gorm:"uniqueIndex;not null"`
	FullName    string         `json:"full_name" gorm:"not null"`
	Location    string         `json:"location"`
	Avatar      string         `json:"avatar"`
	Bio         string         `json:"bio"`
	Points      int            `json:"points" gorm:"default:0"`
	Rank        UserRank       `json:"rank" gorm:"default:'Novice'"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	ReviewCount int            `json:"review_count" gorm:"default:0"`
	Skills      []Skill        `json:"skills" gorm:"foreignKey:UserID"`
	ReviewsGiven []Review      `json:"reviews_given" gorm:"foreignKey:ReviewerID"`
	ReviewsReceived []Review   `json:"reviews_received" gorm:"foreignKey:RevieweeID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"full_name" binding:"required"`
	Location string `json:"location"`
	Bio      string `json:"bio"`
}

type UpdateUserRequest struct {
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Location string `json:"location"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
}

// CalculateRank determines user rank based on points
func (u *User) CalculateRank() UserRank {
	switch {
	case u.Points >= 10000:
		return RankMaster
	case u.Points >= 5000:
		return RankExpert
	case u.Points >= 2000:
		return RankAdvanced
	case u.Points >= 500:
		return RankIntermediate
	case u.Points >= 100:
		return RankBeginner
	default:
		return RankNovice
	}
}

// UpdateRank updates the user's rank based on current points
func (u *User) UpdateRank() {
	u.Rank = u.CalculateRank()
}