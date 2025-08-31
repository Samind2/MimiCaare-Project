import React from "react";

const VaccineTimeline = ({ vaccines, receivedVaccines }) => {
  // ตรวจสอบว่าวัคซีนถูกฉีดแล้วหรือยัง
  const isReceived = (standardVaccineId) =>
    receivedVaccines.some((rv) => rv.standardVaccineId === standardVaccineId);

  return (
    <div className="relative border-l-2 border-gray-300 ml-6">
      {vaccines.map((item, index) => {
        const ageText =
          item.ageRange >= 12 ? `${item.ageRange / 12} ปี` : `${item.ageRange} เดือน`;
        const received = isReceived(item.id);

        return (
          <div key={item.id} className="mb-8 ml-6 relative">
            {/* จุด Timeline */}
            <div className="absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-gray-500 bg-white shadow-md"></div>

            {/* Card */}
            <div
              className={`p-4 rounded-lg shadow-md ${
                received ? "bg-green-50" : "bg-red-50"
              } hover:shadow-lg transition`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{ageText}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs ${
                    received ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {received ? "รับแล้ว" : "ยังไม่ได้รับ"}
                </span>
              </div>

              <ul className="space-y-1 text-gray-700">
                {item.vaccines.map((vaccine, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{vaccine.vaccineName}</span>
                    <span className="text-gray-400 text-xs">
                      เข็ม {i + 1} / {item.vaccines.length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VaccineTimeline;
