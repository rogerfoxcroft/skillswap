package models

import "time"

type BookingStatus string

const (
	BookingPending   BookingStatus = "pending"
	BookingConfirmed BookingStatus = "confirmed"
	BookingCompleted BookingStatus = "completed"
	BookingCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID           string        `json:"id"`
	SkillID      string        `json:"skill_id"`
	Skill        Skill         `json:"skill"`
	StudentID    string        `json:"student_id"`
	Student      User          `json:"student"`
	TeacherID    string        `json:"teacher_id"`
	Teacher      User          `json:"teacher"`
	ScheduledAt  time.Time     `json:"scheduled_at"`
	Status       BookingStatus `json:"status"`
	TotalPrice   float64       `json:"total_price"`
	Notes        string        `json:"notes,omitempty"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

type CreateBookingRequest struct {
	SkillID     string    `json:"skill_id"`
	ScheduledAt time.Time `json:"scheduled_at"`
	Notes       string    `json:"notes,omitempty"`
}