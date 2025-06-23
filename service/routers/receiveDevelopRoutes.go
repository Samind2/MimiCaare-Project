package routes

import (
	receiveDevelopControllers "github.com/Samind2/MimiCaare-Project/service/controllers/receiveDevelop"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func ReceiveDevelopRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), receiveDevelopControllers.AddReceiveDevelop)
	router.PUT("/update/:id", middleware.VerifyToken(), receiveDevelopControllers.UpdateReceiveDevelopByID)
	router.GET("/getById/:id", middleware.VerifyToken(), receiveDevelopControllers.GetReceiveDevelopByChildID)
}
