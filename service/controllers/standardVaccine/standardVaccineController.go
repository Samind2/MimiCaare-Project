package standardVaccineControllers

import (
	"os"

	"go.mongodb.org/mongo-driver/mongo"
)

var standardVaccineCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetStandardVaccineCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME") // ดึงค่าชื่อฐานข้อมูลจาก .env
	standardVaccineCollection = client.Database(dbName).Collection("standardVaccine")
}
