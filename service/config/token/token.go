package token

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ฟังก์ชันสำหรับสร้าง Token และตั้งค่า Cookie
func GenerateToken(userId string, c *gin.Context) (string, error) {
	// ดึง Secret Key จาก ENV
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		return "", fmt.Errorf("นำเข้าข้อมูลล้มเหลว - ระบบขัดข้องระหว่างการดึง SECRET_KEY")
	}
	node_mode := os.Getenv("NODE_ENV")
	if node_mode == "" {
		return "", fmt.Errorf("นำเข้าข้อมูลล้มเหลว - ระบบขัดข้องระหว่างการดึ NODE_ENV")
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
		return "", fmt.Errorf("สร้างTokenเหลว - ระบบขัดข้องระหว่างการสร้าง Token")
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

	http.SetCookie(c.Writer, cookie)

	fmt.Println("Token generated and cookie set")
	return tokenString, nil
}

// UserClaims คือโครงสร้างสำหรับเก็บข้อมูลผู้ใช้จาก JWT
type UserClaims struct {
	UserId string `json:"userId"`
	jwt.RegisteredClaims
}

// ValidateToken ตรวจสอบว่า Token มีความถูกต้องและคืนค่าข้อมูล Claims
func ValidateToken(tokenString string) (*UserClaims, error) {
	secret := os.Getenv("SECRET_KEY")
	claims := &UserClaims{}
	// ยืนยัน Token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
