import React, { useState, useEffect } from "react";
import vaccineService from "../../service/dataVac.service";
import { toast } from "react-toastify";

const VacData = () => {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vaccineService.addNewVaccine({ name, dose });
      toast.success("เพิ่มข้อมูลวัคซีนสำเร็จ");
      setName("");
      setDose("");
      fetchVacList(); // รีเฟรชรายการ
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเพิ่มข้อมูลได้");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto mb-6">
      <h2 className="text-lg font-bold mb-2">เพิ่มข้อมูลวัคซีน (Metadata)</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อวัคซีน เช่น BCG"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="จำนวนเข็ม เช่น 1/2"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
        >
          บันทึก
        </button>
      </form>

      {/* แสดงรายการวัคซีน metadata */}
      {vacList.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">รายการวัคซีนทั้งหมด</h3>
          <ul className="list-disc list-inside text-gray-700">
            {vacList.map((vac) => (
              <li key={vac.id}>
                {vac.name} ({vac.dose})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VacData;
