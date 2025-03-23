package childrenController

import (
	"os"

	"go.mongodb.org/mongo-driver/mongo"
)

var childrenCollection *mongo.Collection

// SetUserCollection ตั้งค่า userCollection
func SetChildrenCollection(client *mongo.Client) {
	dbName := os.Getenv("DBNAME")
	childrenCollection = client.Database(dbName).Collection("children")
}
