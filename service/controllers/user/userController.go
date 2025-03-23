package userController

import (
	"context"
	"net/http"
	"os"

	userModels "github.com/Samind2/MimiCaare-Project/service/models/userModel"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetUserCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")                                // ดึงค่าชื่อฐานข้อมูลจาก .env
	userCollection = client.Database(dbName).Collection("users") // ตั้งค่าชื่อ Collection สำหรับผู้ใช้
}

func Signup(c *gin.Context) {
	user := userModels.User
	//เช็คข้อมูลก่อนว่ามาป่าว
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่มีค่าหรือข้อมูลไม่ถูกต้อง"})
		return
	}

	//เช็คค่าของข้อมูล
	if !user.FirstName || !user.LastName || !user.Email || !user.Password {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}

	existingEmail := userModels.user
	err := userCollection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingEmail)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "อีเมลนี้ถูกใช้ไปแล้ว"})
		return
	}

	//เข้ารหัส รหัสผ่าน
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดระหว่างการเข้ารหัสข้อมูล"})
		return
	}
	user.Password = string(hashPassword)

	//เพิ่มข้อมูลลงฐานข้อมูล
	user.ID = primitive.NewObjectID()
	_, err = userCollection.InsertOne(context.TODO(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดระหว่างสมัครสมาชิก"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"password":  user.Password,
	})
}
