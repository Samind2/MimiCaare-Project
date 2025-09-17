import React from "react";
import { FaCalendarAlt, FaMapPin } from "react-icons/fa";

const VaccineTimeline = ({
  vaccines = [],            // ข้อมูลรายการstandard vaccinesทั้งหมด
  receivedVaccines = [],    // ข้อมูลวัคซีนที่เด็กได้รับจริง
  onSelectVaccine,          // ฟังก์ชันเรียกเมื่อกดปุ่มบันทึก/แก้ไขวัคซีน
  isCustom = false,         // เช็คว่าเป็นรายการวัคซีนที่ผู้ใช้เพิ่มเองหรือไม่
  onDeleteVaccine,          // ฟังก์ชันลบวัคซีน 
}) => {

  // ตรวจสอบว่าวัคซีนตัวนี้ได้รับแล้วหรือยัง
  const hasReceived = (vaccineId) =>
    receivedVaccines?.some((v) => v.standardVaccineId === vaccineId);

  // กรณีไม่มีข้อมูลวัคซีน
  if (!vaccines.length) return <p>ไม่มีข้อมูลวัคซีน</p>;

  return (
    <div className="relative border-l-4 border-gray-300 ml-6">
      {vaccines.map((vaccineItem, index) => {
        // แปลงอายุวัคซีนจากเดือนเป็นปี ถ้าอายุมากกว่าหรือเท่า 12 เดือน
        const ageText =
          vaccineItem?.ageRange >= 12
            ? `${vaccineItem.ageRange / 12} ปี`
            : `${vaccineItem?.ageRange} เดือน`;

        // ตรวจสอบว่าวัคซีนนี้ได้รับแล้วหรือยัง
        const received = isCustom ? true : hasReceived(vaccineItem?.id);

        // กำหนดรายการเข็มวัคซีน
        const doseRecords = isCustom ? vaccineItem.records || [] : vaccineItem.vaccines || [];

        // กำหนดข้อมูลวันที่และสถานที่รับวัคซีนของเข็มนั้น ๆ
        const receivedDoseRecords = isCustom
          ? doseRecords
          : receivedVaccines?.filter((v) => v.standardVaccineId === vaccineItem?.id) || [];

        return (
          <div key={vaccineItem?.id || index} className="mb-10 ml-6 relative">

            {/* จุดแสดงสถานะรับวัคซีน */}
            <span
              className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 ${received ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100"
                }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${received ? "bg-green-500" : "bg-red-500"
                  }`}
              />
            </span>

            {/* Card แสดงรายละเอียดวัคซีน */}
            <div className={`p-5 rounded-2xl shadow-md ${received ? "bg-green-50" : "bg-red-50"}`}>

              {/* แถวอายุและสถานะรับวัคซีน */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{ageText}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${received ? "bg-green-600" : "bg-red-600"
                    }`}
                >
                  {received ? "รับแล้ว" : "ยังไม่ได้รับ"}
                </span>
              </div>

              {/* รายการวข้อมูลของ วัคซีนแต่ละเข็ม */}
              <ul className="space-y-2 text-gray-700">
                {doseRecords.map((dose, i) => {
                  const vaccineName = dose.vaccineName || dose.name || "ไม่ระบุชื่อวัคซีน";
                  const receiveDate = isCustom ? vaccineItem.receiveDate : receivedDoseRecords[i]?.receiveDate;
                  const placeName = isCustom ? vaccineItem.placeName : receivedDoseRecords[i]?.placeName;

                  return (
                    <li key={i} className="flex justify-between items-center border-b border-gray-200 pb-1">

                      {/* ข้อมูลวัคซีน ชื่อ วันที่ และสถานที่ */}
                      <div>
                        <span>{vaccineName}</span>
                        {(receiveDate || placeName) && (
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            {receiveDate && (
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt />
                                {new Date(receiveDate).toLocaleDateString("th-TH")}
                              </div>
                            )}
                            {placeName && (
                              <div className="flex items-center gap-1">
                                <FaMapPin />
                                {placeName}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ปุ่มจัดการวัคซีน */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">
                          เข็ม {i + 1} / {doseRecords.length}
                        </span>

                        {isCustom ? (
                          <div className="flex gap-1">
                            <button onClick={() => onSelectVaccine(vaccineItem)} className="btn btn-xs btn-warning">
                              แก้ไข
                            </button>
                            {onDeleteVaccine && (
                              <button onClick={() => onDeleteVaccine(vaccineItem.id)} className="btn btn-xs btn-error">
                                ลบ
                              </button>
                            )}
                          </div>
                        ) : !receivedDoseRecords[i] ? (   // ✅ แก้จาก !dose เป็น !receivedDoseRecords[i]
                          <button onClick={() => onSelectVaccine(vaccineItem)} className="btn btn-xs btn-primary">
                            บันทึก
                          </button>
                        ) : (
                          <button onClick={() => onSelectVaccine(vaccineItem, true)} className="btn btn-xs btn-warning">
                            แก้ไข
                          </button>
                        )}

                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VaccineTimeline;
