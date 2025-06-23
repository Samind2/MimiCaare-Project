package receiveVaccineModel

import "go.mongodb.org/mongo-driver/bson/primitive"

type ReceiveVaccine struct {
	ID                primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	ChildID           primitive.ObjectID   `bson:"childId,omitempty" json:"childId"`
	ReceiveDate       primitive.DateTime   `bson:"receiveDate,omitempty" json:"receiveDate"`
	PlaceName         string               `bson:"placeName,omitempty" json:"placeName"`
	PhoneNumber       string               `bson:"phoneNumber,omitempty" json:"phoneNumber"`
	StandardVaccineID primitive.ObjectID   `bson:"standardVaccineId" json:"standardVaccineId"` // เชื่อมไปที่ standardVaccineModels
	AgeRange          int                  `bson:"ageRange,omitempty" json:"ageRange"`
	Records           []VaccineReceiveItem `bson:"records,omitempty" json:"records"` // รายการวัคซีนที่รับ
}

type VaccineReceiveItem struct {
	VaccineName string `bson:"vaccineName,omitempty" json:"vaccineName"`
	Note        string `bson:"note,omitempty" json:"note"`
}
