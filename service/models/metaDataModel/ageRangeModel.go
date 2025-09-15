package metadataModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type MetaAgeRange struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	AgeRange int                `bson:"ageRange,omitempty" json:"ageRange"`
}
