import React, { useEffect, useState } from "react";
import vaccineService from "../../../service/standardVaccine.service";
import receiveVaccineService from "../../../service/receiveVac.service";
import childService from "../../../service/child.service";
import { toast } from "react-toastify";
import { FaPlus, FaChevronDown, } from 'react-icons/fa';
import VaccineTimeline from "./VaccineTimeline"



const ViewVac = () => {

  const [vaccines, setVaccines] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [receivedVaccines, setReceivedVaccines] = useState([]);
  const [customVaccines, setCustomVaccines] = useState([]);
  const [showCustomOnly, setShowCustomOnly] = useState(false);


  const [currentStep, setCurrentStep] = useState(1);
  const [lastPlaceName, setLastPlaceName] = useState("");
  const [lastPhoneNumber, setLastPhoneNumber] = useState("");
  const [currentCustomStep, setCurrentCustomStep] = useState(1);
  const [isStep3Attempted, setIsStep3Attempted] = useState(false);
  const [isCustomStep3Attempted, setIsCustomStep3Attempted] = useState(false);


  const nextCustomStep = () => setCurrentCustomStep((prev) => Math.min(prev + 1, 3));
  const prevCustomStep = () => setCurrentCustomStep((prev) => Math.max(prev - 1, 1));


  // Modal สำหรับวัคซีนมาตรฐาน
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // เพิ่ม state สำหรับโหมดแก้ไข
  const [editingRecordId, setEditingRecordId] = useState(null); // เพิ่ม state สำหรับเก็บ id ของ record ที่จะแก้ไข
  const [formData, setFormData] = useState({
    ageRange: null,
    standardVaccineId: null,
    receiveDate: "",
    placeName: "",
    phoneNumber: "",
  });
  const [selectedVaccines, setSelectedVaccines] = useState([]);


  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Modal สำหรับวัคซีนที่ผู้ใช้กรอกเอง 
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

    if (!selectedChild) {
      toast.warning("กรุณาเพิ่มเด็กในระบบก่อน");
      return;
    }

    if (isEdit) {
      const record = receivedVaccines.find((receivedVaccineRecord) => receivedVaccineRecord.standardVaccineId === item.id);



      if (!record) {
        toast.warning("ไม่พบข้อมูลวัคซีนที่ต้องการแก้ไข");
        return;
      }

      setFormData({
        ageRange: item.ageRange,
        standardVaccineId: item.id,
        receiveDate: new Date().toISOString().substring(0, 10),
        placeName: lastPlaceName || "",
        phoneNumber: lastPhoneNumber || "",
      });
      setEditingRecordId(record.id || null);
      setIsEditMode(true);
    } else {
      setFormData({
        ageRange: item.ageRange,
        standardVaccineId: item.id,
        receiveDate: new Date().toISOString().substring(0, 10),
        placeName: lastPlaceName || "",
        phoneNumber: lastPhoneNumber || "",
      });

      setEditingRecordId(null);
      setIsEditMode(false);
    }

    setSelectedVaccines(item.vaccines);
    setCurrentStep(1);
    setShowModal(true);
  };

  //  ฟังก์ชันเปิด Modal กรอกเอง 
  const openCustomModal = () => {

    if (!selectedChild) {
      toast.warning("กรุณาเพิ่มเด็กในระบบก่อน");
      return;
    }

    setCustomFormData({
      receiveDate: new Date().toISOString().substring(0, 10),
      placeName: lastPlaceName || "",
      phoneNumber: lastPhoneNumber || "",
    });
    setCustomRecords([{ vaccineName: "", note: "" }]);
    setCurrentStep(1);
    setShowCustomModal(true);
  };

  //  โหลดข้อมูล
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccineService.getvaccine();
        const sortedVaccines = (res.data.vaccines || []).sort((a, b) => a.ageRange - b.ageRange);
        setVaccines(sortedVaccines);
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
        if (receivedData.length > 0) {
          const last = receivedData[receivedData.length - 1];
          setLastPlaceName(last.placeName || "");
          setLastPhoneNumber(last.phoneNumber || "");
        }
      } catch (error) {
        console.error("Error fetching received vaccines", error);
        setReceivedVaccines([]);
        setCustomVaccines([]);
      }
    };

    fetchReceivedVaccines();
  }, [selectedChild]);

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

    if (!formData.receiveDate) {
      toast.warning("กรุณาเลือกวันที่รับวัคซีน");
      return;
    }

    if (!formData.placeName || !formData.phoneNumber) {
      toast.warning("กรุณากรอกสถานที่และเบอร์โทรให้ครบ");
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

      setLastPlaceName(formData.placeName);
      setLastPhoneNumber(formData.phoneNumber);

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

    const newDate = new Date(customFormData.receiveDate).toISOString().split('T')[0];
    const newName = customRecords[0].vaccineName.trim();

    const isDuplicate = customVaccines.some(vaccine => {
      const vaccineDate = vaccine.receiveDate ? vaccine.receiveDate.split('T')[0] : '';
      const vaccineName = Array.isArray(vaccine.records) && vaccine.records.length > 0
        ? vaccine.records[0].vaccineName.trim()
        : '';
      return vaccineDate === newDate && vaccineName === newName;
    });

    if (isDuplicate && !isEditMode) { 
      toast.warning("มีการบันทึกวัคซีนนี้ในวันที่เดียวกันแล้ว");
      return;
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

      setLastPlaceName(customFormData.placeName);
      setLastPhoneNumber(customFormData.phoneNumber);
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
    setEditingRecordId(item.id);
    setIsEditMode(true);
    setShowCustomModal(true);

  };

  const handleDeleteCustomVaccine = async (id) => {

    const confirm = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>คุณต้องการลบข้อมูลวัคซีนนี้ใช่หรือไม่?</p>
          <div className="mt-2 flex justify-end space-x-2">
            <button
              className="btn btn-sm btn-error"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              ยืนยัน
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              ยกเลิก
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
        }
      );
    });

    if (!confirm) return;


    try {
      await receiveVaccineService.deleteById(id);
      toast.success("ลบข้อมูลวัคซีนสำเร็จ");

      const res = await receiveVaccineService.getByChildId(selectedChild.id);
      const receivedData = res.data.vaccines || [];

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
            {filteredOptions.map((item, i) => (
              <li key={i}>
                <a
                  className="hover:bg-blue-300 rounded-md p-2 cursor-pointer"
                  onClick={() => setShowCustomOnly(item.value)}
                >
                  {item.label}
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

      {showCustomOnly ? (
        <VaccineTimeline
          vaccines={customVaccines}
          receivedVaccines={customVaccines}
          onSelectVaccine={openEditCustomModal}
          isCustom={true}
          onDeleteVaccine={handleDeleteCustomVaccine}
        />
      ) : (
        <VaccineTimeline
          vaccines={vaccines}
          receivedVaccines={receivedVaccines}
          onSelectVaccine={openModal}
        />
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
              <li className={`step ${currentStep >= 1 ? "step-success" : ""}`}>ข้อมูลเด็ก</li>
              <li className={`step ${currentStep >= 2 ? "step-success" : ""}`}>รายละเอียดวัคซีน</li>
              <li className={`step ${currentStep >= 3 ? "step-success" : ""}`}>สถานพยาบาล</li>
            </ul>

            {/* Step 1 */}
            {currentStep === 1 && (

              <div className="space-y-3">
                <p><strong>ชื่อเด็ก:</strong> {selectedChild?.firstName} {selectedChild?.lastName}</p>

                <p>
                  <strong>อายุ:</strong>{" "}
                  {Number(formData.ageRange) === 0
                    ? "แรกเกิด"
                    : Number(formData.ageRange) >= 12
                      ? `${Math.floor(Number(formData.ageRange) / 12)} ปี`
                      : `${Number(formData.ageRange)} เดือน`}
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
                  onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                />
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="สถานที่รับวัคซีน"

                  className={`input input-bordered w-full ${!formData.placeName && isStep3Attempted ? "input-error" : ""}`}

                  value={formData.placeName}
                  onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="เบอร์โทร"

                  className={`input input-bordered w-full ${!formData.phoneNumber && isStep3Attempted ? "input-error" : ""}`}

                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            )}

            {/* ปุ่มควบคุม Step */}
            <div className="mt-6 flex justify-between">
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

                <button
                  className="px-5 py-2 bg-green-200 text-green-900 rounded-lg hover:bg-green-300"
                  onClick={nextStep}
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    if (!formData.placeName || !formData.phoneNumber) {
                      toast.error("กรุณากรอกสถานที่และเบอร์โทรให้ครบ");
                      setIsStep3Attempted(true);
                      return;
                    }
                    handleSaveVaccine();
                    setIsStep3Attempted(false);
                  }}
                >
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
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "แก้ไขวัคซีนแบบกรอกเอง" : "บันทึกวัคซีนแบบกรอกเอง"}
            </h2>

            {/* Progress Bar */}
            <ul className="steps w-full mb-6">
              <li className={`step ${currentCustomStep >= 1 ? "step-success" : ""}`}>ข้อมูลเด็ก</li>
              <li className={`step ${currentCustomStep >= 2 ? "step-success" : ""}`}>รายละเอียดวัคซีน</li>
              <li className={`step ${currentCustomStep >= 3 ? "step-success" : ""}`}>สถานพยาบาล</li>
            </ul>

            {/* Step 1 */}
            {currentCustomStep === 1 && (
              <div>
                <p><strong>ชื่อเด็ก:</strong> {selectedChild?.firstName} {selectedChild?.lastName}</p>
              </div>
            )}

            {/* Step 2 */}
            {currentCustomStep === 2 && (
              <div>
                {customRecords.map((rec, idx) => (
                  <div key={idx} className="border p-3 rounded-lg mb-3">
                    <input
                      type="text"
                      placeholder="ชื่อวัคซีน"

                      className={`input input-bordered w-full mb-2 ${!rec.vaccineName && isCustomStep3Attempted ? "input-error" : ""}`}

                      value={rec.vaccineName}
                      onChange={(e) => {
                        const newRecords = [...customRecords];
                        newRecords[idx].vaccineName = e.target.value;
                        setCustomRecords(newRecords);
                      }}
                    />
                    <input
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
              </div>
            )}

            {/* Step 3 */}
            {currentCustomStep === 3 && (
              <div>
                <input
                  type="date"
                  className="input input-bordered w-full my-2"
                  value={customFormData.receiveDate}
                  onChange={(e) => setCustomFormData({ ...customFormData, receiveDate: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="สถานที่รับวัคซีน"

                  className={`input input-bordered w-full my-2 ${!customFormData.placeName && isCustomStep3Attempted ? "input-error" : ""}`}

                  value={customFormData.placeName}
                  onChange={(e) => setCustomFormData({ ...customFormData, placeName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="เบอร์โทร"

                  className={`input input-bordered w-full my-2 ${!customFormData.phoneNumber && isCustomStep3Attempted ? "input-error" : ""}`}

                  value={customFormData.phoneNumber}
                  onChange={(e) => setCustomFormData({ ...customFormData, phoneNumber: e.target.value })}
                />
              </div>
            )}

            {/* ปุ่มควบคุม Step */}
            <div className="flex justify-between mt-4">
              <button className="btn" onClick={() => setShowCustomModal(false)}>ยกเลิก</button>
              <button
                className="btn btn-warning"
                onClick={prevCustomStep}
                disabled={currentCustomStep === 1}
              >
                ย้อนกลับ
              </button>

              {currentCustomStep < 3 ? (

                <button className="btn btn-success" onClick={nextCustomStep}>ถัดไป</button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!customFormData.placeName || !customFormData.phoneNumber) {
                      toast.error("กรุณากรอกสถานที่และเบอร์โทรให้ครบ");
                      setIsCustomStep3Attempted(true);
                      return;
                    }
                    handleSaveCustomVaccine();
                    setIsCustomStep3Attempted(false);
                  }}
                >

                  บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};


export default ViewVac;
