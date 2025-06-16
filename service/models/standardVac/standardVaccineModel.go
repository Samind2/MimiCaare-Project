package standardVaccineModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type StandardVaccine struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AgeRange int                `bson:"ageRange,omitempty" json:"ageRange"`
	Vaccines []VaccineItem      `bson:"vaccines,omitempty" json:"vaccines"`
}

type VaccineItem struct {
	VaccineName string `bson:"vaccineName,omitempty" json:"vaccineName"`
	Note        string `bson:"note,omitempty" json:"note"`
}
