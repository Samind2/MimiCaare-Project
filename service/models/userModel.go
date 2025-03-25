package userModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName string             `bson:"firstName,omitempty" json:"firstName"`
	LastName  string             `bson:"lastName,omitempty" json:"lastName"`
	Email     string             `bson:"email,omitempty" json:"email"`
	Role      string             `bson:"role,omitempty" json:"role"`
	Password  string             `bson:"password,omitempty" json:"password"`
}
