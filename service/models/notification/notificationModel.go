package notificationModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type Notification struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserId    primitive.ObjectID `bson:"userId,omitempty" json:"userId"`
	ChildId   primitive.ObjectID `bson:"childId,omitempty" json:"childId"`
	Title     string             `bson:"title,omitempty" json:"title"`         // หัวข้อการแจ้งเตือน
	ChildName string             `bson:"childName,omitempty" json:"childName"` // ชื่อเด็ก
	AgeRange  int                `bson:"ageRange,omitempty" json:"ageRange"`
	Type      string             `bson:"type,omitempty" json:"type"`
	IsRead    bool               `bson:"isRead,omitempty" json:"isRead"` // สถานะการอ่าน
}
