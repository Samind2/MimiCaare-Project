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

// @name AddReceiveDevelopRequest
type AddReceiveDevelopRequest struct {
	ChildID           primitive.ObjectID `json:"childId" binding:"required" example:"64a7f0c2e1b8c8b4f0d6e8a1"`
	StatusList        []bool             `json:"status" binding:"required" example:"[true, false, true]"`
	StandardDevelopID primitive.ObjectID `json:"standardDevelopId" binding:"required" example:"64a7f0c2e1b8c8b4f0d6e8a2"`
	AgeRange          int                `json:"ageRange" binding:"required" example:"24"`
}

// @Summary เพิ่มข้อมูลการประเมินพัฒนาการของเด็ก
// @Description ใช้สำหรับเพิ่มข้อมูลการประเมินพัฒนาการของเด็ก (ผู้ใช้ต้องเป็นเจ้าของข้อมูลเด็กคนนี้)
// @Tags ReceiveDevelop
// @Accept json
// @Produce json
// @Param request body AddReceiveDevelopRequest true "ข้อมูลการประเมินพัฒนาการของเด็ก"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /receiveDevelop/add [post]
func AddReceiveDevelop(c *gin.Context) {
	var inputData struct {
		ChildID           primitive.ObjectID `json:"childId"`
		StatusList        []bool             `json:"status"`
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
	if len(inputData.StatusList) > len(standardDevelop.Developments) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "จำนวน status มากเกินไป"})
		return
	}
	if len(inputData.StatusList) < len(standardDevelop.Developments) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "จำนวน status น้อยเกินไป"})
		return
	}

	// สร้าง DevelopmentResults โดยให้ status เริ่มต้นตาม input
	var developmentRecords []receiveDevelopModel.DevelopmentResults
	for i, development := range standardDevelop.Developments {
		status := false
		if i < len(inputData.StatusList) {
			status = inputData.StatusList[i]
		}
		developmentRecords = append(developmentRecords, receiveDevelopModel.DevelopmentResults{
			Status:   status,
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

type UpdateReceiveDevelopRequest struct {
	Status []bool `json:"status" binding:"required" example:"[true, false, true]"`
}

// @Summary อัปเดตข้อมูลการประเมินพัฒนาการของเด็กตาม ID
// @Description ใช้สำหรับอัปเดตข้อมูลการประเมินพัฒนาการของเด็กตาม ID (ผู้ใช้ต้องเป็นเจ้าของข้อมูลเด็กคนนี้)
// @Tags ReceiveDevelop
// @Accept json
// @Produce json
// @Param id path string true "ObjectID ของข้อมูลการประเมินพัฒนาการ"
// @Param request body UpdateReceiveDevelopRequest true "ข้อมูลใหม่"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /receiveDevelop/update/{id} [put]
func UpdateReceiveDevelopByID(c *gin.Context) {
	id := c.Param("id")
	developId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var updateData struct {
		Status       []bool                                   `json:"status"`       // แยก status array
		Developments []receiveDevelopModel.DevelopmentResults `json:"developments"` // ข้อมูล developments อื่น
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ดึงข้อมูลเดิมจากฐานข้อมูล
	var existingDevRecord receiveDevelopModel.ReceiveDevelop
	err = receiveDevelopCollection.FindOne(context.TODO(), bson.M{"_id": developId}).Decode(&existingDevRecord)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเดิม", "error": err.Error()})
		return
	}
	// --- รวมข้อมูล ---
	var updatedDevelopmentsData []receiveDevelopModel.DevelopmentResults

	for i := range existingDevRecord.Developments {
		existing := existingDevRecord.Developments[i]

		// รวมข้อมูล status แยกจาก StatusList
		status := existing.Status
		if i < len(updateData.Status) {
			status = updateData.Status[i]
		}

		// รวมข้อมูล field อื่น ๆ
		merged := receiveDevelopModel.DevelopmentResults{
			Status:   status,
			Category: existing.Category,
			Detail:   existing.Detail,
			Image:    existing.Image,
			Note:     existing.Note,
		}
		updatedDevelopmentsData = append(updatedDevelopmentsData, merged)
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

// @Summary ดึงข้อมูลการประเมินพัฒนาการของเด็กตาม ChildID
// @Description ใช้สำหรับดึงข้อมูลการประเมินพัฒนาการของเด็กตาม ChildID (ผู้ใช้ต้องเป็นเจ้าของข้อมูลเด็กคนนี้)
// @Tags ReceiveDevelop
// @Produce json
// @Param id path string true "ObjectID ของเด็ก (ChildID)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /receiveDevelop/getById/{id} [get]
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
