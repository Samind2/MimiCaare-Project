package routes

import (
	notificationController "github.com/Samind2/MimiCaare-Project/service/controllers/notification"
	middleware "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"github.com/gin-gonic/gin"
)

func NotificationRoutes(router *gin.RouterGroup) {
	router.GET("/test", func(c *gin.Context) {
		go notificationController.RunNotificationJob7Day()
		go notificationController.RunNotificationJob3Day()
		c.JSON(200, gin.H{"message": "เรียกฟังก์ชันแจ้งเตือนเรียบร้อยแล้ว"})
	})
	router.GET("/get", middleware.VerifyToken(), notificationController.GetNotifyByUserID)
	router.PUT("/read/:id", middleware.VerifyToken(), notificationController.MarkNotificationAsRead)
}
