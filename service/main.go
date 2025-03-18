package main

import (
	"log"
	"net/http"
	"os"

	database "github.com/Plashon/service/config"
	"github.com/Plashon/service/controllers"
	routes "github.com/Plashon/service/routers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// โหลดค่าจาก .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ ไม่สามารถโหลดไฟล์ .env")
	}

	// เชื่อมต่อกับฐานข้อมูล
	database.ConnectDB() // เรียกใช้ฟังก์ชัน ConnectDB

	controllers.SetUserCollection(database.Client) // ใช้ Client ที่เชื่อมต่อกับ MongoDB

	r := gin.Default()

	// Welcome Page
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte("<h1>welcome to Project restful api</h1>"))
	})

	// API Routes
	api := r.Group("/api/v1")
	routes.UserRoutes(api.Group("/user"))

	// ใช้ PORT จาก .env
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // กำหนดพอร์ตเริ่มต้นถ้าไม่มีค่าใน .env
	}

	r.Run(":" + port) // รันเซิร์ฟเวอร์ที่พอร์ตที่กำหนด
}
