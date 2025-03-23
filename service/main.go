package main

import (
	"log"
	"net/http"
	"os"

	database "github.com/Samind2/MimiCaare-Project/service/config/database"
	controllers "github.com/Samind2/MimiCaare-Project/service/controllers"
	routes "github.com/Samind2/MimiCaare-Project/service/routers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// โหลดค่าจาก .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ ไม่สามารถโหลดไฟล์ .env")
	}

	// เชื่อมต่อกับฐานข้อมูล
	database.ConnectDB()

	// ใช้ client ที่เชื่อมต่อกับ MongoDB เพื่อให้ client สามารถเข้าถึงฐานข้อมูลได้
	controllers.CollectionControllers(database.Client)

	r := gin.Default()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONT_URL")}, // เปลี่ยนเป็นโดเมนที่คุณอนุญาต ถ้าไม่ต้องการอนุญาตทุกโดเมน
		AllowCredentials: true,
	})

	// ใช้ CORS Middleware
	handler := c.Handler(r)

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
	log.Fatal(http.ListenAndServe("localhost:"+port, handler))

}
