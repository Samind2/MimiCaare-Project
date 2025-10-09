package notificationControllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Samind2/MimiCaare-Project/service/config/token"
	"github.com/Samind2/MimiCaare-Project/service/config/worker"
	childrenModel "github.com/Samind2/MimiCaare-Project/service/models/children"
	notificationModel "github.com/Samind2/MimiCaare-Project/service/models/notification"
	standardDevelopModel "github.com/Samind2/MimiCaare-Project/service/models/standardDev"
	standardVaccineModel "github.com/Samind2/MimiCaare-Project/service/models/standardVac"
	"github.com/gin-gonic/gin"
	"github.com/go-co-op/gocron"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var notificationCollection *mongo.Collection
var ChildrenCollection *mongo.Collection
var StandardDevelopCollection *mongo.Collection
var StandardVaccineCollection *mongo.Collection

// SetNotificationCollection ตั้งค่า notificationCollection
func SetNotificationCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	notificationCollection = client.Database(dbName).Collection("notifications")
}
func SetChildrenReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	ChildrenCollection = client.Database(dbName).Collection("children")
}
func SetStandardVaccineReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	StandardVaccineCollection = client.Database(dbName).Collection("standardVaccine")
}
func SetStandardDevelopReference(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	StandardDevelopCollection = client.Database(dbName).Collection("standardDevelops")
}
func fetchChildren() []childrenModel.Children {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var children []childrenModel.Children

	cursor, err := ChildrenCollection.Find(ctx, map[string]interface{}{})
	if err != nil {
		log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลเด็ก:", err)
		return children
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var child childrenModel.Children
		if err := cursor.Decode(&child); err == nil {
			children = append(children, child)
		}
	}

	return children
}
func fetchStandardVaccines() []standardVaccineModel.StandardVaccine {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var standardVaccines []standardVaccineModel.StandardVaccine

	cursor, err := StandardVaccineCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลวัคซีนมาตรฐาน:", err)
		return standardVaccines
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var vaccineDoc standardVaccineModel.StandardVaccine
		if err := cursor.Decode(&vaccineDoc); err == nil {
			standardVaccines = append(standardVaccines, vaccineDoc)
		}
	}

	return standardVaccines
}
func fetchStandardDevelopments() []standardDevelopModel.StandardDevelop {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var standardDevelops []standardDevelopModel.StandardDevelop

	cursor, err := StandardDevelopCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("เกิดข้อผิดพลาดในการดึงข้อมูลพัฒนาการมาตรฐาน:", err)
		return standardDevelops
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var developDoc standardDevelopModel.StandardDevelop
		if err := cursor.Decode(&developDoc); err == nil {
			standardDevelops = append(standardDevelops, developDoc)
		}
	}

	return standardDevelops
}

func StartScheduler() {
	s := gocron.NewScheduler(time.Local)

	// ทำงานทุกวันเวลา 8:00
	s.Every(1).Day().At("08:00").Do(func() {
		log.Println("Start checking notifications...")
		RunNotificationJob7Day()
		RunNotificationJob3Day()
		RunNotificationJobToDay()
	})

	s.StartAsync()
}

func RunNotificationJob7Day() {
	children := fetchChildren()
	jobs := []func(){}
	thaiLoc, _ := time.LoadLocation("Asia/Bangkok") // ใช้ timezone ไทย

	for _, child := range children {
		childCopy := child
		vaccines := fetchStandardVaccines()
		develops := fetchStandardDevelopments()

		for _, vaccine := range vaccines {
			expectedDate := child.BirthDate.Time().AddDate(0, vaccine.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 7 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "vaccine",
					"ageRange": vaccine.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf("❌ Count vaccine error: %v", err)
					continue
				}

				if exists == 0 {
					vaccineCopy := vaccine

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in vaccine job: %v", r)
							}
						}()

						log.Printf("📢 แจ้งเตือนวัคซีน (อายุ %d เดือน) ให้ผู้ปกครองของ %s", vaccineCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "vaccine",
							"ageRange":  vaccineCopy.AgeRange,
							"title":     fmt.Sprintf("อีก 7 วัน มีวัคซีนที่ต้องเข้ารับในช่วงอายุ %d เดือน", vaccineCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf("❌ Insert vaccine notification error: %v", err)
						}
					})
				}
			}
		}

		for _, dev := range develops {
			expectedDate := child.BirthDate.Time().AddDate(0, dev.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 7 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "development",
					"ageRange": dev.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf("❌ Count development error: %v", err)
					continue
				}

				if exists == 0 {
					devCopy := dev

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in development job: %v", r)
							}
						}()

						log.Printf("📢 แจ้งเตือนพัฒนาการ (อายุ %d เดือน) ให้ผู้ปกครองของ %s", devCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "development",
							"ageRange":  devCopy.AgeRange,
							"title":     fmt.Sprintf("อีก 7 วัน มีพัฒนาการที่ต้องประเมินในช่วงอายุ %d เดือน", devCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf("❌ Insert development notification error: %v", err)
						}
					})
				}
			}
		}
	}

	if len(jobs) == 0 {
		log.Println(" ไม่มีเด็กที่ต้องแจ้งเตือนในช่วง 7 วันข้างหน้า")
		return
	}

	log.Printf(" พบ %d การแจ้งเตือน กำลังดำเนินการ...", len(jobs))
	worker.RunWorkerPool(jobs)
	log.Println("✅ การแจ้งเตือนเสร็จสิ้น")
}

func RunNotificationJob3Day() {
	children := fetchChildren()
	jobs := []func(){}
	thaiLoc, _ := time.LoadLocation("Asia/Bangkok") // ใช้ timezone ไทย

	for _, child := range children {
		childCopy := child
		vaccines := fetchStandardVaccines()
		develops := fetchStandardDevelopments()

		for _, vaccine := range vaccines {
			expectedDate := child.BirthDate.Time().AddDate(0, vaccine.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 3 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "vaccine",
					"ageRange": vaccine.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf(" Count vaccine error: %v", err)
					continue
				}

				if exists == 0 {
					vaccineCopy := vaccine

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in vaccine job: %v", r)
							}
						}()

						log.Printf(" แจ้งเตือนวัคซีน (อายุ %d เดือน) ให้ผู้ปกครองของ %s", vaccineCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "vaccine",
							"ageRange":  vaccineCopy.AgeRange,
							"title":     fmt.Sprintf("อีก 3 วัน มีวัคซีนที่ต้องเข้ารับในช่วงอายุ %d เดือน", vaccineCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf(" Insert vaccine notification error: %v", err)
						}
					})
				}
			}
		}

		for _, dev := range develops {
			expectedDate := child.BirthDate.Time().AddDate(0, dev.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 3 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "development",
					"ageRange": dev.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf(" Count development error: %v", err)
					continue
				}

				if exists == 0 {
					devCopy := dev

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in development job: %v", r)
							}
						}()

						log.Printf(" แจ้งเตือนพัฒนาการ (อายุ %d เดือน) ให้ผู้ปกครองของ %s", devCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "development",
							"ageRange":  devCopy.AgeRange,
							"title":     fmt.Sprintf("อีก 3 วัน มีพัฒนาการที่ต้องประเมินในช่วงอายุ %d เดือน", devCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf(" Insert development notification error: %v", err)
						}
					})
				}
			}
		}
	}

	if len(jobs) == 0 {
		log.Println("📭 ไม่มีเด็กที่ต้องแจ้งเตือนในช่วง 3 วันข้างหน้า")
		return
	}

	log.Printf(" พบ %d การแจ้งเตือน กำลังดำเนินการ...", len(jobs))
	worker.RunWorkerPool(jobs)
	log.Println("✅ การแจ้งเตือนเสร็จสิ้น")
}

func RunNotificationJobToDay() {
	children := fetchChildren()
	jobs := []func(){}
	thaiLoc, _ := time.LoadLocation("Asia/Bangkok") // ใช้ timezone ไทย

	for _, child := range children {
		childCopy := child
		vaccines := fetchStandardVaccines()
		develops := fetchStandardDevelopments()

		for _, vaccine := range vaccines {
			expectedDate := child.BirthDate.Time().AddDate(0, vaccine.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 0 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "vaccine",
					"ageRange": vaccine.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf(" Count vaccine error: %v", err)
					continue
				}

				if exists == 0 {
					vaccineCopy := vaccine

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in vaccine job: %v", r)
							}
						}()

						log.Printf(" แจ้งเตือนวัคซีน (อายุ %d เดือน) ให้ผู้ปกครองของ %s", vaccineCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "vaccine",
							"ageRange":  vaccineCopy.AgeRange,
							"title":     fmt.Sprintf("วันนี้มีวัคซีนที่ต้องเข้ารับในช่วงอายุ %d เดือน", vaccineCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf(" Insert vaccine notification error: %v", err)
						}
					})
				}
			}
		}

		for _, dev := range develops {
			expectedDate := child.BirthDate.Time().AddDate(0, dev.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 0 {
				filter := bson.M{
					"userId":   childCopy.ParentID,
					"childId":  childCopy.ID,
					"type":     "development",
					"ageRange": dev.AgeRange,
				}

				exists, err := notificationCollection.CountDocuments(context.TODO(), filter)
				if err != nil {
					log.Printf(" Count development error: %v", err)
					continue
				}

				if exists == 0 {
					devCopy := dev

					jobs = append(jobs, func() {
						defer func() {
							if r := recover(); r != nil {
								log.Printf("panic in development job: %v", r)
							}
						}()

						log.Printf(" แจ้งเตือนพัฒนาการ (อายุ %d เดือน) ให้ผู้ปกครองของ %s", devCopy.AgeRange, childCopy.FirstName)

						_, err := notificationCollection.InsertOne(context.Background(), bson.M{
							"userId":    childCopy.ParentID,
							"childId":   childCopy.ID,
							"type":      "development",
							"ageRange":  devCopy.AgeRange,
							"title":     fmt.Sprintf("วันนี้มีพัฒนาการที่ต้องประเมินในช่วงอายุ %d เดือน", devCopy.AgeRange),
							"childName": fmt.Sprintf("น้อง%s %s", childCopy.FirstName, childCopy.LastName),
							"date":      time.Now().In(thaiLoc),
							"isRead":    false,
						})
						if err != nil {
							log.Printf("❌ Insert development notification error: %v", err)
						}
					})
				}
			}
		}
	}

	if len(jobs) == 0 {
		log.Println(" ไม่มีเด็กที่ต้องแจ้งเตือนในวันนี้")
		return
	}

	log.Printf("🚀 พบ %d การแจ้งเตือน กำลังดำเนินการ...", len(jobs))
	worker.RunWorkerPool(jobs)
	log.Println("✅ การแจ้งเตือนเสร็จสิ้น")
}

// @Summary ดึงการแจ้งเตือนทั้งหมดของผู้ใช้ตาม ID
// @Description ดึงการแจ้งเตือนทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ (ผู้ใช้ต้องเป็นเจ้าของการแจ้งเตือนเหล่านี้)
// @Tags Notification
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /notification/get [get]
func GetNotifyByUserID(c *gin.Context) {
	// ดึง userId จาก cookies
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

	userId := userClaims.UserId

	objectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ผู้ใช้ไม่ถูกต้อง"})
		return
	}
	var notifications []notificationModel.Notification
	focus, err := notificationCollection.Find(context.TODO(), notificationModel.Notification{UserId: objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถดึงการแจ้งเตือนได้"})
		return
	}
	defer focus.Close(context.TODO())

	for focus.Next(context.TODO()) {
		var notofication notificationModel.Notification
		if err := focus.Decode(&notofication); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถแปลงการแจ้งเตือนได้"})
			return
		}
		notifications = append(notifications, notofication)
	}
	if len(notifications) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบการแจ้งเตือน"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":       "ดึงการแจ้งเตือนสำเร็จ",
		"notifications": notifications,
	})
}

// @Summary ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้วตาม ID
// @Description ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้วตาม ID ของการแจ้งเตือน (ผู้ใช้ต้องเป็นเจ้าของการแจ้งเตือนนี้)
// @Tags Notification
// @Produce json
// @Param id path string true "ObjectID ของการแจ้งเตือน"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /notification/read/{id} [put]
func MarkNotificationAsRead(c *gin.Context) {
	// ดึง userId จาก cookies
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

	userObjectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "userId ไม่ถูกต้อง"})
		return
	}

	notifyId := c.Param("id")
	notifyObjectId, err := primitive.ObjectIDFromHex(notifyId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var existingNotify notificationModel.Notification
	err = notificationCollection.FindOne(context.TODO(), bson.M{"_id": notifyObjectId, "userId": userObjectID}).Decode(&existingNotify)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบการแจ้งเตือนที่ตรงกับ ID ที่ระบุ"})
		return
	}
	if existingNotify.IsRead {
		c.JSON(http.StatusOK, gin.H{"message": "การแจ้งเตือนนี้ถูกอ่านแล้ว"})
		return
	}
	// ตรวจสอบว่า userId ตรงกับการแจ้งเตือนหรือไม่
	if existingNotify.UserId.Hex() != userId {
		c.JSON(http.StatusForbidden, gin.H{"message": "ไม่ได้รับอนุญาต - คุณไม่สามารถเปลี่ยนสถานะการอ่านของการแจ้งเตือนนี้ได้"})
		return
	}

	// อัปเดตสถานะการอ่าน
	update := bson.M{"isRead": true}
	_, err = notificationCollection.UpdateOne(context.TODO(), bson.M{"_id": notifyObjectId}, bson.M{"$set": update})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถเปลี่ยนสถานะการอ่านได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตสถานะการอ่านสำเร็จ",
	})
}

// @Summary ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
// @Description ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว (สำหรับผู้ใช้ที่ล็อกอินอยู่)
// @Tags Notification
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /notification/read-all [put]
func MarkReadAllNotifications(c *gin.Context) {
	// ดึง userId จาก cookies
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

	userObjectID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "userId ไม่ถูกต้อง"})
		return
	}
	// อัปเดตสถานะการอ่านทั้งหมด
	_, err = notificationCollection.UpdateMany(context.TODO(), bson.M{"userId": userObjectID}, bson.M{"$set": bson.M{"isRead": true}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ระบบขัดข้อง - ไม่สามารถเปลี่ยนสถานะการอ่านได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตสถานะการอ่านทั้งหมดสำเร็จ"})
}
