package metadataController

import (
	"context"
	"net/http"
	"os"

	developModel "github.com/Samind2/MimiCaare-Project/service/models/metaDataModel"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var developCollection *mongo.Collection

func SetDevelopCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	developCollection = client.Database(dbName).Collection("metaAgeRange")
}

func AddNewDevelop(c *gin.Context) {
	var newDevelop developModel.MetaDevelop
	if err := c.ShouldBindJSON(&newDevelop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบว่าพัฒนาการนี้มีอยู่แล้วหรือไม่
	var existingDevelop developModel.MetaDevelop
	err := developCollection.FindOne(context.TODO(), bson.M{"develop": newDevelop}).Decode(&existingDevelop)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "พัฒนาการนี้มีอยู่แล้ว"})
		return
	}
}
