package standardVaccineControllers

import (
	"context"
	"net/http"
	"os"

	standardVaccineModel "github.com/Samind2/MimiCaare-Project/service/models/standardVac"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var StandardVaccineCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetStandardVaccineCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	StandardVaccineCollection = client.Database(dbName).Collection("standardVaccine")
}

func AddStandardVaccine(c *gin.Context) {
	var standardVaccine standardVaccineModel.StandardVaccine

	// รับข้อมูลจาก Request Body เช็คข้อมูลก่อนว่ามาป่าว
	if err := c.ShouldBindJSON(&standardVaccine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่พบข้อมูลหรือข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ตรวจสอบข้อมูลที่จำเป็น
	if len(standardVaccine.Vaccines) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}

	// สร้าง ObjectID ใหม่
	standardVaccine.ID = primitive.NewObjectID()

	// บันทึกลง MongoDB
	_, err := StandardVaccineCollection.InsertOne(context.TODO(), standardVaccine)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เพิ่มข้อมูลวัคซีนไม่สำเร็จ"})
		return
	}

	// ตอบกลับเมื่อเพิ่มข้อมูลสำเร็จ
	c.JSON(http.StatusCreated, gin.H{
		"message":         "เพิ่มข้อมูลวัคซีนสำเร็จ",
		"standardVaccine": standardVaccine,
	})
}

func GetAllStandardVaccines(c *gin.Context) {
	focus, err := StandardVaccineCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลวัคซีนได้"})
		return
	}
	defer focus.Close(context.TODO())

	var vaccines []standardVaccineModel.StandardVaccine
	for focus.Next(context.TODO()) {
		var vaccine standardVaccineModel.StandardVaccine
		if err := focus.Decode(&vaccine); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "มีข้อผิดพลาดระหว่างแปลงข้อมูล"})
			return
		}
		vaccines = append(vaccines, vaccine)
	}

	c.JSON(http.StatusOK, gin.H{"vaccines": vaccines})
}

func GetStandardVaccineByID(c *gin.Context) {
	idParam := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีไม่ถูกต้อง"})
		return
	}

	var vaccine standardVaccineModel.StandardVaccine
	err = StandardVaccineCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&vaccine)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลวัคซีน"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"vaccine": vaccine})
}

func UpdateStandardVaccine(c *gin.Context) {
	idParam := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีไม่ถูกต้อง"})
		return
	}

	var updatedData standardVaccineModel.StandardVaccine
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	updateFields := bson.M{}
	if updatedData.AgeRange != 0 {
		updateFields["ageRange"] = updatedData.AgeRange
	}
	if len(updatedData.Vaccines) != 0 {
		updateFields["vaccines"] = updatedData.Vaccines
	}

	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลที่ต้องการอัปเดต"})
		return
	}

	_, err = StandardVaccineCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objectID},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตข้อมูลวัคซีนล้มเหลว"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตข้อมูลวัคซีนสำเร็จ", "data": updatedData})
}

func DeleteStandardVaccine(c *gin.Context) {
	idParam := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีไม่ถูกต้อง"})
		return
	}

	_, err = StandardVaccineCollection.DeleteOne(
		context.TODO(),
		bson.M{"_id": objectID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบข้อมูลวัคซีนไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลบข้อมูลวัคซีนสำเร็จ"})
}
