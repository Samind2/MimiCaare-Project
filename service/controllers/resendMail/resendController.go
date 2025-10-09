package resendMail

import (
	"math/rand"
	"net/http"
	"os"

	resend "github.com/Samind2/MimiCaare-Project/service/config/resend"

	"github.com/Samind2/MimiCaare-Project/service/config/token"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var UserCollection *mongo.Collection

func SetUserReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	UserCollection = client.Database(dbName).Collection("users")
}

type ResendMailRequest struct {
	Email     string `json:"email" binding:"required" example:"email@mail.com"`
	FirstName string `json:"firstName" binding:"required" example:"สมชาย"`
}

// @Summary ส่งรหัสผ่านใหม่ไปยังอีเมลของผู้ใช้
// @Description ใช้สำหรับส่งรหัสผ่านใหม่ไปยังอีเมลของผู้ใช้ (กรณีลืมรหัสผ่าน)
// @Tags ResendMail
// @Accept json
// @Produce json
// @Param request body ResendMailRequest true "ข้อมูลอีเมลและชื่อผู้ใช้"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /resendMail/send-password [post]
func SendPasswordToMail(c *gin.Context) {
	// สุ่มรหัสผ่านใหม่
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
	const length = 12
	randomWord := make([]byte, length)
	for i := range randomWord {
		randomWord[i] = charset[rand.Intn(len(charset))]
	}
	newPassword := randomWord
	// แฮชรหัสผ่านใหม่
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถสร้างรหัสผ่านใหม่ได้", "error": err.Error()})
		return
	}
	var req struct {
		Email     string `json:"email"`
		FirstName string `json:"firstName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "ข้อมูลไม่ถูกต้อง",
			"error":   err.Error(),
		})
		return
	}
	// เตรียม filter สำหรับค้นหา
	findData := bson.M{
		"email":     req.Email,
		"firstName": req.FirstName,
	}
	// struct สำหรับเก็บผลลัพธ์
	var user struct {
		ID        primitive.ObjectID `bson:"_id" json:"id"`
		FirstName string             `bson:"firstName" json:"firstName"`
		Email     string             `bson:"email" json:"email"`
	}
	// ค้นหาผู้ใช้ในฐานข้อมูล
	err = UserCollection.FindOne(c, findData).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการค้นหาผู้ใช้", "error": err.Error()})
		}
		return
	}
	// อัปเดตรหัสผ่านใหม่ในฐานข้อมูล
	update := bson.M{
		"$set": bson.M{
			"password": hashedPassword,
		},
	}
	_, err = UserCollection.UpdateOne(c, bson.M{"_id": user.ID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถอัปเดตรหัสผ่านได้", "error": err.Error()})
		return
	}

	// ส่งอีเมลแจ้งเตือนผู้ใช้
	subject := "รหัสผ่านใหม่สำหรับ MimiCare"
	content := "<h1>รหัสผ่านใหม่ของคุณคือ: " + string(newPassword) + "</h1><p>กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่นี้</p>"
	err = resend.SendEmail(req.Email, subject, content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ส่งอีเมลล้มเหลว", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":   "รหัสผ่านถูกอัปเดตและส่งอีเมลเรียบร้อยแล้ว",
		"email":     req.Email,
		"firstName": req.FirstName,
	})
}

func SendWelcomeEmail(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}
	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	userObjectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}
	// ค้นหาผู้ใช้ในฐานข้อมูล
	var user struct {
		Email     string `bson:"email" json:"email"`
		FirstName string `bson:"firstName" json:"firstName"`
	}
	err = UserCollection.FindOne(c, bson.M{"_id": userObjectId}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้"})
		return
	}
	// ✉️ ส่งอีเมลต้อนรับ โดยใช้ชื่อผู้ใช้
	subject := "Welcome to MimiCare!"
	content := "<h1>ยินดีต้อนรับคุณ " + user.FirstName + "!</h1><p>ขอบคุณที่เข้าร่วม MimiCare</p>" + "<p>รหัสผ่านสำหรับเข้าใช้ระบบของคุณคือ  </p>"

	err = resend.SendEmail(user.Email, subject, content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ส่งอีเมลล้มเหลว", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ส่งอีเมลสำเร็จ",
		"email":   user.Email,
	})
}
