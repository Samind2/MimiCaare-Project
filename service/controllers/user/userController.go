package userController

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Samind2/MimiCaare-Project/service/config/token"
	userModel "github.com/Samind2/MimiCaare-Project/service/models/user"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var UserCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetUserCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")                                // ดึงค่าชื่อฐานข้อมูลจาก .env
	UserCollection = client.Database(dbName).Collection("users") // ตั้งค่าชื่อ Collection สำหรับผู้ใช้
}

func Signup(c *gin.Context) {
	var user userModel.User
	//เช็คข้อมูลก่อนว่ามาป่าว
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลหรือข้อมูลไม่ถูกต้อง"})
		return
	}

	//เช็คค่าของข้อมูล
	if user.FirstName == "" || user.LastName == "" || user.Email == "" || user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}

	var existingEmail userModel.User
	err := UserCollection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingEmail)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "อีเมลนี้ถูกใช้ไปแล้ว"})
		return
	}

	//เข้ารหัส รหัสผ่าน
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "สมัครสมาชิกล้มเหลว - ระบบขัดข้องระหว่างการเข้ารหัสข้อมูล"})
		return
	}
	user.Password = string(hashPassword)

	// ตั้งค่า role เป็น "user" ถ้าไม่ได้บอกมา
	if user.Role == "" {
		user.Role = "user"
	}
	if user.Picture == "" {
		user.Picture = ""
	}

	//เพิ่มข้อมูลลงฐานข้อมูล
	user.ID = primitive.NewObjectID()
	_, err = UserCollection.InsertOne(context.TODO(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "สมัครสมาชิกล้มเหลว - ระบบขัดข้องระหว่างสมัครสมาชิก"})
		return
	}

	jwtToken, err := token.GenerateToken(user.ID.Hex(), c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "สมัครสมาชิกล้มเหลว - ระบบขัดข้องระหว่างการสร้าง token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "สมัครสมาชิกสำเร็จ",
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"picture":   user.Picture,
		"role":      user.Role,
		"token":     jwtToken,
	})
}

func Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่มีค่าหรือข้อมูลไม่ถูกต้อง"})
		return
	}
	if req.Email == "" || req.Password == "" {
		c.JSON((http.StatusBadRequest), gin.H{"message": "กรูณากรอกข้อมูลให้ครบถ้วน"})
		return
	}
	var user userModel.User
	err := UserCollection.FindOne(context.TODO(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้งาน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เข้าสู่ระบบล้มเหลว - ระบบขัดข้องระหว่างการตรวจสอบอีเมล"})
		}
		return
	}
	// เช็ครหัสผ่าน
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "รหัสผ่านไม่ถูกต้อง"})
		return
	}
	//สร้าง token
	jwtToken, err := token.GenerateToken(user.ID.Hex(), c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เข้าสู่ระบบล้มเหลว - ระบบขัดข้องระหว่างการสร้าง token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"picture":   user.Picture,
		"role":      user.Role,
		"token":     jwtToken,
	})
}

func Logout(c *gin.Context) {
	sameSite, secure := token.GetCookieConfig()
	//  ตรวจสอบค่าที่ได้จาก GetCookieConfig()
	log.Println("SameSite:", sameSite)
	log.Println("Secure:", secure)

	//  ต้องตั้ง Path ให้ตรงกับตอน set
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
	}
	http.SetCookie(c.Writer, cookie)
	log.Println("Set-Cookie:", cookie)
	c.JSON(http.StatusOK, gin.H{"message": "ออกจากระบบสำเร็จ"})
}

func UpdateProfile(c *gin.Context) {
	// ดึง JWT จากคุกกี้
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีโทเค็น"})
		return
	}
	// ยืนยันและดึงข้อมูลจาก JWT
	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}
	userId := userClaims.UserId // ดึง userId จาก claims
	//log.Println("User ID:", userId)
	// แปลง userId เป็น ObjectID
	objectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีผู้ใช้ไม่ถูกต้อง"})
		return
	}
	var req struct {
		FirstName string `json:"firstName,omitempty"`
		LastName  string `json:"lastName,omitempty"`
		Email     string `json:"email,omitempty"`
		Picture   string `json:"picture,omitempty"`
	}
	// ผูกข้อมูล JSON เข้ากับโครงสร้าง
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง"})
		return
	}
	// ตรวจสอบว่ามี profilePic หรือไม่
	var pictureURL string
	if req.Picture != "" {
		//upload pic to cloudinary
		cloudinaryURL := os.Getenv("CLOUDINARY_URL")
		cld, err := cloudinary.NewFromURL(cloudinaryURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเชื่อมต่อ Cloudinary ได้"})
			return
		}
		uploadResponse, err := cld.Upload.Upload(context.TODO(), req.Picture, uploader.UploadParams{
			Folder: "user_profiles", // เก็บไฟล์ในโฟลเดอร์ "user_profiles"
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปโหลดภาพ"})
			return
		}
		pictureURL = uploadResponse.SecureURL
	}
	//เช็คข้อมูล ยูสเซอร์ก่อน
	var existingUser userModel.User
	err = UserCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&existingUser)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้งาน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการค้นหาผู้ใช้งาน"})
		}
		return
	}

	//สร้างตัวแปรสำหรับเก็บข้อมูลที่ต้องการอัปเดต
	update := bson.M{}
	if req.FirstName != "" {
		update["firstName"] = req.FirstName
	}
	if req.LastName != "" {
		update["lastName"] = req.LastName
	}
	if pictureURL != "" {
		update["picture"] = pictureURL
	}
	if req.Email != "" {
		update["email"] = req.Email
	}

	// อัปเดตข้อมูลในฐานข้อมูล
	if len(update) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีข้อมูลให้อัปเดต"})
		return
	}
	result, err := UserCollection.UpdateOne(context.TODO(), bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปเดตโปรไฟล์"})
		return
	}
	if result.ModifiedCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไม่มีการเปลี่ยนแปลงข้อมูล"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "โปรไฟล์อัปเดตสำเร็จ",
		"userId":    userId,
		"firstName": update["firstName"],
		"lastName":  update["lastName"],
		"email":     update["email"],
		"picture":   pictureURL,
	})
}

func ResetPassword(c *gin.Context) {
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
	//log.Println("User ID:", userId)
	// แปลง userId เป็น ObjectID
	objectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีผู้ใช้ไม่ถูกต้อง"})
		return
	}
	var req struct {
		OldPassword       string `json:"oldPassword"`
		NewPassword       string `json:"newPassword"`
		RepeatNewPassword string `json:"repeatNewPassword"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง"})
		return
	}
	if req.OldPassword == "" || req.NewPassword == "" || req.RepeatNewPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}
	if req.OldPassword == req.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รหัสผ่านใหม่ต้องไม่ตรงกับรหัสผ่านเก่า"})
		return
	}
	if req.NewPassword != req.RepeatNewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน"})
		return
	}
	var user userModel.User
	err = UserCollection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้งาน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการค้นหาผู้ใช้งาน"})
		}
		return
	}
	// เช็ครหัสผ่านเก่า
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "รหัสผ่านเก่าไม่ถูกต้อง"})
		return
	}
	// เข้ารหัสรหัสผ่านใหม่
	newHashPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่านใหม่"})
		return
	}
	// อัปเดตรหัสผ่านในฐานข้อมูล
	_, err = UserCollection.UpdateOne(context.TODO(), bson.M{"_id": objectID}, bson.M{"$set": bson.M{"password": string(newHashPassword)}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "รหัสผ่านถูกอัปเดตสำเร็จ"})
}
