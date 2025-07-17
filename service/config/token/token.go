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

// GetCookieConfig จะคืนค่า SameSite + Secure ตาม Environment
func GetCookieConfig() (http.SameSite, bool) {
	env := os.Getenv("NODE_ENV")

	if env == "production" {
		//  Production  ต้องใช้ HTTPS และ Cross-Origin ได้
		return http.SameSiteNoneMode, true
	}

	//  Development  Cross-Origin ได้, ไม่ต้อง HTTPS
	return http.SameSiteNoneMode, false
}

// ฟังก์ชันสำหรับสร้าง Token และตั้งค่า Cookie
func GenerateToken(userId string, c *gin.Context) (string, error) {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		return "", fmt.Errorf("SECRET_KEY missing")
	}

	claims := jwt.MapClaims{
		"userId": userId,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token")
	}

	// ✅ ใช้ Config กลาง
	sameSite, secure := GetCookieConfig()

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   24 * 60 * 60,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
	}

	http.SetCookie(c.Writer, cookie)
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
