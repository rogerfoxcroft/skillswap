package repository

import (
	"skillswap/internal/models"
	"gorm.io/gorm"
)

type ReviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

// CreateReview creates a new review
func (r *ReviewRepository) CreateReview(review *models.Review) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the review
		if err := tx.Create(review).Error; err != nil {
			return err
		}
		
		// Update reviewee's rating and count
		return r.updateUserRating(tx, review.RevieweeID)
	})
}

// GetReviewsByUser retrieves all reviews for a user
func (r *ReviewRepository) GetReviewsByUser(userID string, isPublic bool) ([]models.Review, error) {
	var reviews []models.Review
	query := r.db.Preload("Reviewer").Where("reviewee_id = ?", userID)
	
	if isPublic {
		query = query.Where("is_public = ?", true)
	}
	
	err := query.Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

// GetReviewByID retrieves a review by ID
func (r *ReviewRepository) GetReviewByID(id string) (*models.Review, error) {
	var review models.Review
	err := r.db.Preload("Reviewer").Preload("Reviewee").First(&review, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

// GetReviewSummary gets review summary for a user
func (r *ReviewRepository) GetReviewSummary(userID string) (*models.ReviewSummary, error) {
	var reviews []models.Review
	err := r.db.Where("reviewee_id = ? AND is_public = ?", userID, true).Find(&reviews).Error
	if err != nil {
		return nil, err
	}
	
	summary := &models.ReviewSummary{}
	summary.GetRatingBreakdown(reviews)
	
	return summary, nil
}

// UpdateReview updates a review
func (r *ReviewRepository) UpdateReview(review *models.Review) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(review).Error; err != nil {
			return err
		}
		
		// Update reviewee's rating
		return r.updateUserRating(tx, review.RevieweeID)
	})
}

// DeleteReview deletes a review
func (r *ReviewRepository) DeleteReview(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var review models.Review
		if err := tx.First(&review, "id = ?", id).Error; err != nil {
			return err
		}
		
		if err := tx.Delete(&review).Error; err != nil {
			return err
		}
		
		// Update reviewee's rating
		return r.updateUserRating(tx, review.RevieweeID)
	})
}

// updateUserRating recalculates and updates user's average rating
func (r *ReviewRepository) updateUserRating(tx *gorm.DB, userID string) error {
	var avgRating float64
	var count int64
	
	// Calculate average rating
	err := tx.Model(&models.Review{}).
		Where("reviewee_id = ? AND is_public = ?", userID, true).
		Select("AVG(rating) as avg_rating, COUNT(*) as count").
		Row().Scan(&avgRating, &count)
	
	if err != nil {
		return err
	}
	
	// Update user's rating and review count
	return tx.Model(&models.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"rating":       avgRating,
			"review_count": count,
		}).Error
}

// GetReviewsByBooking retrieves reviews for a specific booking
func (r *ReviewRepository) GetReviewsByBooking(bookingID string) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Preload("Reviewer").Preload("Reviewee").
		Where("booking_id = ?", bookingID).
		Find(&reviews).Error
	return reviews, err
}

// HasUserReviewedBooking checks if user has already reviewed a booking
func (r *ReviewRepository) HasUserReviewedBooking(reviewerID, bookingID string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Review{}).
		Where("reviewer_id = ? AND booking_id = ?", reviewerID, bookingID).
		Count(&count).Error
	return count > 0, err
}