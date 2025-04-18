package receiveVaccineModels

import "go.mongodb.org/mongo-driver/bson/primitive"

type ReceiveVaccine struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	ChildID     primitive.ObjectID   `bson:"childId,omitempty" json:"childId"`
	Note        string               `bson:"note,omitempty" json:"note"`
	ReceiveDate primitive.DateTime   `bson:"receiveDate,omitempty" json:"receiveDate"`
	PlaceName   string               `bson:"placeName,omitempty" json:"placeName"`
	PhoneNumber string               `bson:"phoneNumber,omitempty" json:"phoneNumber"`
	Records     []VaccineReceiveItem `bson:"records,omitempty" json:"records"` // รายการวัคซีนที่รับ
}

type VaccineReceiveItem struct {
	StandardID  primitive.ObjectID `bson:"standardId,omitempty" json:"standardId"` // เชื่อมไปที่ StandardVaccine
	VaccineName string             `bson:"vaccineName,omitempty" json:"vaccineName"`
}
