package standardDevelopController

import (
	"context"
	"net/http"
	"os"

	standardDevelopModel "github.com/Samind2/MimiCaare-Project/service/models/standardDev"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var StandardDevelopCollection *mongo.Collection

// SetStandardDevelopCollection กำหนด collection
func SetStandardDevelopCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	StandardDevelopCollection = client.Database(dbName).Collection("standardDevelops")
}

// AddStandardDevelop เพิ่มข้อมูลพัฒนาการมาตรฐานใหม่
func AddStandardDevelop(c *gin.Context) {
	var developData standardDevelopModel.StandardDevelop

	// ดึงข้อมูล JSON เดียวรอบเดียว
	if err := c.ShouldBindJSON(&developData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	if developData.AgeRange <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่ควรมีช่วงอายุน้อยกว่าหรือเท่ากับ 0"})
		return
	}

	if len(developData.Developments) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่พบรายการพัฒนาการ"})
		return
	}

	// วนตรวจสอบแต่ละรายการ
	for i := range developData.Developments {
		record := &developData.Developments[i]

		if record.Category == "" || record.Detail == "" || record.Note == "" || record.Image == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลพัฒนาการให้ครบทุกช่อง"})
			return
		}

		// อัปโหลดภาพ (ถ้ามี)
		if record.Image != "" {
			cloudinaryURL := os.Getenv("CLOUDINARY_URL")
			cld, err := cloudinary.NewFromURL(cloudinaryURL)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
				return
			}

			uploadResponse, err := cld.Upload.Upload(context.TODO(), record.Image, uploader.UploadParams{
				Folder: "development image",
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
				return
			}

			// แทนที่ลิงก์ภาพ
			record.Image = uploadResponse.SecureURL
		}
	}

	developData.ID = primitive.NewObjectID()

	// บันทึกลง MongoDB
	_, err := StandardDevelopCollection.InsertOne(context.TODO(), developData)
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
	focus, err := StandardDevelopCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลทั้งหมดได้", "error": err.Error()})
		return
	}
	defer focus.Close(context.TODO())
	// สร้าง slice/array เพื่อเก็บผลลัพธ์
	var results []standardDevelopModel.StandardDevelop
	for focus.Next(context.TODO()) {
		var standardDev standardDevelopModel.StandardDevelop
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

	var result standardDevelopModel.StandardDevelop
	err = StandardDevelopCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&result)
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

	// รับข้อมูลใหม่จาก JSON
	var updatedData standardDevelopModel.StandardDevelop
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	// ดึงข้อมูลเดิมจากฐานข้อมูล
	var existingDevRecord standardDevelopModel.StandardDevelop
	err = StandardDevelopCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&existingDevRecord)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเดิม", "error": err.Error()})
		return
	}

	// --- รวมข้อมูล ---
	updatedAge := existingDevRecord.AgeRange
	if updatedData.AgeRange > 0 {
		updatedAge = updatedData.AgeRange
	}

	// รวม DevelopmentItems ทีละรายการ
	var updatedDevelopments []standardDevelopModel.DevelopmentItem
	if len(updatedData.Developments) > 0 {
		for i, updatedItem := range updatedData.Developments {
			var mergedItem standardDevelopModel.DevelopmentItem

			// ถ้ามีข้อมูลเดิมสำหรับตำแหน่งนี้ ให้ใช้
			var existingItem standardDevelopModel.DevelopmentItem
			if i < len(existingDevRecord.Developments) {
				existingItem = existingDevRecord.Developments[i]
			}

			// รวมแต่ละฟิลด์
			if updatedItem.Category != "" {
				mergedItem.Category = updatedItem.Category
			} else {
				mergedItem.Category = existingItem.Category
			}
			if updatedItem.Detail != "" {
				mergedItem.Detail = updatedItem.Detail
			} else {
				mergedItem.Detail = existingItem.Detail
			}
			if updatedItem.Note != "" {
				mergedItem.Note = updatedItem.Note
			} else {
				mergedItem.Note = existingItem.Note
			}

			// ตรวจสอบ image ใหม่
			if updatedItem.Image != "" {
				cloudinaryURL := os.Getenv("CLOUDINARY_URL")
				cld, err := cloudinary.NewFromURL(cloudinaryURL)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
					return
				}
				uploadResponse, err := cld.Upload.Upload(context.TODO(), updatedItem.Image, uploader.UploadParams{
					Folder: "development image",
				})
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปโหลดภาพไม่สำเร็จ", "error": err.Error()})
					return
				}
				mergedItem.Image = uploadResponse.SecureURL
			} else {
				mergedItem.Image = existingItem.Image
			}

			updatedDevelopments = append(updatedDevelopments, mergedItem)
		}
	} else {
		// ถ้าไม่ได้ส่ง developments ใหม่มา  ใช้ของเดิมทั้งหมด
		updatedDevelopments = existingDevRecord.Developments
	}

	// อัปเดตจริง
	updateFields := bson.M{
		"ageRange":     updatedAge,
		"developments": updatedDevelopments,
	}

	result, err := StandardDevelopCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objectID},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลที่ต้องการอัปเดต"})
		return
	}

	// ดึงข้อมูลหลังอัปเดต
	var updatedDoc standardDevelopModel.StandardDevelop
	err = StandardDevelopCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&updatedDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลหลังอัปเดตได้", "error": err.Error()})
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
	result, err := StandardDevelopCollection.DeleteOne(context.TODO(), bson.M{"_id": objectID})
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
