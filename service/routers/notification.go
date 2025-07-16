package routes

import (
	notificationController "github.com/Samind2/MimiCaare-Project/service/controllers/notification"
	"github.com/gin-gonic/gin"
)

func NotificationRoutes(router *gin.RouterGroup) {
	router.GET("/test", func(c *gin.Context) {
		go notificationController.RunNotificationJob()
		c.JSON(200, gin.H{"message": "เรียกฟังก์ชันแจ้งเตือนเรียบร้อยแล้ว"})

	})
}
