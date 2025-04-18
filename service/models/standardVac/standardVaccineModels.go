package standardVaccineModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type StandardVaccine struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	VaccineName string             `bson:"vaccineName,omitempty" json:"vaccineName"`
	AgeRange    int                `bson:"ageRange,omitempty" json:"ageRange"`
	Note        string             `bson:"note,omitempty" json:"note"`
}
