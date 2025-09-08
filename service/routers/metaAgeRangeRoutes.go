package routes

import (
	ageRangeController "github.com/Samind2/MimiCaare-Project/service/controllers/metaDatacontroller"
	"github.com/gin-gonic/gin"
)

func AgeRangeRoutes(router *gin.RouterGroup) {
	router.POST("/add", ageRangeController.AddNewAgeRange)
	router.GET("/get-all", ageRangeController.GetAllAgeRanges)
	router.GET("/get/:id", ageRangeController.GetAgeRangeByID)
	router.PUT("/update/:id", ageRangeController.UpdateAgeRangeByID)
	router.DELETE("/delete/:id", ageRangeController.DeleteAgeRangeByID)
}
