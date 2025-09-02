import React from "react";

const VaccineTimeline = ({ vaccines = [], receivedVaccines = [], onSelectVaccine }) => {
    const isReceived = (standardVaccineId) =>
        receivedVaccines?.some((rv) => rv.standardVaccineId === standardVaccineId);

    if (!Array.isArray(vaccines) || vaccines.length === 0) {
        return <p className="text-gray-500">ไม่มีข้อมูลวัคซีน</p>;
    }

    return (
        <div className="relative border-l-4 border-gray-300 ml-6">
            {vaccines.map((item, index) => {
                const ageText =
                    item?.ageRange >= 12 ? `${item.ageRange / 12} ปี` : `${item?.ageRange} เดือน`;
                const received = isReceived(item?.id);

                return (
                    <div key={item?.id || index} className="mb-10 ml-6 relative">
                        {/* จุด Timeline */}
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
                        <div
                            className={`p-5 rounded-2xl shadow-md ${received ? "bg-green-50" : "bg-red-50"
                                }`}
                        >
                            {/* หัวข้อ */}
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-lg">{ageText}</h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${received ? "bg-green-600" : "bg-red-600"
                                        }`}
                                >
                                    {received ? "รับแล้ว" : "ยังไม่ได้รับ"}
                                </span>
                            </div>

                            {/* รายการวัคซีน */}
                            <ul className="space-y-2 text-gray-700">
                                {(item?.vaccines || []).map((vaccine, i) => (
                                    <li
                                        key={i}
                                        className="flex justify-between items-center border-b border-gray-200 pb-1"
                                    >
                                        <span>{vaccine?.vaccineName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs">
                                                เข็ม {i + 1} / {(item?.vaccines || []).length}
                                            </span>
                                            {!received && (
                                                <button
                                                    onClick={() => onSelectVaccine(item)} // 👉 เรียกไปเปิด Modal
                                                    className="btn btn-xs btn-primary"
                                                >
                                                    บันทึก
                                                </button>
                                            )}
                                        </div>
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
