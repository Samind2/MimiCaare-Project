package controllers

import (
	childrenControllers "github.com/Samind2/MimiCaare-Project/service/controllers/children"
	receiveDevelopControllers "github.com/Samind2/MimiCaare-Project/service/controllers/receiveDevelop"
	receiveVaccineControllers "github.com/Samind2/MimiCaare-Project/service/controllers/receiveVaccine"
	standardDevelopControllers "github.com/Samind2/MimiCaare-Project/service/controllers/standardDevelop"
	standardVaccineControllers "github.com/Samind2/MimiCaare-Project/service/controllers/standardVaccine"
	userControllers "github.com/Samind2/MimiCaare-Project/service/controllers/user"
	middlewares "github.com/Samind2/MimiCaare-Project/service/middlewares"
	"go.mongodb.org/mongo-driver/mongo"
)

// เรียกใช้การตั้งค่า Collection
func CollectionControllers(client *mongo.Client) {
	userControllers.SetUserCollection(client)
	childrenControllers.SetChildrenCollection(client)
	standardVaccineControllers.SetStandardVaccineCollection(client)
	standardDevelopControllers.SetStandardDevelopCollection(client)
	receiveVaccineControllers.SetReceiveVaccineCollection(client)
	receiveVaccineControllers.SetStandardVaccineReference(client)
	receiveDevelopControllers.SetReceiveDevelopCollection(client)
	receiveDevelopControllers.SetStandardDevelopReference(client)
	middlewares.SetUserCollectionForMiddleware(client)
}
