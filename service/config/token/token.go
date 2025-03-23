package token

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ฟังก์ชันสำหรับสร้าง Token และตั้งค่า Cookie
func GenerateToken(userId string, c *gin.Context) {
	// ดึง Secret Key จาก ENV
	secret := os.Getenv("KEY_PASS")
	if secret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Missing secret key"})
		return
	}
	node_mode := os.Getenv("NODE_ENV")
	if node_mode == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Missing node mode"})
		return
	}

	// สร้าง Claims สำหรับ JWT เอาไว้ใช้ตอนสร้างโทเค่นใช้บอกว่าโทเค่นมีอะไร
	claims := jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().Add(24 * time.Hour).Unix(), // ตั้งเวลาให้หมดอายุใน 1 วัน
	}

	// สร้าง Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}

	// ตั้งค่า Cookie
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   24 * 60 * 60,
		HttpOnly: true,
		Secure:   node_mode != "development",
		SameSite: http.SameSiteStrictMode, // ป้องกัน CSRF
	}

	http.SetCookie(c.Writer, cookie)

	fmt.Println("Token generated and cookie set")
}
