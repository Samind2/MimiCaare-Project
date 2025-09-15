package metadataController

import (
	"context"
	"net/http"
	"os"

	ageRangeModel "github.com/Samind2/MimiCaare-Project/service/models/metaDataModel"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var ageRangeCollection *mongo.Collection

func SetAgeRangeCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	ageRangeCollection = client.Database(dbName).Collection("metaAgeRange")
}

func AddNewAgeRange(c *gin.Context) {
	var newAgeRange ageRangeModel.MetaAgeRange
	if err := c.ShouldBindJSON(&newAgeRange); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบว่าช่วงอายุนี้มีอยู่แล้วหรือไม่
	var existingAgeRange ageRangeModel.MetaAgeRange
	err := ageRangeCollection.FindOne(context.TODO(), bson.M{"ageRange": newAgeRange.AgeRange}).Decode(&existingAgeRange)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "ช่วงอายุนี้มีอยู่แล้ว"})
		return
	}
	// เพิ่มช่วงอายุใหม่
	newAgeRange.ID = primitive.NewObjectID()
	_, err = ageRangeCollection.InsertOne(context.TODO(), newAgeRange)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเพิ่มช่วงอายุได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "เพิ่มช่วงอายุสำเร็จ",
		"data":    newAgeRange,
	})
}

func GetAllAgeRanges(c *gin.Context) {
	var ageRanges []ageRangeModel.MetaAgeRange
	cursor, err := ageRangeCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลช่วงอายุได้", "error": err.Error()})
		return
	}
	if err = cursor.All(context.TODO(), &ageRanges); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลช่วงอายุได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลช่วงอายุสำเร็จ",
		"data":    ageRanges,
	})
}

func GetAgeRangeByID(c *gin.Context) {
	idParam := c.Param("id")
	ageRangeId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var ageRange ageRangeModel.MetaAgeRange
	err = ageRangeCollection.FindOne(context.TODO(), bson.M{"_id": ageRangeId}).Decode(&ageRange)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบช่วงอายุที่ระบุ", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลช่วงอายุสำเร็จ",
		"data":    ageRange,
	})
}

func UpdateAgeRangeByID(c *gin.Context) {
	idParam := c.Param("id")
	ageRangeId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var existingAgeRange ageRangeModel.MetaAgeRange
	err = ageRangeCollection.FindOne(context.TODO(), bson.M{"_id": ageRangeId}).Decode(&existingAgeRange)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบช่วงอายุที่ต้องการอัปเดต"})
		return
	}
	var updatedData ageRangeModel.MetaAgeRange
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	if existingAgeRange.AgeRange == updatedData.AgeRange {
		c.JSON(http.StatusConflict, gin.H{"message": "ช่วงอายุไม่เปลี่ยนแปลง"})
		return
	}
	filter := bson.M{
		"ageRange": updatedData.AgeRange,
		"_id":      bson.M{"$ne": ageRangeId},
	}
	var existing ageRangeModel.MetaAgeRange
	err = ageRangeCollection.FindOne(context.TODO(), filter).Decode(&existing)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "ช่วงอายุนี้มีอยู่แล้ว"})
		return
	}
	update := bson.M{
		"ageRange": updatedData.AgeRange,
	}
	_, err = ageRangeCollection.UpdateOne(context.TODO(), bson.M{"_id": ageRangeId}, bson.M{"$set": update})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}

	// ดึงข้อมูลล่าสุดกลับมา
	var updated ageRangeModel.MetaAgeRange
	err = ageRangeCollection.FindOne(context.TODO(), bson.M{"_id": ageRangeId}).Decode(&updated)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตสำเร็จแต่ดึงข้อมูลไม่สำเร็จ"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสำเร็จ",
		"data":    updated,
	})
}

func DeleteAgeRangeByID(c *gin.Context) {
	idParam := c.Param("id")
	ageRangeId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var existingAgeRange ageRangeModel.MetaAgeRange
	err = ageRangeCollection.FindOne(context.TODO(), bson.M{"_id": ageRangeId}).Decode(&existingAgeRange)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบช่วงอายุที่ต้องการลบ"})
		return
	}
	// ลบข้อมูล
	_, err = ageRangeCollection.DeleteOne(context.TODO(), bson.M{"_id": ageRangeId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบข้อมูลไม่สำเร็จ", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ลบข้อมูลช่วงอายุสำเร็จ",
		"ช่วงอายุที่ลบ": existingAgeRange.AgeRange,
	})
}
