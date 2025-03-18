package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Client เป็นตัวแปรที่ใช้เก็บการเชื่อมต่อ MongoDB
var Client *mongo.Client

// ConnectDB เชื่อมต่อกับ MongoDB
func ConnectDB() {

	// URL ของฐานข้อมูล MongoDB
	dbURL := os.Getenv("DBURL")

	ct, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	Client, err = mongo.Connect(ct, options.Client().ApplyURI(dbURL))
	if err != nil {
		log.Fatal(err)
	}

	err = Client.Ping(ct, nil)
	if err != nil {
		log.Fatal("❌ ไม่สามารถเชื่อมต่อกับ MongoDB", err)
	} else {
		fmt.Println("✅ เชื่อมต่อกับ MongoDB สำเร็จ!")
	}
}
