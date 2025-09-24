package metadataController

import (
	"context"
	"net/http"
	"os"

	vaccineModel "github.com/Samind2/MimiCaare-Project/service/models/metaDataModel"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var vaccineCollection *mongo.Collection

func SetVaccineCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	vaccineCollection = client.Database(dbName).Collection("metaVaccine")
}
func AddNewVaccine(c *gin.Context) {
	var newVaccine vaccineModel.MetaVaccine
	if err := c.ShouldBindJSON(&newVaccine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบว่าวัคซีนนี้มีอยู่แล้วหรือไม่
	var existingVaccine vaccineModel.MetaVaccine
	err := vaccineCollection.FindOne(context.TODO(), bson.M{"vaccineName": newVaccine.VaccineName}).Decode(&existingVaccine)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "วัคซีนนี้มีอยู่แล้ว"})
		return
	}
	// เพิ่มวัคซีนใหม่
	newVaccine.ID = primitive.NewObjectID()
	_, err = vaccineCollection.InsertOne(context.TODO(), newVaccine)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเพิ่มวัคซีนได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "เพิ่มวัคซีนสำเร็จ",
		"data":    newVaccine,
	})
}

func GetAllVaccines(c *gin.Context) {
	var vaccines []vaccineModel.MetaVaccine
	cursor, err := vaccineCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลวัคซีนได้", "error": err.Error()})
		return
	}
	if err = cursor.All(context.TODO(), &vaccines); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลวัคซีนได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลวัคซีนสำเร็จ",
		"data":    vaccines,
	})
}
func GetVaccineByID(c *gin.Context) {
	id := c.Param("id")
	vaccineID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var vaccine vaccineModel.MetaVaccine
	err = vaccineCollection.FindOne(context.TODO(), bson.M{"_id": vaccineID}).Decode(&vaccine)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบวัคซีนนี้"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการดึงข้อมูล", "error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลวัคซีนสำเร็จ",
		"data":    vaccine,
	})
}

func UpdateVaccineByID(c *gin.Context) {
	id := c.Param("id")
	vaccineID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var updatedVaccine vaccineModel.MetaVaccine
	if err := c.ShouldBindJSON(&updatedVaccine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var existingVaccine vaccineModel.MetaVaccine
	err = vaccineCollection.FindOne(context.TODO(), bson.M{"_id": vaccineID}).Decode(&existingVaccine)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบวัคซีนที่ต้องการอัปเดต"})
		return
	}
	// ตรวจสอบว่าชื่อวัคซีนนี้มีอยู่แล้วหรือไม่ (ยกเว้นตัวเอง)
	filter := bson.M{
		"vaccineName": updatedVaccine.VaccineName,
		"_id":         bson.M{"$ne": vaccineID},
	}
	var existing vaccineModel.MetaAgeRange
	err = vaccineCollection.FindOne(context.TODO(), filter).Decode(&existing)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "วัคซีนนี้มีอยู่แล้วในระบบ"})
		return
	}
	// กรณีที่ฟิลด์ใดไม่ได้กรอกมา ให้ใช้ค่าจากข้อมูลเดิม
	if updatedVaccine.VaccineName == "" {
		updatedVaccine.VaccineName = existingVaccine.VaccineName
	}
	if updatedVaccine.Note == "" {
		updatedVaccine.Note = existingVaccine.Note
	}
	if existingVaccine.VaccineName == updatedVaccine.VaccineName && existingVaccine.Note == updatedVaccine.Note {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีการเปลี่ยนแปลงข้อมูล"})
		return
	}
	// อัปเดตข้อมูลวัคซีน
	update := bson.M{
		"$set": bson.M{
			"vaccineName": updatedVaccine.VaccineName,
			"note":        updatedVaccine.Note,
		},
	}
	_, err = vaccineCollection.UpdateOne(context.TODO(), bson.M{"_id": vaccineID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}
	//ดึงข้อมูลใหม่หลังอัปเดต
	var updated vaccineModel.MetaVaccine
	err = vaccineCollection.FindOne(context.TODO(), bson.M{"_id": vaccineID}).Decode(&updated)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการดึงข้อมูลหลังอัปเดต", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตวัคซีนสำเร็จ",
		"data":    updated,
	})
}

func DeleteVaccineByID(c *gin.Context) {
	id := c.Param("id")
	vaccineID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var existingVaccine vaccineModel.MetaVaccine
	err = vaccineCollection.FindOne(context.TODO(), bson.M{"_id": vaccineID}).Decode(&existingVaccine)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบวัคซีนที่ต้องการลบ"})
		return
	}
	_, err = vaccineCollection.DeleteOne(context.TODO(), bson.M{"_id": vaccineID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบล้มเหลว", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ลบวัคซีนสำเร็จ",
	})
}
