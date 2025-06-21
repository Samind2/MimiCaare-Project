import React, { useEffect, useState } from "react";
import vaccineService from "../../../service/standardVaccine.service";
import receiveVaccineService from "../../../service/receiveVac.service";
import childService from "../../../service/child.service";
import { toast } from "react-toastify";

const ViewVac = () => {
  const [vaccines, setVaccines] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receivedVaccines, setReceivedVaccines] = useState([]);

  const [formData, setFormData] = useState({
    ageRange: null,
    standardVaccineId: null,
    receiveDate: "",
    placeName: "",
    phoneNumber: "",
  });
  const [selectedVaccines, setSelectedVaccines] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false); // โหมดแก้ไขหรือเพิ่มใหม่
  const [editingRecordId, setEditingRecordId] = useState(null); // id ข้อมูลที่แก้ไข

  // ฟังก์ชันเปิด modal กรอกข้อมูลรับวัคซีน
  // isEdit = true แก้ไข, false เพิ่มใหม่
  const openModal = (item, isEdit = false) => {
    if (isEdit) {
      // หา record ที่รับวัคซีนนี้แล้ว
      const record = receivedVaccines.find(
        (rv) => rv.standardVaccineId === item.id
      );
      if (!record) {
        toast.warning("ไม่พบข้อมูลวัคซีนที่ต้องการแก้ไข");
        return;
      }

      setFormData({
        ageRange: item.ageRange,
        standardVaccineId: item.id,
        receiveDate: record.receiveDate
          ? record.receiveDate.substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        placeName: record.placeName || "",
        phoneNumber: record.phoneNumber || "",
      });
      setEditingRecordId(record.id || null);
      setIsEditMode(true);
    } else {
      // เพิ่มใหม่
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

  // โหลดข้อมูลวัคซีนมาตรฐาน
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccineService.getvaccine();
        setVaccines(res.data.vaccines || []);
      } catch (err) {
        console.error("Error fetching vaccines", err);
        setVaccines([]);
      }
    };
    fetchVaccines();
  }, []);

  // โหลดข้อมูลเด็ก
  useEffect(() => {
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
    fetchChildren();
  }, []);

  // โหลดข้อมูลวัคซีนที่เด็กได้รับ ทุกครั้งที่เปลี่ยน selectedChild
  useEffect(() => {
    const fetchReceivedVaccines = async () => {
      if (!selectedChild) return;
      try {
        const res = await receiveVaccineService.getByChildId(selectedChild.id);
        // console.log("API getByChildId response:", res.data);

        // ดึงข้อมูลวัคซีนที่ได้รับ (ถ้า vaccines เป็น null ให้แทนด้วย array ว่าง)
        const receivedData = Array.isArray(res.data.vaccines)
          ? res.data.vaccines
          : [];

        setReceivedVaccines(receivedData);
      } catch (error) {
        // console.error("Error fetching received vaccines", error);
        setReceivedVaccines([]);
      }
    };
    fetchReceivedVaccines();
  }, [selectedChild]);

  // ฟังก์ชันตรวจสอบว่าวัคซีนในมาตรฐานนี้ เด็กได้รับแล้วหรือไม่
  const isVaccineReceived = (standardVaccineId) => {
    if (!Array.isArray(receivedVaccines)) return false;
    return receivedVaccines.some(
      (rv) => rv.standardVaccineId === standardVaccineId
    );
  };

  // บันทึกข้อมูลรับวัคซีน (เพิ่มหรือแก้ไข)
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
        // เรียก API แก้ไขข้อมูล โดยใช้ editingRecordId
        if (!editingRecordId) {
          toast.warning("ไม่พบข้อมูลสำหรับแก้ไขการรับวัคซีน");
          return;
        }
        await receiveVaccineService.updateById(editingRecordId, payload);
        toast.success("แก้ไขการรับวัคซีนสำเร็จ");
      } else {
        // เพิ่มใหม่
        await receiveVaccineService.addFromStandard(payload);
        toast.success("บันทึกการรับวัคซีนสำเร็จ");
      }

      setShowModal(false);

      // โหลดข้อมูลใหม่หลังบันทึกเสร็จ
      const res = await receiveVaccineService.getByChildId(selectedChild.id);
      const receivedData = Array.isArray(res.data.vaccines) ? res.data.vaccines : [];
      setReceivedVaccines(receivedData);
    } catch (err) {
      // console.error("เกิดข้อผิดพลาดขณะบันทึก", err);
      toast.error("เกิดข้อผิดพลาดขณะบันทึก กรุณาลองใหม่");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">วัคซีน</h1>

        <div className="flex space-x-4">
          <div className="dropdown dropdown-hover">
            <label
              tabIndex={0}
              className="btn bg-blue-200 text-blue-800 hover:bg-blue-300 rounded-xl px-4 py-2 text-lg font-semibold shadow-md transition"
            >
              ตามมาตรฐาน
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-3 shadow-lg bg-blue-100 rounded-xl w-56 text-blue-900 font-medium text-base"
              style={{ minWidth: "14rem" }}
            >
              <li>
                <a className="hover:bg-blue-300 rounded-md p-2 cursor-pointer">เพิ่มเติม</a>
              </li>
            </ul>
          </div>

          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 w-48 overflow-hidden whitespace-nowrap text-ellipsis px-4 py-2 text-left bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-xl text-lg font-semibold shadow-md cursor-pointer transition"
              title={
                selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : "เลือกเด็ก"
              }
            >
              <span className="truncate block w-full">
                {selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : "เลือกเด็ก"}
              </span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-3 shadow-lg bg-pink-50 rounded-xl w-56 max-h-60 overflow-auto text-pink-900 font-medium text-base"
              style={{ minWidth: "14rem" }}
            >
              {children.map((child) => (
                <li key={child._id}>
                  <a
                    className="hover:bg-pink-200 rounded-md p-2 cursor-pointer"
                    onClick={() => {
                      setSelectedChild(child);
                      setReceivedVaccines([]); // เคลียร์ข้อมูลเก่า
                    }}
                  >
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                item.ageRange >= 12
                  ? `${item.ageRange / 12} ปี`
                  : `${item.ageRange} เดือน`;

              const received = isVaccineReceived(item.id);

              return (
                <tr key={index}>
                  <td className="align-middle text-center">{ageText}</td>

                  <td className="align-middle text-center py-4">
                    <ul className="space-y-2 inline-block text-left">
                      {item.vaccines.map((vaccine, i) => (
                        <li key={i}>{vaccine.vaccineName}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="align-middle text-center py-4">
                    <ul className="space-y-2">
                      {item.vaccines.map((vaccine, i) => (
                        <li key={i}>
                          {received ? (
                            <span className="bg-green-600 text-white px-2 py-1 text-xs rounded-full">
                              รับแล้ว
                            </span>
                          ) : (
                            <span className="bg-red-600 text-white px-2 py-1 text-xs rounded-full">
                              ยังไม่ได้รับ
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="align-middle text-center">
                    {received ? (
                      <button
                        className="bg-pink-300 text-pink-900 hover:bg-pink-400 hover:scale-110 transition-transform duration-200 px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-pink-200"
                        onClick={() => openModal(item, true)}
                      >
                        แก้ไข
                      </button>
                    ) : (
                      <button
                        className="bg-blue-300 text-blue-900 hover:bg-blue-400 hover:scale-110 transition-transform duration-200 px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-200"
                        onClick={() => openModal(item, false)}
                      >
                        บันทึกรับวัคซีน
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">
                {isEditMode ? "แก้ไขข้อมูลวัคซีน" : "บันทึกข้อมูลวัคซีน"}
              </h2>

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
                <p>
                  <strong>รายการวัคซีน:</strong>
                </p>
                <ul className="list-disc list-inside">
                  {selectedVaccines.map((vac, i) => (
                    <li key={vac.vaccineName + i}>{vac.vaccineName}</li>
                  ))}
                </ul>

                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.receiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, receiveDate: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="สถานที่รับวัคซีน"
                  className="input input-bordered w-full"
                  value={formData.placeName}
                  onChange={(e) =>
                    setFormData({ ...formData, placeName: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="เบอร์โทร"
                  className="input input-bordered w-full"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </button>
                <button className="btn btn-primary" onClick={handleSaveVaccine}>
                  {isEditMode ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVac;
