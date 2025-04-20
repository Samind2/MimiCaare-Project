package routes

import (
	childrenController "github.com/Samind2/MimiCaare-Project/service/controllers/children"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func ChildrenRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), childrenController.AddNewChildren)
	router.GET("/get", middleware.VerifyToken(), childrenController.GetChildrenByParentID)
	router.GET("/get/:id", middleware.VerifyToken(), childrenController.GetChildrenByID)
	router.PUT("/update/:id", middleware.VerifyToken(), childrenController.UpdateChildrenByID)
}
