package estimateDevelopModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type EstimateDevelop struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	ChildID      primitive.ObjectID   `bson:"childId,omitempty" json:"childId"`
	AgeRange     int                  `bson:"ageRange,omitempty" json:"ageRange"`
	Developments []DevelopmentResults `bson:"Estimates,omitempty" json:"Estimates"`
}

type DevelopmentResults struct {
	CriteriaID primitive.ObjectID `bson:"criteriaId,omitempty" json:"criteriaId"` // เชื่อมไปที่ criteriaDevelop
	Status     bool               `bson:"status" json:"status"`
	Category   string             `bson:"category,omitempty" json:"category"`
	Detail     string             `bson:"detail,omitempty" json:"detail"`
	Image      string             `bson:"image,omitempty" json:"image"`
	Note       string             `bson:"note,omitempty" json:"note"`
}
