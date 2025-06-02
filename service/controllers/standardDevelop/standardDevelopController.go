package standardDevelopController

import (
	"context"
	"net/http"
	"os"

	standardDevelopModels "github.com/Samind2/MimiCaare-Project/service/models/standardDev"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var standardDevelopCollection *mongo.Collection

// SetStandardDevelopCollection กำหนด collection
func SetStandardDevelopCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	standardDevelopCollection = client.Database(dbName).Collection("standardDevelops")
}

// AddStandardDevelop เพิ่มข้อมูลพัฒนาการมาตรฐานใหม่
func AddStandardDevelop(c *gin.Context) {
	var developData standardDevelopModels.StandardDevelop

	//เช็คข้อมูลก่อนว่ามาป่าว
	if err := c.ShouldBindJSON(&developData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ตรวจสอบว่ามีพัฒนาการหรือไม่
	if len(developData.Developments) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณาเพิ่มรายการพัฒนาการอย่างน้อย 1 รายการ"})
		return
	}

	// สร้าง ObjectID ใหม่
	developData.ID = primitive.NewObjectID()

	// บันทึกลงฐานข้อมูล
	_, err := standardDevelopCollection.InsertOne(context.Background(), developData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "เพิ่มข้อมูลพัฒนาการมาตรฐานสำเร็จ",
		"standardDev": developData,
	})
}

func GetAllStandardDevelops(c *gin.Context) {
	focus, err := standardDevelopCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลทั้งหมดได้", "error": err.Error()})
		return
	}
	defer focus.Close(context.Background())
	// สร้าง slice/array เพื่อเก็บผลลัพธ์
	var results []standardDevelopModels.StandardDevelop
	for focus.Next(context.Background()) {
		var standardDev standardDevelopModels.StandardDevelop
		if err := focus.Decode(&standardDev); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลได้", "error": err.Error()})
			return
		}
		results = append(results, standardDev)
	}

	c.JSON(http.StatusOK, gin.H{"data": results})
}
func GetStandardDevelopByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รหัสไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var result standardDevelopModels.StandardDevelop
	err = standardDevelopCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&result)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูล", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func UpdateStandardDevelopByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รหัสไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// รับข้อมูล JSON ใหม่ที่ต้องการอัปเดต
	var updatedData standardDevelopModels.StandardDevelop
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// เตรียมฟิลด์ที่จะแก้ไข
	// เตรียมฟิลด์ที่จะแก้ไข
	updateFields := bson.M{}
	if updatedData.AgeRange != "" {
		updateFields["ageRange"] = updatedData.AgeRange
	}
	if len(updatedData.Developments) > 0 {
		updateFields["developments"] = updatedData.Developments
	}

	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลให้อัปเดต"})
		return
	}

	// อัปเดตในฐานข้อมูล
	result, err := standardDevelopCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}
	if result.ModifiedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบหรือไม่มีการเปลี่ยนแปลงข้อมูล"})
		return
	}
	var updatedDoc standardDevelopModels.StandardDevelop
	err = standardDevelopCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&updatedDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ดึงข้อมูลหลังอัปเดตไม่สำเร็จ", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสำเร็จ",
		"data":    updatedDoc,
	})
}
func DeleteStandardDevelopByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รหัสไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ลบข้อมูลจากฐานข้อมูล
	result, err := standardDevelopCollection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบข้อมูลล้มเหลว", "error": err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลที่จะลบ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบข้อมูลสำเร็จ"})
}
