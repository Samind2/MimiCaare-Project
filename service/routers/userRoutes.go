package routes

import (
	userController "github.com/Samind2/MimiCaare-Project/service/controllers/user"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

// UserRoutes รับ Router Group แล้วเพิ่ม API ใน /api/v1/user
func UserRoutes(router *gin.RouterGroup) {
	router.POST("/signup", userController.Signup)
	router.POST("/login", userController.Login)
	router.POST("/logout", middleware.VerifyToken(), userController.Logout)
	router.PUT("/update", middleware.VerifyToken(), userController.UpdateProfile)

}
