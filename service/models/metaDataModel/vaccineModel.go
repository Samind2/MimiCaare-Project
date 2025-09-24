package metadataModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type MetaVaccine struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	VaccineName string             `bson:"vaccineName,omitempty" json:"vaccineName"`
	Note        string             `bson:"note,omitempty" json:"note"`
}
