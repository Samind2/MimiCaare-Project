package childrenController

import (
	"context"
	"net/http"
	"os"

	"github.com/Samind2/MimiCaare-Project/service/config/token"
	childrenModels "github.com/Samind2/MimiCaare-Project/service/models/children"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var childrenCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetChildrenCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	childrenCollection = client.Database(dbName).Collection("children")
}

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

	var children childrenModels.Children
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
		uploadResponse, err := cld.Upload.Upload(context.Background(), children.Image, uploader.UploadParams{
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
	_, err = childrenCollection.InsertOne(context.Background(), children)
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

	var children []childrenModels.Children
	pointer, err := childrenCollection.Find(context.Background(), childrenModels.Children{ParentID: parentId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถดึงข้อมูลเด็กได้"})
		return
	}
	defer pointer.Close(context.Background())

	for pointer.Next(context.Background()) {
		var child childrenModels.Children
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

	var child childrenModels.Children
	err = childrenCollection.FindOne(context.Background(), bson.M{"_id": childObjectID, "parentId": parentId}).Decode(&child)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"children": child,
	})
}

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
	var existingChild childrenModels.Children
	err = childrenCollection.FindOne(context.Background(), bson.M{"_id": childObjectID, "parentId": parentId}).Decode(&existingChild)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบข้อมูลเด็ก"})
		return
	}

	// รับข้อมูลใหม่จากฝั่งหน้าบ้าน
	var updatedData childrenModels.Children
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
		return
	}

	// อัปเดตเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง
	updateFields := make(map[string]interface{})
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
		uploadResponse, err := cld.Upload.Upload(context.Background(), updatedData.Image, uploader.UploadParams{
			Folder: "children image",
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
			return
		}
		updateFields["image"] = uploadResponse.SecureURL
	}

	// อัปเดตข้อมูลในฐานข้อมูล
	_, err = childrenCollection.UpdateOne(
		context.Background(),
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
