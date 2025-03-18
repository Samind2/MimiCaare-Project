package routes

import (
	"github.com/Plashon/service/controllers"
	"github.com/gin-gonic/gin"
)

// UserRoutes รับ Router Group แล้วเพิ่ม API ใน /api/v1/user
func UserRoutes(router *gin.RouterGroup) {
	router.GET("/", controllers.GetUsers)
	router.POST("/", controllers.CreateUser)
}
