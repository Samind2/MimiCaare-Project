package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectDB เชื่อมต่อกับ MongoDB
func ConnectDB() (*mongo.Client, error) {
	dbURL := os.Getenv("DBURL")
	ct, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ct, options.Client().ApplyURI(dbURL))
	if err != nil {
		return nil, fmt.Errorf("❌ ไม่สามารถเชื่อมต่อกับ MongoDB: %v", err)
	}

	err = client.Ping(ct, nil)
	if err != nil {
		return nil, fmt.Errorf("❌ ไม่สามารถ Ping MongoDB: %v", err)
	}

	fmt.Println("✅ เชื่อมต่อกับ MongoDB สำเร็จ!")
	return client, nil
}
