package receiveVaccineController

import (
	"context"
	"net/http"
	"os"

	receiveVaccineModel "github.com/Samind2/MimiCaare-Project/service/models/receiveVac"
	standardVaccineModel "github.com/Samind2/MimiCaare-Project/service/models/standardVac"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var receiveVaccineCollection *mongo.Collection
var StandardVaccineCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetReceiveVaccineCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	receiveVaccineCollection = client.Database(dbName).Collection("receiveVaccine")
}
func SetStandardVaccineReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	StandardVaccineCollection = client.Database(dbName).Collection("standardVaccine")
}
func AddReceiveVaccineFromStandard(c *gin.Context) {
	var inputData struct {
		ChildID           primitive.ObjectID ` json:"childId"`
		StandardVaccineID primitive.ObjectID `json:"standardVaccineId"`
		AgeRange          int                ` json:"ageRange"`
		ReceiveDate       primitive.DateTime ` json:"receiveDate"`
		PlaceName         string             ` json:"placeName"`
		PhoneNumber       string             ` json:"phoneNumber"`
	}

	if err := c.ShouldBindJSON(&inputData); err != nil {
		c.JSON(400, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var standardVaccine standardVaccineModel.StandardVaccine
	err := StandardVaccineCollection.FindOne(context.TODO(), bson.M{"_id": inputData.StandardVaccineID}).Decode(&standardVaccine)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลวัคซีนมาตรฐานที่ระบุ", "error": err.Error()})
		return
	}

	// แปลงข้อมูลจากวัคซียมาตรฐาน
	var records []receiveVaccineModel.VaccineReceiveItem
	for _, vaccine := range standardVaccine.Vaccines {
		records = append(records, receiveVaccineModel.VaccineReceiveItem{
			VaccineName: vaccine.VaccineName,
			Note:        vaccine.Note})
	}

	var rcVaccine receiveVaccineModel.ReceiveVaccine
	rcVaccine.ID = primitive.NewObjectID()
	rcVaccine.ChildID = inputData.ChildID
	rcVaccine.ReceiveDate = inputData.ReceiveDate
	rcVaccine.PlaceName = inputData.PlaceName
	rcVaccine.PhoneNumber = inputData.PhoneNumber
	rcVaccine.StandardVaccineID = inputData.StandardVaccineID
	rcVaccine.AgeRange = inputData.AgeRange
	rcVaccine.Records = records

	// บันทึกข้อมูลลง MongoDB
	_, err = receiveVaccineCollection.InsertOne(context.Background(), rcVaccine)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "บันทึกข้อมูลวัคซีนจากมาตรฐานสำเร็จ",
		"receive": rcVaccine,
	})
}

func AddReceiveVaccineCustom(c *gin.Context) {
	var receiveData receiveVaccineModel.ReceiveVaccine
	// เช็คข้อมูลก่อนว่ามาป่าว
	if err := c.ShouldBindJSON(&receiveData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var existingVaccine receiveVaccineModel.ReceiveVaccine
	err := receiveVaccineCollection.FindOne(context.TODO(), bson.M{
		"childId": receiveData.ChildID,
		"records": receiveData.Records,
	}).Decode(&existingVaccine)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "มีข้อมูลวัคซีนนี้ในระบบแล้ว"})
		return
	}

	receiveData.ID = primitive.NewObjectID() // สร้าง ObjectID ใหม่
	// บันทึกข้อมูลลง MongoDB
	_, err = receiveVaccineCollection.InsertOne(context.TODO(), receiveData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "บันทึกข้อมูลวัคซีนสำเร็จ",
		"receiveId":   receiveData.ID.Hex(),
		"childId":     receiveData.ChildID.Hex(),
		"receiveDate": receiveData.ReceiveDate.Time().Format("2006-01-02"),
		"placeName":   receiveData.PlaceName,
		"phoneNumber": receiveData.PhoneNumber,
	})
}
func UpdateReceiveVaccineByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var updateData struct {
		PlaceName   string                                   `json:"placeName,omitempty"`
		PhoneNumber string                                   `json:"phoneNumber,omitempty"`
		ReceiveDate primitive.DateTime                       `json:"receiveDate,omitempty"`
		Records     []receiveVaccineModel.VaccineReceiveItem `json:"records,omitempty"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ตรวจสอบว่ามีข้อมูลก่อน
	var focus receiveVaccineModel.ReceiveVaccine
	err = receiveVaccineCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&focus)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลวัคซีนที่ต้องการอัปเดต"})
		return
	}

	// ตรวจสอบว่าข้อมูลเป็นของวัคซีนมาตรฐานหรือไม่
	isStandard := !focus.StandardVaccineID.IsZero()

	// เตรียม fields สำหรับอัปเดต
	update := bson.M{}
	if updateData.PlaceName != "" {
		update["placeName"] = updateData.PlaceName
	}
	if updateData.PhoneNumber != "" {
		update["phoneNumber"] = updateData.PhoneNumber
	}
	if !updateData.ReceiveDate.Time().IsZero() {
		update["receiveDate"] = updateData.ReceiveDate
	}
	if updateData.Records != nil {
		if isStandard {
			c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่สามารถแก้ไขรายการวัคซีนที่มาจากมาตรฐานได้"})
			return
		}
		update["records"] = updateData.Records
	}

	if len(update) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลให้อัปเดต"})
		return
	}

	// อัปเดตลง MongoDB
	_, err = receiveVaccineCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}

	// ดึงข้อมูลล่าสุดกลับมา
	var updated receiveVaccineModel.ReceiveVaccine
	err = receiveVaccineCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&updated)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตสำเร็จแต่ดึงข้อมูลไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสำเร็จ",
		"data":    updated,
	})
}

func DeleteReceiveVaccineByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var focus receiveVaccineModel.ReceiveVaccine
	err = receiveVaccineCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&focus)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลวัคซีนที่ต้องการลบ"})
		return
	}

	// ลบข้อมูล
	_, err = receiveVaccineCollection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ลบข้อมูลไม่สำเร็จ", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบข้อมูลวัคซีนสำเร็จ",
		"id":      id,
	})
}

func GetReceiveVaccineByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var receiveVaccine receiveVaccineModel.ReceiveVaccine
	err = receiveVaccineCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&receiveVaccine)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลวัคซีนที่ระบุ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลวัคซีนสำเร็จ",
		"data":    receiveVaccine,
	})
}

func GetAllReceiveVaccines(c *gin.Context) {
	focus, err := receiveVaccineCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลวัคซีนได้", "error": err.Error()})
		return
	}
	defer focus.Close(context.TODO())

	var vaccines []receiveVaccineModel.ReceiveVaccine
	for focus.Next(context.TODO()) {
		var vaccine receiveVaccineModel.ReceiveVaccine
		if err := focus.Decode(&vaccine); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "มีข้อผิดพลาดระหว่างแปลงข้อมูล", "error": err.Error()})
			return
		}
		vaccines = append(vaccines, vaccine)
	}

	c.JSON(http.StatusOK, gin.H{"vaccines": vaccines})
}

func GetReceiveVaccineByChildrenID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	focus, err := receiveVaccineCollection.Find(context.TODO(), bson.M{"childId": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลวัคซีนได้", "error": err.Error()})
		return
	}
	defer focus.Close(context.TODO())

	var vaccines []receiveVaccineModel.ReceiveVaccine
	for focus.Next(context.TODO()) {
		var vaccine receiveVaccineModel.ReceiveVaccine
		if err := focus.Decode(&vaccine); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "มีข้อผิดพลาดระหว่างแปลงข้อมูล", "error": err.Error()})
			return
		}
		vaccines = append(vaccines, vaccine)
	}

	c.JSON(http.StatusOK, gin.H{"vaccines": vaccines})
}
