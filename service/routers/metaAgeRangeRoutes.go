package routes

import (
	ageRangeController "github.com/Samind2/MimiCaare-Project/service/controllers/metaDatacontroller"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"

	"github.com/gin-gonic/gin"
)

func AgeRangeRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), middleware.VerifyAdmin(), ageRangeController.AddNewAgeRange)
	router.GET("/get-all", middleware.VerifyToken(), middleware.VerifyAdmin(), ageRangeController.GetAllAgeRanges)
	router.GET("/get/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), ageRangeController.GetAgeRangeByID)
	router.PUT("/update/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), ageRangeController.UpdateAgeRangeByID)
	router.DELETE("/delete/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), ageRangeController.DeleteAgeRangeByID)
}
