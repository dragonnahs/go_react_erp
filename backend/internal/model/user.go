package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Username  string         `gorm:"size:32;not null;unique" json:"username"`
	Password  string         `gorm:"size:128;not null" json:"-"`
	Email     string         `gorm:"size:128;not null;unique" json:"email"`
	Role      string         `gorm:"size:16;not null" json:"role"`
	Status    string         `gorm:"size:16;not null" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
} 