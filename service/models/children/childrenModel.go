package childrenModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type Children struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ParentID  primitive.ObjectID `bson:"parentId,omitempty" json:"parentId"`
	FirstName string             `bson:"firstName,omitempty" json:"firstName"`
	LastName  string             `bson:"lastName,omitempty" json:"lastName"`
	BirthDate primitive.DateTime `bson:"birthDate,omitempty" json:"birthDate"`
	Gender    string             `bson:"gender,omitempty" json:"gender"`
	Image     string             `bson:"image,omitempty" json:"image"`
}
