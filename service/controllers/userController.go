package controllers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/Plashon/service/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection

func SetUserCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่า DBURL จาก .env
	userCollection = client.Database(dbName).Collection("users")
}

// ดึงข้อมูลผู้ใช้ทั้งหมด
func GetUsers(c *gin.Context) {
	ct, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var users []models.User
	data, err := userCollection.Find(ct, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer data.Close(ct)

	for data.Next(ct) {
		var user models.User
		data.Decode(&user)
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

// เพิ่มผู้ใช้ใหม่
func CreateUser(c *gin.Context) {
	var user models.User
	// ดึงข้อมูล JSON ที่ส่งมา
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.ID = primitive.NewObjectID()
	ct, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := userCollection.InsertOne(ct, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}
