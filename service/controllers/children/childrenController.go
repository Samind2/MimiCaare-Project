package childrenController

import (
	"context"
	"net/http"
	"os"

	"github.com/Samind2/MimiCaare-Project/service/config/token"
	childrenModel "github.com/Samind2/MimiCaare-Project/service/models/children"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var ChildrenCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetChildrenCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	ChildrenCollection = client.Database(dbName).Collection("children")
}

type AddChildrenRequest struct {
	FirstName string `json:"firstName" example:"สมชาย"`
	LastName  string `json:"lastName" example:"ใจดี"`
	BirthDate string `json:"birthDate" example:"2020-05-01T00:00:00Z"`
	Gender    string `json:"gender" example:"male"`
	Image     string `json:"image" example:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."`
}

// @Summary เพิ่มข้อมูลเด็กใหม่
// @Description ผู้ปกครองเพิ่มข้อมูลเด็กใหม่ (ต้องล็อกอินก่อน)
// @Tags Children
// @Accept json
// @Produce json
// @Param request body AddChildrenRequest true "ข้อมูลเด็กใหม่"
// @Success 201 {object} map[string]interface{} "เพิ่มข้อมูลเด็กสำเร็จ"
// @Failure 400 {object} map[string]string "ข้อมูลไม่ถูกต้อง"
// @Failure 403 {object} map[string]string "ไม่ได้รับอนุญาต"
// @Failure 500 {object} map[string]string "ระบบขัดข้อง"
// @Router /children/add [post]
func AddNewChildren(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}
	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	parentId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	var children childrenModel.Children
	if err := c.ShouldBindJSON(&children); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลหรือข้อมูลไม่ถูกต้อง"})
		return
	}

	if children.FirstName == "" || children.LastName == "" || children.BirthDate.Time().IsZero() || children.Gender == "" || children.Image == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}
	children.ParentID = parentId // ตั้งค่า ParentID เป็น userId ที่ดึงมาจาก JWT
	if children.Image != "" {
		// เชื่อมต่อกับ Cloudinary
		cloudinaryURL := os.Getenv("CLOUDINARY_URL")
		cld, err := cloudinary.NewFromURL(cloudinaryURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
			return
		}
		// อัปโหลดภาพไปยัง Cloudinary
		uploadResponse, err := cld.Upload.Upload(context.TODO(), children.Image, uploader.UploadParams{
			Folder: "children image",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
			return
		}
		children.Image = uploadResponse.SecureURL
	}
	children.ID = primitive.NewObjectID() // สร้าง ID ใหม่ให้กับเด็ก
	//add data to database
	_, err = ChildrenCollection.InsertOne(context.TODO(), children)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - เพิ่มข้อมูลเด็กไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "เพิ่มข้อมูลเด็กสำเร็จ",
		"id":        children.ID,
		"parentId":  children.ParentID,
		"firstName": children.FirstName,
		"lastName":  children.LastName,
		"birthDate": children.BirthDate,
		"gender":    children.Gender,
		"image":     children.Image,
	})
}

// GetChildrenByParentID godoc
// @Summary ดึงข้อมูลเด็กทั้งหมดของผู้ใช้
// @Description ดึงข้อมูลเด็กทั้งหมดที่เป็นลูกของผู้ปกครอง (ต้องล็อกอินก่อน)
// @Tags Children
// @Produce json
// @Success 200 {object} map[string]interface{} "รายการเด็ก"
// @Failure 403 {object} map[string]string "ไม่ได้รับอนุญาต"
// @Failure 404 {object} map[string]string "ไม่พบข้อมูลเด็ก"
// @Failure 500 {object} map[string]string "ระบบขัดข้อง"
// @Router /children/get [get]
func GetChildrenByParentID(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}
	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	parentId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	var children []childrenModel.Children
	pointer, err := ChildrenCollection.Find(context.TODO(), childrenModel.Children{ParentID: parentId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถดึงข้อมูลเด็กได้"})
		return
	}
	defer pointer.Close(context.TODO())

	for pointer.Next(context.TODO()) {
		var child childrenModel.Children
		if err := pointer.Decode(&child); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถดึงข้อมูลเด็กได้"})
			return
		}
		children = append(children, child)
	}

	if len(children) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"children": children,
	})
}

// GetChildrenByID godoc
// @Summary ดึงข้อมูลเด็กตาม ID
// @Description ดึงข้อมูลเด็กคนเดียว โดยตรวจสอบว่าเป็นลูกของผู้ใช้ (ต้องล็อกอินก่อน)
// @Tags Children
// @Produce json
// @Param id path string true "Child ID"
// @Success 200 {object} map[string]interface{} "ข้อมูลเด็ก"
// @Failure 400 {object} map[string]string "ไอดีเด็กไม่ถูกต้อง"
// @Failure 403 {object} map[string]string "ไม่ได้รับอนุญาต"
// @Failure 404 {object} map[string]string "ไม่พบข้อมูลเด็ก"
// @Router /children/get/{id} [get]
func GetChildrenByID(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}
	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	parentId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	childID := c.Param("id")
	childObjectID, err := primitive.ObjectIDFromHex(childID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีเด็กไม่ถูกต้อง"})
		return
	}

	var child childrenModel.Children
	err = ChildrenCollection.FindOne(context.TODO(), bson.M{"_id": childObjectID, "parentId": parentId}).Decode(&child)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"children": child,
	})
}

type UpdateChildrenRequest struct {
	FirstName string `json:"firstName,omitempty" example:"สมหมาย"`
	LastName  string `json:"lastName,omitempty" example:"ใจดี"`
	BirthDate string `json:"birthDate,omitempty" example:"2020-05-01T00:00:00Z"`
	Gender    string `json:"gender,omitempty" example:"female"`
	Image     string `json:"image" example:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."`
}

// UpdateChildrenByID godoc
// @Summary อัปเดตข้อมูลเด็ก
// @Description อัปเดตข้อมูลเด็กตาม ID (ต้องเป็น parent ของเด็กคนนั้น)
// @Tags Children
// @Accept json
// @Produce json
// @Param id path string true "Child ID"
// @Param request body UpdateChildrenRequest true "ข้อมูลเด็กที่จะอัปเดต"
// @Success 200 {object} map[string]interface{} "อัปเดตข้อมูลเด็กสำเร็จ"
// @Failure 400 {object} map[string]string "ข้อมูลไม่ถูกต้อง"
// @Failure 403 {object} map[string]string "ไม่ได้รับอนุญาต"
// @Failure 404 {object} map[string]string "ไม่พบข้อมูลเด็ก"
// @Router /children/update/{id} [put]
func UpdateChildrenByID(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}

	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	parentId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	// ดึงไอดีเด็กจากพารามิเตอร์
	childID := c.Param("id")
	childObjectID, err := primitive.ObjectIDFromHex(childID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีเด็กไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบว่าเด็กคนนี้เป็นลูกของผู้ใช้หรือไม่
	var existingChild childrenModel.Children
	err = ChildrenCollection.FindOne(context.TODO(), bson.M{"_id": childObjectID, "parentId": parentId}).Decode(&existingChild)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	// รับข้อมูลใหม่จากฝั่งหน้าบ้าน
	var updatedData childrenModel.Children
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	// อัปเดตเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง
	updateFields := make(map[string]any)
	if updatedData.FirstName != "" {
		updateFields["firstName"] = updatedData.FirstName
	}
	if updatedData.LastName != "" {
		updateFields["lastName"] = updatedData.LastName
	}
	if !updatedData.BirthDate.Time().IsZero() {
		updateFields["birthDate"] = updatedData.BirthDate
	}
	if updatedData.Gender != "" {
		updateFields["gender"] = updatedData.Gender
	}
	if updatedData.Image != "" {
		// เชื่อมต่อกับ Cloudinary และอัปโหลดภาพใหม่
		cloudinaryURL := os.Getenv("CLOUDINARY_URL")
		cld, err := cloudinary.NewFromURL(cloudinaryURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
			return
		}
		uploadResponse, err := cld.Upload.Upload(context.TODO(), updatedData.Image, uploader.UploadParams{
			Folder: "children image",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
			return
		}
		updateFields["image"] = uploadResponse.SecureURL
	}

	// อัปเดตข้อมูลในฐานข้อมูล
	_, err = ChildrenCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": childObjectID, "parentId": parentId},
		bson.M{"$set": updateFields},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - อัปเดตข้อมูลเด็กไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "อัปเดตข้อมูลเด็กสำเร็จ",
		"children": updateFields,
	})
}

// DeleteChildrenByID godoc
// @Summary ลบข้อมูลเด็ก
// @Description ลบข้อมูลเด็กตาม ID (ต้องเป็น parent ของเด็กคนนั้น)
// @Tags Children
// @Produce json
// @Param id path string true "Child ID"
// @Success 200 {object} map[string]string "ลบข้อมูลเด็กสำเร็จ"
// @Failure 400 {object} map[string]string "ไอดีเด็กไม่ถูกต้อง"
// @Failure 403 {object} map[string]string "ไม่ได้รับอนุญาต"
// @Failure 404 {object} map[string]string "ไม่พบข้อมูลเด็ก"
// @Failure 500 {object} map[string]string "ระบบขัดข้อง"
// @Router /children/delete/{id} [delete]
func DeleteChildrenByID(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}

	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	parentId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token ผิดพลาด กรุณาเข้าสู่ระบบใหม่"})
		return
	}

	// ดึงไอดีเด็กจากพารามิเตอร์
	childID := c.Param("id")
	childObjectID, err := primitive.ObjectIDFromHex(childID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีเด็กไม่ถูกต้อง"})
		return
	}

	// ตรวจสอบว่าเด็กคนนี้เป็นลูกของผู้ใช้หรือไม่
	var existingChild childrenModel.Children
	err = ChildrenCollection.FindOne(context.TODO(), bson.M{"_id": childObjectID, "parentId": parentId}).Decode(&existingChild)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	// ลบข้อมูลเด็กจากฐานข้อมูล
	_, err = ChildrenCollection.DeleteOne(context.TODO(), bson.M{"_id": childObjectID, "parentId": parentId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ลบข้อมูลเด็กไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ลบข้อมูลเด็กสำเร็จ",
	})
}
