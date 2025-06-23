package corsMiddleware

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// CORS Middleware
func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := os.Getenv("FRONT_URL")
		if origin == "" {
			origin = "http://localhost:5173" // ค่า Default ถ้า ENV ไม่มีค่า
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token, Accept")

		fmt.Println("Request Origin:", c.Request.Header.Get("Origin"))
		fmt.Println("Allowed Origin:", os.Getenv("FRONT_URL"))

		// Handle Preflight Request
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
