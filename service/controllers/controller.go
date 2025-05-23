package controllers

import (
	childrenController "github.com/Samind2/MimiCaare-Project/service/controllers/children"
	userController "github.com/Samind2/MimiCaare-Project/service/controllers/user"

	"go.mongodb.org/mongo-driver/mongo"
)

// เรียกใช้การตั้งค่า Collection
func CollectionControllers(client *mongo.Client) {
	userController.SetUserCollection(client)
	childrenController.SetChildrenCollection(client)
}
