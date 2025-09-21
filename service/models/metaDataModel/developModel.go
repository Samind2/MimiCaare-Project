package metadataModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type MetaDevelop struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Category string             `bson:"category,omitempty" json:"category"`
	Detail   string             `bson:"detail,omitempty" json:"detail"`
	Image    string             `bson:"image,omitempty" json:"image"`
	Note     string             `bson:"note,omitempty" json:"note"`
}
