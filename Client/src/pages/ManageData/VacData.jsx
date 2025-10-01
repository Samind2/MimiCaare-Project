import React, { useState, useEffect } from "react";
import vaccineService from "../../service/dataVac.service";
import { toast } from "react-toastify";

const VacData = () => {
  // เก็บ list ของวัคซีนที่กำลังเพิ่ม
  const [vaccines, setVaccines] = useState([{ vaccineName: "", note: "" }]);
  const [vacList, setVacList] = useState([]); // ดึงรายการวัคซีนทั้งหมดมาโชว์

  // ดึงรายการวัคซีน metadata
  const fetchVacList = async () => {
    try {
      const res = await vaccineService.getAllVaccines();
      setVacList(res.data.vaccines || []);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถดึงรายการวัคซีนได้");
    }
  };

  useEffect(() => {
    fetchVacList();
  }, []);

  // เพิ่ม input field ใหม่
  const handleAddField = () => {
    setVaccines([...vaccines, { vaccineName: "", note: "" }]);
  };

  // ลบ input field
  const handleRemoveField = (index) => {
    const list = [...vaccines];
    list.splice(index, 1);
    setVaccines(list);
  };

  // อัปเดตค่า input
  const handleChange = (index, field, value) => {
    const list = [...vaccines];
    list[index][field] = value;
    setVaccines(list);
  };

  // ส่งข้อมูลทั้งหมด
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const vac of vaccines) {
        await vaccineService.addNewVaccine(vac);
      }
      toast.success("เพิ่มข้อมูลวัคซีนสำเร็จ");
      setVaccines([{ vaccineName: "", note: "" }]); // รีเซ็ต form
      fetchVacList(); // รีเฟรชรายการ
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเพิ่มข้อมูลได้");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-lg mx-auto mb-6">
      <h2 className="text-lg font-bold mb-4">เพิ่มข้อมูลวัคซีน (Metadata)</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {vaccines.map((vac, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={vac.vaccineName}
              onChange={(e) =>
                handleChange(index, "vaccineName", e.target.value)
              }
              placeholder="ชื่อวัคซีน เช่น BCG"
              className="border p-2 rounded flex-1"
              required
            />
            <input
              type="text"
              value={vac.note}
              onChange={(e) => handleChange(index, "note", e.target.value)}
              placeholder="อาการข้างเคียง เช่น มีไข้ ปวด บวม แดง"
              className="border p-2 rounded flex-1"
              required
            />
            {vaccines.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="text-red-500 font-bold px-2"
              >
                ❌
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddField}
          className="text-blue-500 font-semibold mb-2"
        >
          ➕ เพิ่มวัคซีนอีก
        </button>

        <button
          type="submit"
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
        >
          บันทึก
        </button>
      </form>

      {/* แสดงรายการวัคซีน metadata */}
      {vacList.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">รายการวัคซีนทั้งหมด</h3>
          <ul className="list-disc list-inside text-gray-700">
            {vacList.map((vac) => (
              <li key={vac._id}>
                {vac.vaccineName} ({vac.note})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VacData;
