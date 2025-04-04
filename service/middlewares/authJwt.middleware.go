package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// VerifyToken เป็น Middleware สำหรับตรวจสอบ JWT
// gin.HandlerFunc สร้าง middleware
func VerifyToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง Token จาก Header
		tokenString, err := c.Cookie("jwt")
		//tokenString := c.GetHeader("x-access-token")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token missing"})
			c.Abort()
			return
		}

		// Secret Key จาก .env
		secretKey := os.Getenv("SECRET_KEY")
		if secretKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Missing secret key"})
			c.Abort()
			return
		}

		// ตรวจสอบ Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		// ถ้า Token ไม่ถูกต้อง
		if err != nil || !token.Valid {
			c.JSON(http.StatusForbidden, gin.H{"message": "Access Forbidden"})
			c.Abort()
			return
		}

		// ดึง Claims (ข้อมูลที่อยู่ใน Token)
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userId", claims["id"])
			c.Set("username", claims["username"])
		}

		// ไปยังฟังก์ชันถัดไป
		c.Next()
	}
}
