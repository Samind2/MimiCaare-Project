package routes

import (
	sendMail "github.com/Samind2/MimiCaare-Project/service/controllers/resendMail"
	"github.com/gin-gonic/gin"
)

func SendMail(router *gin.RouterGroup) {
	router.POST("/send", sendMail.SendWelcomeEmail)
}
