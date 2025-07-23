package models

import (
	"time"
	"gorm.io/gorm"
)

type Review struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ReviewerID  string         `json:"reviewer_id" gorm:"not null;type:uuid"`
	RevieweeID  string         `json:"reviewee_id" gorm:"not null;type:uuid"`
	BookingID   string         `json:"booking_id" gorm:"type:uuid"`
	Rating      int            `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment     string         `json:"comment"`
	IsPublic    bool           `json:"is_public" gorm:"default:true"`
	
	// Relationships
	Reviewer    User           `json:"reviewer" gorm:"foreignKey:ReviewerID"`
	Reviewee    User           `json:"reviewee" gorm:"foreignKey:RevieweeID"`
	Booking     *Booking       `json:"booking,omitempty" gorm:"foreignKey:BookingID"`
	
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateReviewRequest struct {
	RevieweeID string `json:"reviewee_id" binding:"required"`
	BookingID  string `json:"booking_id"`
	Rating     int    `json:"rating" binding:"required,min=1,max=5"`
	Comment    string `json:"comment"`
	IsPublic   bool   `json:"is_public"`
}

type ReviewSummary struct {
	AverageRating float64 `json:"average_rating"`
	TotalReviews  int64   `json:"total_reviews"`
	RatingBreakdown map[int]int64 `json:"rating_breakdown"`
}

// GetRatingBreakdown returns count of reviews for each star rating
func (r *ReviewSummary) GetRatingBreakdown(reviews []Review) {
	r.RatingBreakdown = make(map[int]int64)
	for i := 1; i <= 5; i++ {
		r.RatingBreakdown[i] = 0
	}
	
	var totalRating int
	for _, review := range reviews {
		r.RatingBreakdown[review.Rating]++
		totalRating += review.Rating
	}
	
	r.TotalReviews = int64(len(reviews))
	if r.TotalReviews > 0 {
		r.AverageRating = float64(totalRating) / float64(r.TotalReviews)
	}
}