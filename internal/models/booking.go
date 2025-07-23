package models

import (
	"time"
	"gorm.io/gorm"
)

type BookingStatus string

const (
	BookingPending   BookingStatus = "pending"
	BookingConfirmed BookingStatus = "confirmed"
	BookingCompleted BookingStatus = "completed"
	BookingCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID           string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	SkillID      string         `json:"skill_id" gorm:"not null;type:uuid"`
	Skill        Skill          `json:"skill" gorm:"foreignKey:SkillID"`
	StudentID    string         `json:"student_id" gorm:"not null;type:uuid"`
	Student      User           `json:"student" gorm:"foreignKey:StudentID"`
	TeacherID    string         `json:"teacher_id" gorm:"not null;type:uuid"`
	Teacher      User           `json:"teacher" gorm:"foreignKey:TeacherID"`
	ScheduledAt  time.Time      `json:"scheduled_at" gorm:"not null"`
	CompletedAt  *time.Time     `json:"completed_at"`
	Status       BookingStatus  `json:"status" gorm:"default:'pending'"`
	TotalPrice   float64        `json:"total_price" gorm:"not null"`
	Notes        string         `json:"notes"`
	StudentNotes string         `json:"student_notes"`
	TeacherNotes string         `json:"teacher_notes"`
	
	// Relationships
	Reviews      []Review       `json:"reviews,omitempty" gorm:"foreignKey:BookingID"`
	
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateBookingRequest struct {
	SkillID     string    `json:"skill_id" binding:"required"`
	ScheduledAt time.Time `json:"scheduled_at" binding:"required"`
	Notes       string    `json:"notes"`
}

type UpdateBookingRequest struct {
	ScheduledAt  *time.Time     `json:"scheduled_at"`
	Status       BookingStatus  `json:"status"`
	Notes        string         `json:"notes"`
	StudentNotes string         `json:"student_notes"`
	TeacherNotes string         `json:"teacher_notes"`
}