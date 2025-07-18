package standardDevelopModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type StandardDevelop struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	AgeRange     int                `bson:"ageRange,omitempty" json:"ageRange"`
	Developments []DevelopmentItem  `bson:"developments" json:"developments"`
}

type DevelopmentItem struct {
	Category string `bson:"category,omitempty" json:"category"`
	Detail   string `bson:"detail,omitempty" json:"detail"`
	Image    string `bson:"image,omitempty" json:"image"`
	Note     string `bson:"note,omitempty" json:"note"`
}
