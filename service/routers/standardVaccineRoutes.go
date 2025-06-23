package routes

import (
	standardVaccineController "github.com/Samind2/MimiCaare-Project/service/controllers/standardVaccine"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func StandardVaccineRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), middleware.VerifyAdmin(), standardVaccineController.AddStandardVaccine)
	router.GET("/all", middleware.VerifyToken(), standardVaccineController.GetAllStandardVaccines)
	router.GET("/get/:id", middleware.VerifyToken(), standardVaccineController.GetStandardVaccineByID)
	router.PUT("/update/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), standardVaccineController.UpdateStandardVaccine)
	router.DELETE("/delete/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), standardVaccineController.DeleteStandardVaccine)
}
