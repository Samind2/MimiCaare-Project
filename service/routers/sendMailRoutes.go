package routes

import (
	sendMail "github.com/Samind2/MimiCaare-Project/service/controllers/resendMail"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"

	"github.com/gin-gonic/gin"
)

func SendMail(router *gin.RouterGroup) {
	router.POST("/test-send", middleware.VerifyToken(), sendMail.SendWelcomeEmail)
	router.PUT("/send-password", sendMail.SendPasswordToMail)
}
