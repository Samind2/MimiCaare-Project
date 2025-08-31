import React, { useEffect, useState } from "react";
import vaccineService from "../../../service/standardVaccine.service";
import receiveVaccineService from "../../../service/receiveVac.service";
import childService from "../../../service/child.service";
import { toast } from "react-toastify";
import { FaPlus } from 'react-icons/fa';
import { FaChevronDown } from "react-icons/fa";

const ViewVac = () => {
  //  STATE 
  const [vaccines, setVaccines] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [receivedVaccines, setReceivedVaccines] = useState([]);
  const [customVaccines, setCustomVaccines] = useState([]);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  // เพิ่ม state สำหรับควบคุม step
  const [currentStep, setCurrentStep] = useState(1);


  // Modal สำหรับวัคซีนมาตรฐาน
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formData, setFormData] = useState({
    ageRange: null,
    standardVaccineId: null,
    receiveDate: "",
    placeName: "",
    phoneNumber: "",
  });
  const [selectedVaccines, setSelectedVaccines] = useState([]);

  // ฟังก์ชันไปขั้นถัดไป
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  // ฟังก์ชันย้อนกลับ
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Modal สำหรับวัคซีนที่ผู้ใช้กรอกเอง (custom)
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFormData, setCustomFormData] = useState({
    receiveDate: new Date().toISOString().substring(0, 10),
    placeName: "",
    phoneNumber: "",
  });
  const [customRecords, setCustomRecords] = useState([{ vaccineName: "", note: "" }]);
  const vaccineOptions = [
    { label: "วัคซีนตามมาตรฐาน", value: false },
    { label: "วัคซีนเพิ่มเติม", value: true },
  ];

  const filteredOptions = vaccineOptions.filter(option => option.value !== showCustomOnly);
  //  ฟังก์ชันเปิด Modal มาตรฐาน 
  const openModal = (item, isEdit = false) => {
    if (isEdit) {
      const record = receivedVaccines.find((rv) => rv.standardVaccineId === item.id);

      if (!record) {
        toast.warning("ไม่พบข้อมูลวัคซีนที่ต้องการแก้ไข");
        return;
      }

      setFormData({
        ageRange: item.ageRange,
        standardVaccineId: item.id,
        receiveDate:
          record.receiveDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        placeName: record.placeName || "",
        phoneNumber: record.phoneNumber || "",
      });

      setEditingRecordId(record.id || null);
      setIsEditMode(true);
    } else {
      setFormData({
        ageRange: item.ageRange,
        standardVaccineId: item.id,
        receiveDate: new Date().toISOString().substring(0, 10),
        placeName: "",
        phoneNumber: "",
      });

      setEditingRecordId(null);
      setIsEditMode(false);
    }

    setSelectedVaccines(item.vaccines);
    setShowModal(true);
  };

  //  ฟังก์ชันเปิด Modal กรอกเอง (custom) 
  const openCustomModal = () => {
    setCustomFormData({
      receiveDate: new Date().toISOString().substring(0, 10),
      placeName: "",
      phoneNumber: "",
    });
    setCustomRecords([{ vaccineName: "", note: "" }]);
    setShowCustomModal(true);
  };

  //  โหลดข้อมูลต่าง ๆ 
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccineService.getvaccine();
        setVaccines(res.data.vaccines || []);
      } catch (err) {
        console.error("Error fetching vaccines", err);
      }
    };

    const fetchChildren = async () => {
      try {
        const res = await childService.getChildren();
        const data = res.data.children || res.data || [];
        setChildren(data);

        if (data.length > 0) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error("Error fetching children", err);
      }
    };

    fetchVaccines();
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchReceivedVaccines = async () => {
      if (!selectedChild) return;

      try {
        const res = await receiveVaccineService.getByChildId(selectedChild.id);
        const receivedData = Array.isArray(res.data.vaccines) ? res.data.vaccines : [];
        const customData = receivedData.filter(
          (v) => v.standardVaccineId === "000000000000000000000000" && Array.isArray(v.records)
        );

        const standardData = receivedData.filter(
          (v) => v.standardVaccineId !== "000000000000000000000000"
        );

        setReceivedVaccines(standardData);
        setCustomVaccines(customData);
      } catch (error) {
        console.error("Error fetching received vaccines", error);
        setReceivedVaccines([]);
        setCustomVaccines([]);
      }
    };

    fetchReceivedVaccines();
  }, [selectedChild]);

  //  ฟังก์ชันตรวจสอบวัคซีนรับแล้ว 
  const isVaccineReceived = (standardVaccineId) => {
    return receivedVaccines.some((rv) => rv.standardVaccineId === standardVaccineId);
  };

  //  ฟังก์ชันบันทึกวัคซีนมาตรฐาน 
  const handleSaveVaccine = async () => {
    if (!selectedChild?.id) {
      toast.warning("กรุณาเลือกเด็กก่อนบันทึก");
      return;
    }

    if (!formData.standardVaccineId) {
      toast.warning("ข้อมูลวัคซีนไม่ถูกต้อง");
      return;
    }

    const payload = {
      childId: selectedChild.id,
      standardVaccineId: formData.standardVaccineId,
      ageRange: formData.ageRange,
      receiveDate: new Date(formData.receiveDate).toISOString(),
      placeName: formData.placeName,
      phoneNumber: formData.phoneNumber,
    };

    try {
      if (isEditMode) {
        if (!editingRecordId) {
          toast.warning("ไม่พบข้อมูลสำหรับแก้ไขการรับวัคซีน");
          return;
        }

        await receiveVaccineService.updateById(editingRecordId, payload);
        toast.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        await receiveVaccineService.addFromStandard(payload);
        toast.success("บันทึกข้อมูลสำเร็จ");
      }

      setShowModal(false);

      const res = await receiveVaccineService.getByChildId(selectedChild.id);
      setReceivedVaccines(res.data.vaccines || []);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  //  ฟังก์ชันบันทึกวัคซีนที่ผู้ใช้กรอกเอง 
  const handleSaveCustomVaccine = async () => {
    if (!selectedChild?.id) {
      toast.warning("กรุณาเลือกเด็กก่อนบันทึก");
      return;
    }

    for (let rec of customRecords) {
      if (!rec.vaccineName.trim()) {
        toast.warning("กรุณากรอกชื่อวัคซีนให้ครบถ้วน");
        return;
      }
    }

    const payload = {
      childId: selectedChild.id,
      receiveDate: new Date(customFormData.receiveDate).toISOString(),
      placeName: customFormData.placeName,
      phoneNumber: customFormData.phoneNumber,
      records: customRecords.map(({ vaccineName, note }) => ({ vaccineName, note })),
    };

    try {
      if (isEditMode && editingRecordId) {
        await receiveVaccineService.updateById(editingRecordId, payload);
        toast.success("แก้ไขข้อมูลวัคซีนแบบกรอกเองสำเร็จ");
      } else {
        await receiveVaccineService.addCustom(payload);
        toast.success("บันทึกข้อมูลวัคซีนแบบกรอกเองสำเร็จ");
      }

      setShowCustomModal(false);
      setIsEditMode(false);
      setEditingRecordId(null);

      const res = await receiveVaccineService.getByChildId(selectedChild.id);
      const receivedData = Array.isArray(res.data.vaccines) ? res.data.vaccines : [];

      const customData = receivedData.filter(
        (v) => v.standardVaccineId === "000000000000000000000000" && Array.isArray(v.records)
      );
      const standardData = receivedData.filter(
        (v) => v.standardVaccineId !== "000000000000000000000000"
      );

      setReceivedVaccines(standardData);
      setCustomVaccines(customData);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const openEditCustomModal = (item) => {
    setCustomFormData({
      receiveDate: item.receiveDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
      placeName: item.placeName || "",
      phoneNumber: item.phoneNumber || "",
    });

    setCustomRecords(item.records || []);
    setEditingRecordId(item.id); // ใช้ id สำหรับการแก้ไข
    setIsEditMode(true);
    setShowCustomModal(true);

  };

  const handleDeleteCustomVaccine = async (id) => {
    if (!window.confirm("คุณต้องการลบข้อมูลวัคซีนนี้ใช่หรือไม่?")) return;


    try {
      await receiveVaccineService.deleteById(id);
      toast.success("ลบข้อมูลวัคซีนสำเร็จ");

      const res = await receiveVaccineService.getByChildId(selectedChild.id);
      const receivedData = Array.isArray(res.data.vaccines) ? res.data.vaccines : [];

      const customData = receivedData.filter(
        (v) => v.standardVaccineId === "000000000000000000000000" && Array.isArray(v.records)
      );
      const standardData = receivedData.filter(
        (v) => v.standardVaccineId !== "000000000000000000000000"
      );

      setReceivedVaccines(standardData);
      setCustomVaccines(customData);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่");
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-semibold mb-4">วัคซีนที่เด็กควรได้รับ</h1>

      {/* Dropdown สำหรับเลือกเด็ก */}
      <div className="flex space-x-4 mb-6">
        <div className="dropdown dropdown-hover">
          <label
            tabIndex={0}
            className="btn bg-blue-200 text-blue-800 hover:bg-blue-300 rounded-xl text-lg cursor-pointer"
          >
            {showCustomOnly ? "วัคซีนเพิ่มเติม" : "วัคซีนตามมาตรฐาน"}
            <FaChevronDown className="inline ml-2" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-3 shadow-lg bg-blue-100 rounded-xl w-56"
          >
            {filteredOptions.map((option, idx) => (
              <li key={idx}>
                <a
                  className="hover:bg-blue-300 rounded-md p-2 cursor-pointer"
                  onClick={() => setShowCustomOnly(option.value)} // เลือกวัคซีนตามมาตรฐาน
                >
                  {option.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="dropdown dropdown-hover">
          <div
            tabIndex={0}
            className="btn bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-xl text-lg w-48 text-left truncate"
          >
            <span className="truncate inline-block max-w-[85%]">
              {selectedChild
                ? `${selectedChild.firstName} ${selectedChild.lastName}`
                : "เลือกเด็ก"}
            </span>
            <FaChevronDown className="inline ml-2" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-3 shadow-lg bg-pink-50 rounded-xl w-56 max-h-60 overflow-auto"
          >
            {children
              .filter((child) => child.id !== selectedChild?.id) // กรองเด็กที่เลือกอยู่ออก
              .map((child) => (
                <li key={child._id}>
                  <a
                    className="hover:bg-pink-200 rounded-md p-2"
                    onClick={() => {
                      setSelectedChild(child);
                      setReceivedVaccines([]);
                    }}
                  >
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
          </ul>
        </div>

        {/* ปุ่มเปิด modal กรอกวัคซีนเอง */}
        {showCustomOnly && (
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded"
            onClick={openCustomModal}
          >
            <FaPlus className="inline mr-2" />
            กรอกวัคซีนเอง
          </button>
        )}
      </div>

      {/* ตารางวัคซีน */}
      {!showCustomOnly ? (
        <div className="overflow-x-auto">
          {/* ตารางวัคซีนมาตรฐาน */}
          <table className="table table-zebra w-full">
            <thead className="bg-gray-200 text-gray-700 text-sm">
              <tr>
                <th className="text-center">อายุ</th>
                <th className="text-center">วัคซีน</th>
                <th className="text-center">สถานะ</th>
                <th className="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map((item, index) => {
                const ageText =
                  item.ageRange >= 12 ? `${item.ageRange / 12} ปี` : `${item.ageRange} เดือน`;
                const received = isVaccineReceived(item.id);

                return (
                  <tr key={index}>
                    <td className="text-center">{ageText}</td>
                    <td className="text-center py-4">
                      <ul className="space-y-2 inline-block text-left">
                        {item.vaccines.map((vaccine, i) => (
                          <li
                            key={i}
                            className="tooltip tooltip-top"
                            data-tip={`วัคซีนนี้ต้องฉีดทั้งหมด ${item.vaccines.length} เข็ม`}
                          >
                            {vaccine.vaccineName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center py-4">
                      <ul className="space-y-2">
                        {item.vaccines.map((_, i) => (
                          <li key={i}>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${received ? "bg-green-600" : "bg-red-600"}`}>
                              {received ? "รับแล้ว" : "ยังไม่ได้รับ"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center">
                      <button
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-transform duration-200 shadow-lg ${received ? "bg-pink-300 text-pink-900 hover:bg-pink-400" : "bg-blue-300 text-blue-900 hover:bg-blue-400"} hover:scale-110`}
                        onClick={() => openModal(item, received)}
                      >
                        {received ? "แก้ไข" : "บันทึกรับวัคซีน"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* ตารางวัคซีนที่กรอกเอง */}
          <table className="table table-zebra w-full">
            <thead className="bg-yellow-200 text-gray-700 text-sm">
              <tr>
                <th className="text-center">วันที่รับ</th>
                <th className="text-center">ชื่อวัคซีน</th>
                <th className="text-center">สถานที่</th>
                <th className="text-center">เบอร์โทร</th>
                <th className="text-center">หมายเหตุ</th>
                <th className="text-center">การจัดการ</th> {/* เพิ่มคอลัมน์ฟนี้ */}
              </tr>
            </thead>
            <tbody>
              {customVaccines.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="text-center">
                      {new Date(item.receiveDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="text-center">
                      <ul className="text-center">
                        {item.records.map((rec, i) => (
                          <li key={i}>{rec.vaccineName}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center">{item.placeName}</td>
                    <td className="text-center">{item.phoneNumber}</td>
                    <td className="text-center">
                      <ul className="text-center">
                        {item.records.map((rec, i) => (
                          <li key={i}>{rec.note || "-"}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => openEditCustomModal(item)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => {
                            handleDeleteCustomVaccine(item.id);
                          }}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal สำหรับวัคซีนมาตรฐาน */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "แก้ไขข้อมูลวัคซีน" : "บันทึกข้อมูลวัคซีน"}
            </h2>

            {/* Progress Bar */}
            <ul className="steps w-full mb-6">
              <li className={`step ${currentStep >= 1 ? "step-success" : ""}`}>
                ข้อมูลเด็ก
              </li>
              <li className={`step ${currentStep >= 2 ? "step-success" : ""}`}>
                รายละเอียดวัคซีน
              </li>
              <li className={`step ${currentStep >= 3 ? "step-success" : ""}`}>
                สถานพยาบาล
              </li>
            </ul>


            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <p>
                  <strong>ชื่อเด็ก:</strong> {selectedChild?.firstName}{" "}
                  {selectedChild?.lastName}
                </p>
                <p>
                  <strong>อายุ:</strong>{" "}
                  {formData.ageRange >= 12
                    ? `${formData.ageRange / 12} ปี`
                    : `${formData.ageRange} เดือน`}
                </p>

                <ul className="list-disc list-inside">
                  {selectedVaccines.map((vac, i) => (
                    <li key={vac.vaccineName + i}>{vac.vaccineName}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">วันที่รับวัคซีน</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.receiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, receiveDate: e.target.value })
                  }
                />
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <input
                  id="VV-01"
                  type="text"
                  placeholder="สถานที่รับวัคซีน"
                  className="input input-bordered w-full"
                  value={formData.placeName}
                  onChange={(e) =>
                    setFormData({ ...formData, placeName: e.target.value })
                  }
                />

                <input
                  id="VV-02"
                  type="text"
                  placeholder="เบอร์โทร"
                  className="input input-bordered w-full"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
            )}

            {/* ปุ่มควบคุม Step */}
            <div className="mt-6 flex justify-between">

              {/* ปุ่มยกเลิก */}
              <button
                className="px-5 py-2 bg-red-200 text-red-900 rounded-lg hover:bg-red-300"
                onClick={() => setShowModal(false)}
              >
                ยกเลิก
              </button>

              <button
                className="px-5 py-2 bg-red-200 text-red-900 rounded-lg hover:bg-red-300"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                ย้อนกลับ
              </button>

              {currentStep < 3 ? (
                <button className="px-5 py-2 bg-green-200 text-green-900 rounded-lg hover:bg-green-300" onClick={nextStep}>
                  ถัดไป
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleSaveVaccine}>
                  {isEditMode ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Modal สำหรับวัคซีนกรอกเอง */}
      {showCustomModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">บันทึกวัคซีนแบบกรอกเอง</h2>

            <p>
              <strong>ชื่อเด็ก:</strong> {selectedChild?.firstName}{" "}
              {selectedChild?.lastName}
            </p>

            <input
              type="date"
              className="input input-bordered w-full my-2"
              value={customFormData.receiveDate}
              onChange={(e) =>
                setCustomFormData({ ...customFormData, receiveDate: e.target.value })
              }
            />

            <input
              id="VVC-01"
              type="text"
              placeholder="สถานที่รับวัคซีน"
              className="input input-bordered w-full my-2"
              value={customFormData.placeName}
              onChange={(e) =>
                setCustomFormData({ ...customFormData, placeName: e.target.value })
              }
            />

            <input
              id="VVC-02"
              type="text"
              placeholder="เบอร์โทร"
              className="input input-bordered w-full my-2"
              value={customFormData.phoneNumber}
              onChange={(e) =>
                setCustomFormData({ ...customFormData, phoneNumber: e.target.value })
              }
            />

            {/* กรอกข้อมูลวัคซีนแต่ละเข็ม */}
            {customRecords.map((rec, idx) => (
              <div key={idx} className="border p-3 rounded-lg mb-3">
                <input
                  id="VVC-03"
                  type="text"
                  placeholder="ชื่อวัคซีน"
                  className="input input-bordered w-full mb-2"
                  value={rec.vaccineName}
                  onChange={(e) => {
                    const newRecords = [...customRecords];
                    newRecords[idx].vaccineName = e.target.value;
                    setCustomRecords(newRecords);
                  }}
                />
                <input
                  id="VVC-04"
                  type="text"
                  placeholder="หมายเหตุ"
                  className="input input-bordered w-full"
                  value={rec.note}
                  onChange={(e) => {
                    const newRecords = [...customRecords];
                    newRecords[idx].note = e.target.value;
                    setCustomRecords(newRecords);
                  }}
                />
              </div>
            ))}

            <button
              className="btn btn-outline btn-sm mb-4"
              onClick={() => setCustomRecords([...customRecords, { vaccineName: "", note: "" }])}
            >
              + เพิ่มวัคซีน
            </button>

            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setShowCustomModal(false)}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={handleSaveCustomVaccine}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ViewVac;
