package receiveDevelopModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type ReceiveDevelop struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	ChildID      primitive.ObjectID   `bson:"childId,omitempty" json:"childId"`
	AgeRange     int                  `bson:"ageRange,omitempty" json:"ageRange"`
	Developments []DevelopmentResults `bson:"Estimates,omitempty" json:"Estimates"`
}

type DevelopmentResults struct {
	StandardDevID primitive.ObjectID `bson:"standardDevId,omitempty" json:"standardDevId"` // เชื่อมไปที่ standardDevelopModels
	Status        bool               `bson:"status" json:"status"`
	Category      string             `bson:"category,omitempty" json:"category"`
	Detail        string             `bson:"detail,omitempty" json:"detail"`
	Image         string             `bson:"image,omitempty" json:"image"`
	Note          string             `bson:"note,omitempty" json:"note"`
}
