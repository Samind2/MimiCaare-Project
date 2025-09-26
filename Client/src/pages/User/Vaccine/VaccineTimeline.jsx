import React from "react";
import { FaCalendarAlt, FaMapPin, FaPhoneAlt } from "react-icons/fa";


const VaccineTimeline = ({
  vaccines = [],            // ข้อมูลรายการ standard vaccines ทั้งหมด
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
        // แปลงอายุวัคซีนจากเดือนเป็นปี
        const ageText = (() => {
          const age = vaccineItem?.ageRange;
          if (age == null) return "-";
          if (age === 0) return "แรกเกิด";

          const years = Math.floor(age / 12);
          const months = age % 12;

          if (years > 0 && months > 0) return `${years} ปี ${months} เดือน`;
          if (years > 0) return `${years} ปี`;
          return `${months} เดือน`;
        })();


        const received = isCustom ? true : hasReceived(vaccineItem?.id);

        // ข้อมูลเข็มวัคซีน
        const doseRecords = isCustom
          ? vaccineItem.records || []
          : vaccineItem.vaccines || [];

        // ข้อมูลการได้รับจริง
        const receivedDoseRecords = isCustom
          ? doseRecords
          : receivedVaccines?.filter((v) => v.standardVaccineId === vaccineItem?.id) || [];

        return (
          <div key={vaccineItem?.id || index} className="mb-10 ml-6 relative">
            {/* จุดสถานะ */}
            <span
              className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 ${received ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100"
                }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${received ? "bg-green-500" : "bg-red-500"
                  }`}
              />
            </span>

            {/* Card */}
            <div className={`p-5 rounded-2xl shadow-md ${received ? "bg-green-50" : "bg-red-50"}`}>
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{ageText}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${received ? "bg-green-600" : "bg-red-600"
                    }`}
                >
                  {received ? "รับแล้ว" : "ยังไม่ได้รับ"}
                </span>
              </div>

              {/* วัคซีนในช่วงอายุนี้ */}
              <ul className="space-y-3 text-gray-700">
                {doseRecords.map((dose, i) => {
                  const vaccineName = dose.vaccineName || dose.name || "ไม่ระบุชื่อวัคซีน";

                  // หา record ที่ได้รับจริงของเข็มนี้
                  const receivedDose = receivedDoseRecords.find(
                    (r) => r.vaccineName === vaccineName || r.doseId === dose.id
                  );

                  const receiveDate = isCustom
                    ? vaccineItem.receiveDate
                    : receivedDose?.receiveDate;

                  const placeName = isCustom
                    ? vaccineItem.placeName
                    : receivedDose?.placeName;

                  const phoneNumber = receivedDose?.phoneNumber || dose.phoneNumber;

                  return (
                    <li key={i} className="flex flex-col border-b border-gray-200 pb-2">
                      {/* ชื่อวัคซีน + เข็ม */}
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{vaccineName}</span>
                        <span className="text-gray-400 text-xs">
                          เข็ม {i + 1} / {doseRecords.length}
                        </span>
                      </div>

                      {/* ข้อมูลรายละเอียด */}
                      {(receiveDate || placeName || phoneNumber) && (
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
                          {phoneNumber && (
                            <div className="flex items-center gap-1">
                              <FaPhoneAlt />
                              {phoneNumber}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-end mt-3">
                {isCustom ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectVaccine(vaccineItem)}
                      className="btn btn-sm btn-warning"
                    >
                      แก้ไข
                    </button>
                    {onDeleteVaccine && (
                      <button
                        onClick={() => onDeleteVaccine(vaccineItem.id)}
                        className="btn btn-sm btn-error"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                ) : receivedDoseRecords.length === 0 ? (
                  // ถ้าไม่มีเข็มที่ได้รับให้แสดงปุ่มบันทึก
                  <button
                    onClick={() => onSelectVaccine(vaccineItem)}
                    className="btn btn-sm btn-primary"
                  >
                    บันทึก
                  </button>
                ) : (
                  // ถ้ามีเข็มที่ได้รับแล้วขึ้นปุ่มแก้ไข
                  <button
                    onClick={() => onSelectVaccine(vaccineItem, true)}
                    className="btn btn-sm btn-warning"
                  >
                    แก้ไข
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VaccineTimeline;
