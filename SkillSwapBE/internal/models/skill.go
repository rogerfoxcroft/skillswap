package models

import "time"

type Skill struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	UserID      string    `json:"user_id"`
	User        User      `json:"user"`
	Price       float64   `json:"price"`
	Duration    int       `json:"duration"` // in minutes
	Location    string    `json:"location"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateSkillRequest struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Price       float64 `json:"price"`
	Duration    int     `json:"duration"`
	Location    string  `json:"location"`
}

type SkillSearchParams struct {
	Category string `json:"category,omitempty"`
	Location string `json:"location,omitempty"`
	MaxPrice float64 `json:"max_price,omitempty"`
	Query    string `json:"query,omitempty"`
}