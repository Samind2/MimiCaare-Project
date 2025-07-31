package notificationModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type Notification struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserId   primitive.ObjectID `bson:"userId,omitempty" json:"userId"`
	ChildId  primitive.ObjectID `bson:"childId,omitempty" json:"childId"`
	AgeRange int                `bson:"ageRange,omitempty" json:"ageRange"`
	Type     string             `bson:"type,omitempty" json:"type"`
	Title    string             `bson:"title,omitempty" json:"title"`     // หัวข้อการแจ้งเตือน
	Message  string             `bson:"message,omitempty" json:"message"` // ข้อความการแจ้งเตือน
	IsRead   bool               `bson:"isRead,omitempty" json:"isRead"`   // สถานะการอ่าน
}
