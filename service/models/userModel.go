package userModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName string             `bson:"firstName,omitempty"`
	LastName  string             `bson:"lastName,omitempty"`
	Email     string             `bson:"email,omitempty"`
	Password  int                `bson:"password,omitempty"`
}
