package resendMail

import (
	"context"
	"net/http"
	"os"

	resend "github.com/Samind2/MimiCaare-Project/service/config/resend"
	userModel "github.com/Samind2/MimiCaare-Project/service/models/user"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"
)

var UserCollection *mongo.Collection

func SetUserReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	UserCollection = client.Database(dbName).Collection("users")
}

func SendWelcomeEmail(c *gin.Context) {
	var sendTo struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&sendTo); err != nil {
		c.JSON(400, gin.H{"message": "กรุณาระบุอีเมล"})
		return
	}
	var user userModel.User
	err := UserCollection.FindOne(context.TODO(), bson.M{"email": sendTo.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้งานที่มีอีเมลนี้"})
		return
	}

	// ✉️ ส่งอีเมลต้อนรับ โดยใช้ชื่อผู้ใช้
	subject := "Welcome to MimiCare!"
	content := "<h1>ยินดีต้อนรับคุณ " + user.FirstName + "!</h1><p>ขอบคุณที่เข้าร่วม MimiCare</p>" + "<p>รหัสผ่านสำหรับเข้าใช้ระบบของคุณคือ  </p>"

	err = resend.SendEmail(sendTo.Email, subject, content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ส่งอีเมลล้มเหลว", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ส่งอีเมลสำเร็จ",
		"email":   sendTo.Email,
	})
}
