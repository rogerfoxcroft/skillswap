package models

import (
	"time"
	"gorm.io/gorm"
)

type Skill struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description"`
	Category    string         `json:"category" gorm:"not null"`
	UserID      string         `json:"user_id" gorm:"not null;type:uuid"`
	User        User           `json:"user" gorm:"foreignKey:UserID"`
	Price       float64        `json:"price" gorm:"not null"`
	Duration    int            `json:"duration" gorm:"not null"` // in minutes
	Location    string         `json:"location"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	Tags        string         `json:"tags"` // JSON array of tags
	Level       string         `json:"level"` // Beginner, Intermediate, Advanced
	MaxStudents int            `json:"max_students" gorm:"default:1"`
	BookingCount int           `json:"booking_count" gorm:"default:0"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	ReviewCount int            `json:"review_count" gorm:"default:0"`
	
	// Relationships
	Bookings    []Booking      `json:"bookings,omitempty" gorm:"foreignKey:SkillID"`
	
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateSkillRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Category    string  `json:"category" binding:"required"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Duration    int     `json:"duration" binding:"required,min=15"`
	Location    string  `json:"location"`
	Level       string  `json:"level"`
	MaxStudents int     `json:"max_students" binding:"min=1"`
	Tags        string  `json:"tags"`
}

type UpdateSkillRequest struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Price       float64 `json:"price" binding:"min=0"`
	Duration    int     `json:"duration" binding:"min=15"`
	Location    string  `json:"location"`
	Level       string  `json:"level"`
	MaxStudents int     `json:"max_students" binding:"min=1"`
	Tags        string  `json:"tags"`
	IsActive    *bool   `json:"is_active"`
}

type SkillSearchParams struct {
	Category    string  `json:"category,omitempty"`
	Location    string  `json:"location,omitempty"`
	MaxPrice    float64 `json:"max_price,omitempty"`
	MinPrice    float64 `json:"min_price,omitempty"`
	Level       string  `json:"level,omitempty"`
	Query       string  `json:"query,omitempty"`
	UserID      string  `json:"user_id,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
	Limit       int     `json:"limit,omitempty"`
	Offset      int     `json:"offset,omitempty"`
}