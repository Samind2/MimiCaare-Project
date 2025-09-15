package metadataModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type MetaDevelop struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Category string             `json:"category" binding:"required"`
	Develop  []DevelopItem      `bson:"develop" json:"develop"`
}
type DevelopItem struct {
	Detail string `json:"detail" binding:"required"`
	Image  string `json:"image" binding:"required"`
	Note   string `json:"note" binding:"required"`
}
