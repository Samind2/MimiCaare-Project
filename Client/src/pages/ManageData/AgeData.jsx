import React, { useState } from "react";
import ageRangeService from "../../service/dataAge.service";
import { toast } from "react-toastify";

const AgeData = () => {
  const [ageRange, setAgeRange] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 👇 ต้องใช้ ageRange ไม่ใช่ range
      await ageRangeService.addNewAgeRange({ ageRange: Number(ageRange) });
      toast.success("เพิ่มช่วงอายุสำเร็จ");
      setAgeRange("");
    } catch (err) {
      toast.error("ไม่สามารถเพิ่มข้อมูลได้");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">เพิ่มช่วงอายุ</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          placeholder="กรอกตัวเลขเดือน เช่น 12"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
};

export default AgeData;
