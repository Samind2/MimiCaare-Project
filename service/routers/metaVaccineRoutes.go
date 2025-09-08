package routes

import (
	vaccineController "github.com/Samind2/MimiCaare-Project/service/controllers/metaDatacontroller"
	"github.com/gin-gonic/gin"
)

func VaccineRoutes(router *gin.RouterGroup) {
	router.POST("/add", vaccineController.AddNewVaccine)
	router.GET("/get-all", vaccineController.GetAllVaccines)
	router.GET("/get/:id", vaccineController.GetVaccineByID)
	router.PUT("/update/:id", vaccineController.UpdateVaccineByID)
	router.DELETE("/delete/:id", vaccineController.DeleteVaccineByID)
}
