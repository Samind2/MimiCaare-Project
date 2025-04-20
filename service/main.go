package main

import (
	"log"
	"net/http"
	"os"

	database "github.com/Samind2/MimiCaare-Project/service/config/database"
	childrenController "github.com/Samind2/MimiCaare-Project/service/controllers/children"
	userController "github.com/Samind2/MimiCaare-Project/service/controllers/user"
	corsMiddleware "github.com/Samind2/MimiCaare-Project/service/middlewares/cors"
	routes "github.com/Samind2/MimiCaare-Project/service/routers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// โหลดค่าจาก .env
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Fatal("❌ ไม่สามารถโหลดไฟล์ .env")
	// }
	if os.Getenv("RENDER") == "" { // Render มีตัวแปร `RENDER` อัตโนมัติ
		err := godotenv.Load()
		if err != nil {
			log.Println("⚠️ ไม่สามารถโหลดไฟล์ .env แต่ใช้ Environment Variables แทน")
		}
	}

	// เชื่อมต่อกับฐานข้อมูล
	client, err := database.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}
	userController.SetUserCollection(client)
	childrenController.SetChildrenCollection(client)

	r := gin.Default()

	// ใช้ CORS Middleware
	r.Use(corsMiddleware.CorsMiddleware())
	// Welcome Page
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte("<h1>welcome to Project restful api</h1>"))
	})

	// API Routes
	api := r.Group("/api/v1")
	routes.UserRoutes(api.Group("/user"))
	routes.ChildrenRoutes(api.Group("/children"))

	// ใช้ PORT จาก .env
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // กำหนดพอร์ตเริ่มต้นถ้าไม่มีค่าใน .env
	}
	log.Fatal(r.Run(":" + port))
}
