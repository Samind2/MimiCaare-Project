package routes

import (
	receiveVaccineController "github.com/Samind2/MimiCaare-Project/service/controllers/receiveVaccine"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func ReceiveVaccineRoutes(router *gin.RouterGroup) {
	router.POST("/from-standard", middleware.VerifyToken(), receiveVaccineController.AddReceiveVaccineFromStandard)
	router.POST("/custom", middleware.VerifyToken(), receiveVaccineController.AddReceiveVaccineCustom)
	router.PUT("/:id", middleware.VerifyToken(), receiveVaccineController.UpdateReceiveVaccineByID)
	router.DELETE("/:id", middleware.VerifyToken(), receiveVaccineController.DeleteReceiveVaccineByID)
	router.GET("/all", middleware.VerifyToken(), receiveVaccineController.GetAllReceiveVaccines)
	router.GET("/get/:id", middleware.VerifyToken(), receiveVaccineController.GetReceiveVaccineByID)
	router.GET("/children/:id", middleware.VerifyToken(), receiveVaccineController.GetReceiveVaccineByChildrenID)
}
