package routes

import (
	standardDevelopController "github.com/Samind2/MimiCaare-Project/service/controllers/standardDevelop"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func StandardDevelopRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), middleware.VerifyAdmin(), standardDevelopController.AddStandardDevelop)
	router.GET("/all", standardDevelopController.GetAllStandardDevelops)
	router.GET("/get/:id", standardDevelopController.GetStandardDevelopByID)
	router.PUT("/update/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), standardDevelopController.UpdateStandardDevelopByID)
	router.DELETE("/delete/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), standardDevelopController.DeleteStandardDevelopByID)
}
