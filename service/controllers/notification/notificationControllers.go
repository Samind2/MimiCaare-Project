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
	})

	s.StartAsync()
}

func RunNotificationJob7Day() {
	children := fetchChildren()
	jobs := []func(){}

	for _, child := range children {
		childCopy := child
		vaccines := fetchStandardVaccines()
		develops := fetchStandardDevelopments()

		// ตรวจอายุของเด็ก
		for _, vaccine := range vaccines {
			expectedDate := child.BirthDate.Time().AddDate(0, vaccine.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 7 {
				filter := bson.M{
					"childId":  childCopy.ID,
					"type":     "vaccine",
					"ageRange": vaccine.AgeRange,
				}
				exists, _ := notificationCollection.CountDocuments(context.TODO(), filter)

				if exists == 0 {
					// เก็บรายการวัคซีนเป็น Array JSON
					var vaccineArray []bson.M
					for _, item := range vaccine.Vaccines {
						vaccineArray = append(vaccineArray, bson.M{
							"vaccineName": item.VaccineName,
							"note":        item.Note,
						})
					}

					jobs = append(jobs, func() {
						log.Printf("แจ้งเตือนวัคซีน (อายุ %d เดือน) ให้ผู้ปกครองของ %s\n",
							vaccine.AgeRange, childCopy.FirstName)
					})

					_, _ = notificationCollection.InsertOne(context.Background(), bson.M{
						"userId":   childCopy.ParentID,
						"childId":  childCopy.ID,
						"type":     "vaccine",
						"ageRange": vaccine.AgeRange,
						"title":    fmt.Sprintf("แจ้งเตือน อีก 7 วัน มีวัคซีนที่ต้องเข้ารับในช่วงอายุ %d เดือน", vaccine.AgeRange),
						"message":  vaccineArray, // เก็บเป็น Array JSON
						"date":     time.Now(),
						"isRead":   false, // สถานะการอ่านเริ่มต้นเป็น false
					})
				}
			}

		}

		for _, dev := range develops {
			expectedDate := child.BirthDate.Time().AddDate(0, dev.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 7 {
				filter := bson.M{
					"childId":  childCopy.ID,
					"type":     "development",
					"ageRange": dev.AgeRange,
				}

				exists, _ := notificationCollection.CountDocuments(context.TODO(), filter)

				if exists == 0 {
					// ✅ เก็บรายการพัฒนาการเป็น Array JSON
					var devArray []bson.M
					for _, item := range dev.Developments {
						devArray = append(devArray, bson.M{
							"category": item.Category,
							"detail":   item.Detail,
							"note":     item.Note,
						})
					}

					jobs = append(jobs, func() {
						log.Printf("แจ้งเตือนพัฒนาการ (อายุ %d เดือน) ให้ผู้ปกครองของ %s\n",
							dev.AgeRange, childCopy.FirstName)
					})

					_, _ = notificationCollection.InsertOne(context.Background(), bson.M{
						"userId":   childCopy.ParentID,
						"childId":  childCopy.ID,
						"type":     "development",
						"ageRange": dev.AgeRange,
						"title":    fmt.Sprintf("แจ้งเตือน อีก 7 วัน มีพัฒนาการที่ต้องประเมินในช่วงอายุ %d เดือน", dev.AgeRange),
						"message":  devArray, // ✅ เก็บเป็น Array JSON
						"date":     time.Now(),
						"isRead":   false, // สถานะการอ่านเริ่มต้นเป็น false
					})
				}
			}

		}
	}

	if len(jobs) == 0 {
		log.Println("ไม่มีเด็กที่ต้องแจ้งเตือนในช่วง 7")
		return
	}

	log.Printf("พบ %d การแจ้งเตือน กำลังดำเนินการ...\n", len(jobs))
	worker.RunWorkerPool(jobs)
	log.Println("✅ การแจ้งเตือนเสร็จสิ้น")
}

func RunNotificationJob3Day() {
	children := fetchChildren()
	jobs := []func(){}

	for _, child := range children {
		childCopy := child
		vaccines := fetchStandardVaccines()
		develops := fetchStandardDevelopments()

		// ตรวจอายุของเด็ก
		for _, vaccine := range vaccines {
			expectedDate := child.BirthDate.Time().AddDate(0, vaccine.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 3 {
				filter := bson.M{
					"childId":  childCopy.ID,
					"type":     "vaccine",
					"ageRange": vaccine.AgeRange,
				}

				exists, _ := notificationCollection.CountDocuments(context.TODO(), filter)

				if exists == 0 {
					// เก็บรายการวัคซีนเป็น Array JSON
					var vaccineArray []bson.M
					for _, item := range vaccine.Vaccines {
						vaccineArray = append(vaccineArray, bson.M{
							"vaccineName": item.VaccineName,
							"note":        item.Note,
						})
					}

					jobs = append(jobs, func() {
						log.Printf("แจ้งเตือนวัคซีน (อายุ %d เดือน) ให้ผู้ปกครองของ %s\n",
							vaccine.AgeRange, childCopy.FirstName)
					})

					_, _ = notificationCollection.InsertOne(context.Background(), bson.M{
						"userId":   childCopy.ParentID,
						"childId":  childCopy.ID,
						"type":     "vaccine",
						"ageRange": vaccine.AgeRange,
						"title":    fmt.Sprintf("แจ้งเตือน อีก 3 วัน มีวัคซีนที่ต้องเข้ารับในช่วงอายุ %d เดือน", vaccine.AgeRange),
						"message":  vaccineArray, // เก็บเป็น Array JSON
						"date":     time.Now(),
						"isRead":   false, // สถานะการอ่านเริ่มต้นเป็น false
					})
				}
			}

		}

		for _, dev := range develops {
			expectedDate := child.BirthDate.Time().AddDate(0, dev.AgeRange, 0)
			daysUntil := int(time.Until(expectedDate).Hours() / 24)

			if daysUntil == 3 {
				filter := bson.M{
					"childId":  childCopy.ID,
					"type":     "development",
					"ageRange": dev.AgeRange,
				}

				exists, _ := notificationCollection.CountDocuments(context.TODO(), filter)

				if exists == 0 {
					// ✅ เก็บรายการพัฒนาการเป็น Array JSON
					var devArray []bson.M
					for _, item := range dev.Developments {
						devArray = append(devArray, bson.M{
							"category": item.Category,
							"detail":   item.Detail,
							"note":     item.Note,
						})
					}

					jobs = append(jobs, func() {
						log.Printf("แจ้งเตือนพัฒนาการ (อายุ %d เดือน) ให้ผู้ปกครองของ %s\n",
							dev.AgeRange, childCopy.FirstName)
					})

					_, _ = notificationCollection.InsertOne(context.Background(), bson.M{
						"userId":   childCopy.ParentID,
						"childId":  childCopy.ID,
						"type":     "development",
						"ageRange": dev.AgeRange,
						"title":    fmt.Sprintf("แจ้งเตือน อีก 3 วัน มีพัฒนาการที่ต้องประเมินในช่วงอายุ %d เดือน", dev.AgeRange),
						"message":  devArray, // ✅ เก็บเป็น Array JSON
						"date":     time.Now(),
						"isRead":   false, // สถานะการอ่านเริ่มต้นเป็น false
					})
				}
			}

		}
	}

	if len(jobs) == 0 {
		log.Println("ไม่มีเด็กที่ต้องแจ้งเตือนในช่วง 3 ")
		return
	}

	log.Printf("พบ %d การแจ้งเตือน กำลังดำเนินการ...\n", len(jobs))
	worker.RunWorkerPool(jobs)
	log.Println("✅ การแจ้งเตือนเสร็จสิ้น")
}

func GetNotifyByUserID(c *gin.Context) {
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
	// ค้นหา notifications ตาม userId
	var notifications []notificationModel.Notification
	pointer, err := notificationCollection.Find(context.TODO(), bson.M{"userId": userId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้"})
		return
	}
	defer pointer.Close(context.TODO())

	for pointer.Next(context.TODO()) {
		var notification notificationModel.Notification
		if err := pointer.Decode(&notification); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "มีข้อผิดพลาดระหว่างแปลงข้อมูล"})
			return
		}
		notifications = append(notifications, notification)
	}
	if len(notifications) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบการแจ้งเตือน"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notifications": notifications})

}

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

	notifyId := c.Param("id")
	notifyObjectId, err := primitive.ObjectIDFromHex(notifyId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID ไม่ถูกต้อง"})
		return
	}

	var existingNotify notificationModel.Notification
	err = notificationCollection.FindOne(context.TODO(), bson.M{"_id": notifyObjectId, "userId": userId}).Decode(&existingNotify)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบการแจ้งเตือน"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "เกิดข้อผิดพลาดในการค้นหาการแจ้งเตือน"})
		}
		return
	}

	// อัปเดตสถานะการอ่าน
	_, err = notificationCollection.UpdateOne(context.TODO(), bson.M{"_id": notifyObjectId}, bson.M{"$set": bson.M{"isRead": true}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถอัปเดตสถานะการอ่านได้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":      "อัปเดตสถานะการอ่านสำเร็จ",
		"notification": existingNotify,
	})
}
