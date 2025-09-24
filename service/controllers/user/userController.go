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
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var UserCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetUserCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")                                // ดึงค่าชื่อฐานข้อมูลจาก .env
	UserCollection = client.Database(dbName).Collection("users") // ตั้งค่าชื่อ Collection สำหรับผู้ใช้
}

type registerRequest struct {
	Email     string `json:"email" example:"example@mail.com"`
	FirstName string `json:"firstName" example:"John"`
	LastName  string `json:"lastName" example:"Doe"`
	Password  string `json:"password" example:"strongpassword123"`
}

// Signup godoc
// @Summary สมัครสมาชิก
// @Description สร้างบัญชีผู้ใช้ใหม่
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   user body registerRequest true "User signup data"
// @Success 201 {object} map[string]interface{} "สมัครสมาชิกสำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 500 {object} map[string]interface{} "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"
// @Router /user/signup [post]
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

type loginRequest struct {
	Email    string `json:"email" example:"example@mail.com"`
	Password string `json:"password" example:"strongpassword123"`
}

// Login godoc
// @Summary เข้าสู่ระบบ
// @Description ผู้ใช้เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน จากนั้นระบบจะส่ง JWT token กลับมา
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body loginRequest true "ข้อมูลเข้าสู่ระบบ"
// @Success 200 {object} map[string]interface{} "เข้าสู่ระบบสำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 401 {object} map[string]interface{} "รหัสผ่านไม่ถูกต้อง"
// @Failure 404 {object} map[string]interface{} "ไม่พบผู้ใช้งาน"
// @Failure 500 {object} map[string]interface{} "ข้อผิดพลาดจากเซิร์ฟเวอร์"
// @Router /user/login [post]
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

// Logout godoc
// @Summary ออกจากระบบ
// @Description ลบ JWT cookie ออกจากระบบ
// @Tags Auth
// @Produce  json
// @Success 200 {object} map[string]interface{} "ออกจากระบบสำเร็จ"
// @Failure 500 {object} map[string]interface{} "ข้อผิดพลาดจากเซิร์ฟเวอร์"
// @Router /user/logout [post]
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

type updateRequest struct {
	FirstName string `json:"firstName,omitempty" example:"John"`
	LastName  string `json:"lastName,omitempty" example:"Doe"`
	Email     string `json:"email,omitempty" example:"newemail@mail.com"`
	Image     string `json:"picture,omitempty" example:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."`
}

// UpdateProfile godoc
// @Summary อัปเดตโปรไฟล์
// @Description อัปเดตข้อมูลผู้ใช้ (ชื่อ, นามสกุล, อีเมล, รูปภาพ)
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   profile body updateRequest true "ข้อมูลที่ต้องการอัปเดต"
// @Success 200 {object} map[string]interface{} "โปรไฟล์อัปเดตสำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 403 {object} map[string]interface{} "ไม่ได้รับอนุญาต"
// @Router /user/update [put]
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

type resetPasswordRequest struct {
	OldPassword       string `json:"oldPassword" example:"strongpassword123"`
	NewPassword       string `json:"newPassword" example:"newstrongpassword123"`
	RepeatNewPassword string `json:"repeatNewPassword" example:"newstrongpassword123"`
}

// ResetPassword godoc
// @Summary เปลี่ยนรหัสผ่าน
// @Description รีเซ็ตรหัสผ่านใหม่ โดยตรวจสอบรหัสผ่านเก่า
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   passwords body resetPasswordRequest true "รหัสผ่านเก่าและรหัสผ่านใหม่"
// @Success 200 {object} map[string]interface{} "รหัสผ่านถูกอัปเดตสำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 401 {object} map[string]interface{} "รหัสผ่านเก่าไม่ถูกต้อง"
// @Router /user/reset-password [put]
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

// GetAllUsers godoc
// @Summary ดึงข้อมูลผู้ใช้ทั้งหมด
// @Description ดึงข้อมูลผู้ใช้ทั้งหมด (เฉพาะ admin เท่านั้น)
// @Tags Auth
// @Produce  json
// @Success 200 {object} map[string]interface{} "ดึงข้อมูลผู้ใช้สำเร็จ"
// @Failure 403 {object} map[string]interface{} "ไม่ได้รับอนุญาต"
// @Router /user/all [get]
func GetAllUsers(c *gin.Context) {
	jwtCookie, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - ไม่มีคุกกี้"})
		return
	}

	userClaims, err := token.ValidateToken(jwtCookie)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบโทเค็น"})
		return
	}

	adminID, err := primitive.ObjectIDFromHex(userClaims.UserId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ไอดีผู้ใช้ไม่ถูกต้อง"})
		return
	}

	//  check role
	var admin userModel.User
	ctx := c.Request.Context()
	err = UserCollection.FindOne(ctx, bson.M{"_id": adminID}).Decode(&admin)
	if err != nil || admin.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"})
		return
	}
	//  ดึงข้อมูลผู้ใช้ทั้งหมด โดยไม่ดึงรหัสผ่าน โดยการสร้าง options ขึ้นมา
	opts := options.Find().SetProjection(bson.M{
		"password": 0,
	})

	cursor, err := UserCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้"})
		return
	}
	defer cursor.Close(ctx)

	var users []userModel.User
	for cursor.Next(ctx) {
		var u userModel.User
		if err := cursor.Decode(&u); err != nil {
			log.Printf("Decode user error: %v", err)
			continue
		}
		users = append(users, u)
	}

	if err := cursor.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ดึงข้อมูลผู้ใช้สำเร็จ",
		"users":   users,
	})
}

type assignRoleRequest struct {
	TargetId string `bson:"targetId" json:"targetId"`
	Role     string `bson:"role,omitempty" json:"role" enums:"user,admin" example:"user"`
}

// AssignRole godoc
// @Summary กำหนดสิทธิ์ผู้ใช้
// @Description เปลี่ยน role ของผู้ใช้ (admin เท่านั้น)
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   role body assignRoleRequest true "Target user ID และ Role ใหม่"
// @Success 200 {object} map[string]interface{} "อัปเดต role สำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 403 {object} map[string]interface{} "ไม่ได้รับอนุญาต"
// @Router /user/assign-role [put]
func AssignRole(c *gin.Context) {
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
	var user userModel.User
	err = UserCollection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่พบข้อมูลผู้ใช้"})
		return
	}
	// เช็ค role
	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"})
		return
	}
	var req struct {
		TargetId string `bson:"targetId" json:"targetId"`
		Role     string `bson:"role,omitempty" json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูลไม่ถูกต้อง"})
		return
	}
	if req.TargetId == "" || req.Role == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบทุกช่อง"})
		return
	}
	targetObjectID, err := primitive.ObjectIDFromHex(req.TargetId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}
	if objectID == targetObjectID {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่สามารถเปลี่ยน role ของตัวเองได้"})
		return
	}
	if req.Role != "user" && req.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ข้อมูล role ไม่ถูกต้อง"})
		return
	}
	var targetUser userModel.User
	err = UserCollection.FindOne(context.Background(), bson.M{"_id": targetObjectID}).Decode(&targetUser)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบผู้ใช้งาน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการค้นหาผู้ใช้งาน"})
		}
		return
	}
	// อัปเดต role
	_, err = UserCollection.UpdateOne(context.TODO(), bson.M{"_id": targetObjectID}, bson.M{"$set": bson.M{"role": req.Role}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดขณะอัปเดต role"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดต role สำเร็จ",
		"userId":  targetObjectID,
		"newRole": req.Role,
	})
}
