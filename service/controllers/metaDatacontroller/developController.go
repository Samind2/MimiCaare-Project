package metadataController

import (
	"context"
	"net/http"
	"os"

	developModel "github.com/Samind2/MimiCaare-Project/service/models/metaDataModel"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var developCollection *mongo.Collection

func SetDevelopCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	developCollection = client.Database(dbName).Collection("metaDevelops")
}

type AddDevelopRequest struct {
	Category string `json:"category" binding:"required" example:"กล้ามเนื้อมัดใหญ่"`
	Detail   string `json:"detail" binding:"required" example:"การนั่ง"`
	Note     string `json:"note" binding:"required" example:"เด็กจะเริ่มนั่งได้เองเมื่ออายุประมาณ 6 เดือน โดยไม่ต้องพิง"`
	Image    string `json:"image" binding:"required" example:"https://res.cloudinary.com/demo/image/upload/sample.jpg"`
}

// @Summary เพิ่มพัฒนาการใหม่
// @Description ใช้สำหรับเพิ่มข้อมูลพัฒนาการ (admin เท่านั้น)
// @Tags MetaDevelop
// @Accept json
// @Produce json
// @Param request body AddDevelopRequest true "ข้อมูลช่วงอายุ"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 409 {object} map[string]interface{}
// @Router /metaDevelop/add [post]
func AddNewDevelop(c *gin.Context) {
	var newDevelop developModel.MetaDevelop

	if err := c.ShouldBindJSON(&newDevelop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบข้อมูลเบื้องต้น
	if newDevelop.Category == "" || newDevelop.Detail == "" || newDevelop.Note == "" || newDevelop.Image == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}
	// อัปโหลดภาพไป Cloudinary
	cloudinaryURL := os.Getenv("CLOUDINARY_URL")
	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
		return
	}

	uploadResponse, err := cld.Upload.Upload(context.TODO(), newDevelop.Image, uploader.UploadParams{
		Folder: "development_image",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
		return
	}
	newDevelop.Image = uploadResponse.SecureURL

	// set ObjectID ใหม่
	newDevelop.ID = primitive.NewObjectID()

	// insert ลง MongoDB
	_, err = developCollection.InsertOne(context.TODO(), newDevelop)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "ไม่สามารถบันทึกข้อมูลได้",
			"error":   err.Error(),
		})
		return
	}

	// response กลับ
	c.JSON(http.StatusCreated, gin.H{
		"message": "เพิ่มข้อมูลพัฒนาการสำเร็จ",
		"data":    newDevelop,
	})
}

// @Summary ดึงข้อมูลพัฒนาการทั้งหมด
// @Description คืนค่าข้อมูลพัฒนาการทั้งหมด (admin เท่านั้น)
// @Tags MetaDevelop
// @Produce json
// @Success 200 {array} developModel.MetaDevelop
// @Failure 401 {object} map[string]interface{}
// @Router /metaDevelop/get-all [get]
func GetAllDevelops(c *gin.Context) {
	var develops []developModel.MetaDevelop
	cursor, err := developCollection.Find(context.TODO(), primitive.D{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลได้", "error": err.Error()})
		return
	}
	if err = cursor.All(context.TODO(), &develops); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลพัฒนาการสำเร็จ",
		"data":    develops,
	})
}

// @Summary ดึงข้อมูลพัฒนาการตาม ID
// @Description คืนค่าข้อมูลพัฒนาการตาม ObjectID (admin เท่านั้น)
// @Tags MetaDevelop
// @Produce json
// @Param id path string true "ObjectID ของพัฒนาการ"
// @Success 200 {object} developModel.MetaDevelop
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /metaDevelop/get/{id} [get]
func GetDevelopByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var develop developModel.MetaDevelop
	err = developCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&develop)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลพัฒนาการที่ระบุ", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลพัฒนาการสำเร็จ",
		"data":    develop,
	})
}

type GetByCategoryRequest struct {
	Category string `json:"category" binding:"required" example:"กล้ามเนื้อมัดใหญ่"`
}

// @Summary ดึงข้อมูลพัฒนาการตามหมวดหมู่
// @Description คืนค่าข้อมูลพัฒนาการตามหมวดหมู่ (admin เท่านั้น)
// @Tags MetaDevelop
// @Accept json
// @Produce json
// @Param request body GetByCategoryRequest true "หมวดหมู่พัฒนาการ"
// @Success 200 {array} developModel.MetaDevelop
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /metaDevelop/get-by-category [post]
func GetDevelopByCategory(c *gin.Context) {
	var req struct {
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var develops []developModel.MetaDevelop
	cursor, err := developCollection.Find(context.TODO(), bson.M{"category": req.Category})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลได้", "error": err.Error()})
		return
	}
	if err = cursor.All(context.TODO(), &develops); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลพัฒนาการสำเร็จ",
		"data":    develops,
	})
}

type GetByCategoryAndDetailRequest struct {
	Category string `json:"category" binding:"required" example:"กล้ามเนื้อมัดใหญ่"`
	Detail   string `json:"detail" binding:"required" example:"การนั่ง"`
}

// @Summary ดึงข้อมูลพัฒนาการตามหมวดหมู่และรายละเอียด
// @Description คืนค่าข้อมูลพัฒนาการตามหมวดหมู่และรายละเอียด (admin เท่านั้น)
// @Tags MetaDevelop
// @Accept json
// @Produce json
// @Param request body GetByCategoryAndDetailRequest true "หมวดหมู่และรายละเอียดพัฒนาการ"
// @Success 200 {array} developModel.MetaDevelop
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /metaDevelop/get-by-category-detail [post]
func GetDevelopByCategoryAndDetail(c *gin.Context) {
	var req struct {
		Category string `json:"category" `
		Detail   string `json:"detail" `
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}
	var develops []developModel.MetaDevelop
	cursor, err := developCollection.Find(context.TODO(), bson.M{"category": req.Category, "detail": req.Detail})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลได้", "error": err.Error()})
		return
	}
	if err = cursor.All(context.TODO(), &develops); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถแปลงข้อมูลได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลพัฒนาการสำเร็จ",
		"data":    develops,
	})
}

// @Summary ลบข้อมูลพัฒนาการตาม ID
// @Description ลบข้อมูลพัฒนาการตาม ObjectID (admin เท่านั้น)
// @Tags MetaDevelop
// @Produce json
// @Param id path string true "ObjectID ของพัฒนาการ"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /metaDevelop/delete/{id} [delete]
func DeleteDevelopByID(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}
	// ตรวจสอบก่อนว่าข้อมูลมีอยู่จริง
	var existingDevelop developModel.MetaDevelop
	err = developCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&existingDevelop)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลพัฒนาการที่ต้องการลบ"})
		return
	}
	// ลบข้อมูล
	_, err = developCollection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถลบข้อมูลพัฒนาการได้", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ลบข้อมูลพัฒนาการสำเร็จ",
	})
}

type UpdateDevelopRequest struct {
	Category string `json:"category" example:"การเคลื่อนไหว"`
	Detail   string `json:"detail" example:"การนั่ง"`
	Note     string `json:"note" example:"เด็กจะเริ่มนั่งได้เองเมื่ออายุประมาณ 6 เดือน โดยไม่ต้องพิง"`
	Image    string `json:"image" example:"https://res.cloudinary.com/demo/image/upload/sample.jpg"`
}

// @Summary อัปเดตข้อมูลพัฒนาการตาม ID
// @Description ใช้สำหรับอัปเดตข้อมูลพัฒนาการตาม ObjectID (admin เท่านั้น)
// @Tags MetaDevelop
// @Accept json
// @Produce json
// @Param id path string true "ObjectID ของพัฒนาการที่ต้องการอัปเดต"
// @Param request body UpdateDevelopRequest true "ข้อมูลพัฒนาการที่ต้องการอัปเดต"
// @Success 200 {object} developModel.MetaDevelop
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /metaDevelop/update/{id} [put]
func UpdateDevelopByID(c *gin.Context) {
	idParam := c.Param("id")
	developID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var updatedData developModel.MetaDevelop
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง", "error": err.Error()})
		return
	}

	var existingDevelop developModel.MetaDevelop
	err = developCollection.FindOne(context.TODO(), bson.M{"_id": developID}).Decode(&existingDevelop)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลพัฒนาการที่ต้องการอัปเดต"})
		return
	}

	// ตรวจสอบข้อมูลเบื้องต้น
	if updatedData.Category == "" {
		updatedData.Category = existingDevelop.Category
	}
	if updatedData.Detail == "" {
		updatedData.Detail = existingDevelop.Detail
	}
	if updatedData.Note == "" {
		updatedData.Note = existingDevelop.Note
	}

	// ถ้า image ส่งมาใหม่และไม่เท่ากับของเก่า → upload ใหม่
	if updatedData.Image != "" && updatedData.Image != existingDevelop.Image {
		cloudinaryURL := os.Getenv("CLOUDINARY_URL")
		cld, err := cloudinary.NewFromURL(cloudinaryURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
			return
		}

		uploadResponse, err := cld.Upload.Upload(context.TODO(), updatedData.Image, uploader.UploadParams{
			Folder: "development_image",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
			return
		}

		updatedData.Image = uploadResponse.SecureURL
	} else {
		updatedData.Image = existingDevelop.Image
	}

	// อัปเดต MongoDB
	update := bson.M{
		"category": updatedData.Category,
		"detail":   updatedData.Detail,
		"note":     updatedData.Note,
		"image":    updatedData.Image,
	}

	_, err = developCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": developID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตล้มเหลว", "error": err.Error()})
		return
	}

	// ดึงข้อมูลล่าสุดกลับมา
	var updated developModel.MetaDevelop
	err = developCollection.FindOne(context.TODO(), bson.M{"_id": developID}).Decode(&updated)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "อัปเดตสำเร็จแต่ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสำเร็จ",
		"data":    updated,
	})
}
