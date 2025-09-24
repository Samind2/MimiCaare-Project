package routes

import (
	developController "github.com/Samind2/MimiCaare-Project/service/controllers/metaDatacontroller"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func DevelopRoutes(router *gin.RouterGroup) {
	router.POST("/add", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.AddNewDevelop)
	router.GET("/get-all", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.GetAllDevelops)
	router.GET("/get/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.GetDevelopByID)
	router.GET("/get-by-category", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.GetDevelopByCategory)
	router.GET("/get-by-category-detail", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.GetDevelopByCategoryAndDetail) //ฟังชันนี้อาจจะต้องทำเลือกข้อมูลก่อนอันแล้วกดเป็นปุ่มดึงข้อมูล
	router.PUT("/update/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.UpdateDevelopByID)
	router.DELETE("/delete/:id", middleware.VerifyToken(), middleware.VerifyAdmin(), developController.DeleteDevelopByID)
}
