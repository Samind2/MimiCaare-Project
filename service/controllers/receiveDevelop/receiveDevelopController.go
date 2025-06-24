package receiveDevelopControllers

import (
	"context"
	"net/http"
	"os"
	"time"

	receiveDevelopModel "github.com/Samind2/MimiCaare-Project/service/models/receiveDev"
	standardDevelopModel "github.com/Samind2/MimiCaare-Project/service/models/standardDev"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var receiveDevelopCollection *mongo.Collection
var StandardDevelopCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetReceiveDevelopCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	receiveDevelopCollection = client.Database(dbName).Collection("receiveDevelop")
}
func SetStandardDevelopReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	StandardDevelopCollection = client.Database(dbName).Collection("standardDevelops")
}

func AddReceiveDevelop(c *gin.Context) {
	var inputData struct {
		ChildID           primitive.ObjectID `json:"childId"`
		Status            bool               `json:"status"`
		StandardDevelopID primitive.ObjectID `json:"standardDevelopId"`
		AgeRange          int                `json:"ageRange"`
	}

	if err := c.ShouldBindJSON(&inputData); err != nil {
		c.JSON(400, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var standardDevelop standardDevelopModel.StandardDevelop
	err := StandardDevelopCollection.FindOne(context.TODO(), bson.M{"_id": inputData.StandardDevelopID}).Decode(&standardDevelop)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลพัฒนาการมาตรฐานที่ระบุ", "error": err.Error()})
		return
	}
	// แปลงข้อมูลจากพัฒนาการมาตรฐาน
	var developmentRecords []receiveDevelopModel.DevelopmentResults
	for _, development := range standardDevelop.Developments {
		developmentRecords = append(developmentRecords, receiveDevelopModel.DevelopmentResults{
			Status:   inputData.Status,
			Category: development.Category,
			Detail:   development.Detail,
			Image:    development.Image,
			Note:     development.Note,
		})
	}

	var rcDevelop receiveDevelopModel.ReceiveDevelop
	rcDevelop.ID = primitive.NewObjectID()
	rcDevelop.ChildID = inputData.ChildID
	rcDevelop.AgeRange = inputData.AgeRange
	rcDevelop.ReceiveDate = primitive.NewDateTimeFromTime(time.Now())
	rcDevelop.StandardDevID = inputData.StandardDevelopID
	rcDevelop.Developments = developmentRecords

	// บันทึกข้อมูลลง MongoDB
	_, err = receiveDevelopCollection.InsertOne(context.TODO(), rcDevelop)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "บันทึกข้อมูลการประเมินสำเร็จ",
		"receive": rcDevelop,
	})
}

func UpdateReceiveDevelopByID(c *gin.Context) {
	id := c.Param("id")
	developId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var updateData receiveDevelopModel.ReceiveDevelop
	if err := c.ShouldBindJSON((&updateData)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ดึงข้อมูลเดิมจากฐานข้อมูล
	var existingDevRecord receiveDevelopModel.ReceiveDevelop
	err = StandardDevelopCollection.FindOne(context.TODO(), bson.M{"_id": developId}).Decode(&existingDevRecord)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเดิม", "error": err.Error()})
		return
	}
	// --- รวมข้อมูล ---
	var updatedDevelopmentsData []receiveDevelopModel.DevelopmentResults
	if len(updateData.Developments) > 0 {
		for i, updatedItem := range updateData.Developments {
			var mergedItem receiveDevelopModel.DevelopmentResults

			// ถ้ามีข้อมูลเดิมสำหรับตำแหน่งนี้ ให้ใช้
			var existingItem receiveDevelopModel.DevelopmentResults
			if i < len(existingDevRecord.Developments) {
				existingItem = existingDevRecord.Developments[i]
			}
			// รวมแต่ละฟิลด์
			if updatedItem.Status != existingItem.Status {
				mergedItem.Status = updatedItem.Status
			}

			updatedDevelopmentsData = append(updatedDevelopmentsData, mergedItem)
		}
	} else {
		// ถ้าไม่มีข้อมูลใหม่ ให้ใช้ข้อมูลเดิม
		updatedDevelopmentsData = existingDevRecord.Developments
	}
	// อัปเดตจริง
	updateFields := bson.M{
		"developments": updatedDevelopmentsData,
	}

	result, err := receiveDevelopCollection.UpdateOne(context.TODO(),
		bson.M{"_id": developId},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตข้อมูลล้มเหลว", "error": err.Error()})
		return
	}
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลที่ต้องการอัปเดต"})
		return
	}
	// ดึงข้อมูลหลังอัปเดต
	var updatedDoc receiveDevelopModel.ReceiveDevelop
	err = receiveDevelopCollection.FindOne(context.TODO(), bson.M{"_id": developId}).Decode(&updatedDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลหลังอัปเดตได้", "error": err.Error()})
		return
	}
	// ส่งข้อมูลกลับไปยังผู้ใช้
	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสำเร็จ",
		"data":    updatedDoc,
	})
}

func GetReceiveDevelopByChildID(c *gin.Context) {
	id := c.Param("id")
	childID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "childId ไม่ถูกต้อง"})
		return
	}

	// ค้นหาเอกสารทั้งหมดของเด็กคนนี้
	cursor, err := receiveDevelopCollection.Find(context.TODO(), bson.M{"childId": childID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ดึงข้อมูลไม่สำเร็จ", "error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	var results []receiveDevelopModel.ReceiveDevelop
	for cursor.Next(context.TODO()) {
		var record receiveDevelopModel.ReceiveDevelop
		if err := cursor.Decode(&record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถอ่านข้อมูลได้", "error": err.Error()})
			return
		}
		results = append(results, record)
	}

	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลของเด็กคนนี้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"childId":     childID,
		"had receive": results,
	})
}
