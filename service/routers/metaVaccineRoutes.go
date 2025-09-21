package routes

import (
	vaccineController "github.com/Samind2/MimiCaare-Project/service/controllers/metaDatacontroller"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func VaccineRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), middleware.VerifyAdmin(), vaccineController.AddNewVaccine)
	router.GET("/get-all", middleware.VerifyToken(), middleware.VerifyAdmin(), vaccineController.GetAllVaccines)
	router.GET("/get/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), vaccineController.GetVaccineByID)
	router.PUT("/update/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), vaccineController.UpdateVaccineByID)
	router.DELETE("/delete/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), vaccineController.DeleteVaccineByID)
}
