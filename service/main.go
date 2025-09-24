// @title MimiCare API
// @version 1.0
// @description Backend API for MimiCare Project (Gin + MongoDB)
// @host localhost:5000
// @BasePath /api/v1
// @schemes http

package main

import (
	"log"
	"net/http"
	"os"

	database "github.com/Samind2/MimiCaare-Project/service/config/database"
	controllers "github.com/Samind2/MimiCaare-Project/service/controllers"
	_ "github.com/Samind2/MimiCaare-Project/service/docs"
	corsMiddleware "github.com/Samind2/MimiCaare-Project/service/middlewares/cors"
	routes "github.com/Samind2/MimiCaare-Project/service/routers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	controllers.CollectionControllers(client)

	r := gin.Default()

	// ใช้ CORS Middleware
	r.Use(corsMiddleware.CorsMiddleware())
	// Welcome Page
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte("<h1>welcome to Project restful api</h1>"))
	})
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API Routes
	api := r.Group("/api/v1")
	routes.UserRoutes(api.Group("/user"))
	routes.ChildrenRoutes(api.Group("/children"))
	routes.StandardVaccineRoutes(api.Group("/standardVaccine"))
	routes.StandardDevelopRoutes(api.Group("/standardDevelop"))
	routes.ReceiveVaccineRoutes(api.Group("/receiveVaccine"))
	routes.ReceiveDevelopRoutes(api.Group("/receiveDevelop"))
	routes.NotificationRoutes(api.Group("/notify"))
	routes.SendMail(api.Group("/send-mail"))
	routes.AgeRangeRoutes(api.Group("/metaAgeRange"))
	routes.DevelopRoutes(api.Group("/metaDevelop"))
	routes.VaccineRoutes(api.Group("/metaVaccine"))

	// ใช้ PORT จาก .env
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // กำหนดพอร์ตเริ่มต้นถ้าไม่มีค่าใน .env
	}
	log.Fatal(r.Run(":" + port))
}
