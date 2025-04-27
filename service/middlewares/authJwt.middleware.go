package middleware

import (
	"context"
	"net/http"
	"os"

	userModels "github.com/Samind2/MimiCaare-Project/service/models/user"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection

func SetUserCollectionForMiddleware(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	userCollection = client.Database(dbName).Collection("users")
}

// VerifyToken เป็น Middleware สำหรับตรวจสอบ JWT
// gin.HandlerFunc สร้าง middleware
func VerifyToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง Token จาก Header
		tokenString, _ := c.Cookie("jwt")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "ไม่มีคุกกี้ jwt"})
			c.Abort()
			return
		}

		// Secret Key จาก .env
		secretKey := os.Getenv("SECRET_KEY")
		if secretKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่มี secret key"})
			c.Abort()
			return
		}

		// ตรวจสอบ Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		// ถ้า Token ไม่ถูกต้อง
		if err != nil || !token.Valid {
			c.JSON(http.StatusForbidden, gin.H{"message": "Token ไม่ถูกต้อง"})
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

func VerifyAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง Token จาก Cookie
		tokenString, _ := c.Cookie("jwt")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่พบโทเค็น"})
			c.Abort()
			return
		}

		// อ่าน Secret
		secretKey := os.Getenv("SECRET_KEY")
		if secretKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่มี secret key"})
			c.Abort()
			return
		}

		// ยืนยัน Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusForbidden, gin.H{"message": "Token ไม่ถูกต้อง"})
			c.Abort()
			return
		}

		// อ่าน Claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"message": "ไม่สามารถอ่านข้อมูลผู้ใช้ได้"})
			c.Abort()
			return
		}

		// ดึง userId จาก Claims
		userIdStr, ok := claims["userId"].(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบข้อมูล ID ผู้ใช้"})
			c.Abort()
			return
		}

		userId, err := primitive.ObjectIDFromHex(userIdStr)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "ไอดีผู้ใช้ไม่ถูกต้อง"})
			c.Abort()
			return
		}

		// ค้นหาใน DB
		var user userModels.User
		err = userCollection.FindOne(context.Background(), bson.M{"_id": userId}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบข้อมูลผู้ใช้"})
			c.Abort()
			return
		}

		// เช็ค role
		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"})
			c.Abort()
			return
		}

		// ผ่าน
		c.Set("userId", user.ID.Hex())
		c.Set("username", user.FirstName+" "+user.LastName)
		c.Next()
	}
}
