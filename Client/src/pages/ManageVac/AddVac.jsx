import React, { useEffect, useState } from 'react';
import vaccineService from '../../service/standardVaccine.service';
import { FaPlus } from 'react-icons/fa';

const VaccinePage = () => {
  const [vaccineOptions, setVaccineOptions] = useState([]); //เก็บชื่อวัคซีนทั้งหมดที่ใช้ใน datalist
  const [formRows, setFormRows] = useState([]); // เก็บข้อมูลที่กรอกในฟอร์ม
  const [showForm, setShowForm] = useState(false); // แสดงหรือซ่อนฟอร์มเพิ่มวัคซีน
  const [displayRows, setDisplayRows] = useState([]); // เก็บข้อมูลวัคซีนที่จะแสดงในตาราง

  const ageOptions = ['1 เดือน', '2 เดือน', '4 เดือน', '6 เดือน', '9 เดือน', '1 ปี', '1 ปี 6 เดือน', '2 ปี', '2 ปี 6 เดือน', '11 ปี', '12 ปี'];

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccineService.getvaccine();
        const allVaccines = res.data.vaccines;

        const flatRows = allVaccines.flatMap(item => // แปลงข้อมูลแบบซ้อนกันให้เป็นแถวเดียว
          item.vaccines.map(v => ({
            age: `${item.ageRange} เดือน`, // แปลงเป็นข้อความเพื่อแสดง
            ageNum: item.ageRange, // เพิ่มอันนี้เพื่อใช้เรียงลำดับ
            vaccine: v.vaccineName
          }))
        ).sort((a, b) => a.ageNum - b.ageNum); // เรียงตามตัวเลขช่วงอายุ

        setDisplayRows(flatRows);

        // ตั้งค่า vaccine options สำหรับ select box
        const vaccineNames = [...new Set(flatRows.map(v => v.vaccine))];
        setVaccineOptions(vaccineNames);
      } catch (err) {
        console.error('Error fetching vaccines:', err);
      }
    };

    fetchVaccines();
  }, []);

  const handleAddForm = () => {
    setShowForm(true);
    setFormRows([{ age: '', vaccine: '' }]); // เพิ่มแถวแรกทันที
  };

  const handleAddRow = () => {
    setFormRows([...formRows, { age: '', vaccine: '' }]);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...formRows];
    updatedRows[index][field] = value;
    setFormRows(updatedRows);
  };

  const mapAgeTextToNumber = (ageText) => { // แปลงข้อความเป็นตัวเลข (เดือน)
    const map = {
      '1 เดือน': 1,
      '2 เดือน': 2,
      '4 เดือน': 4,
      '6 เดือน': 6,
      '9 เดือน': 9,
      '1 ปี': 12,
      '1 ปี 6 เดือน': 18,
      '2 ปี': 24,
      '2 ปี 6 เดือน': 30,
      '11 ปี': 132,
      '12 ปี': 144,
    };
    return map[ageText] || 0;
  };

  const handleSave = async () => {
    try {
      const grouped = {};

      formRows.forEach((row) => {
        const age = mapAgeTextToNumber(row.age);
        if (!grouped[age]) grouped[age] = [];

        grouped[age].push({
          vaccineName: row.vaccine,
          note: ""
        });
      });

      for (const age in grouped) {
        const payload = {
          ageRange: parseInt(age),
          vaccines: grouped[age]
        };

        await vaccineService.addvaccine(payload);
      }

      // เพิ่มวัคซีนใหม่ที่ยังไม่มีใน vaccineOptions
      const newVaccineNames = formRows.map(r => r.vaccine).filter(v => !vaccineOptions.includes(v));
      if (newVaccineNames.length > 0) {
        setVaccineOptions(prev => [...new Set([...prev, ...newVaccineNames])]);
      }

      // Clear form
      setFormRows([]);
      setShowForm(false);

      // 🔁 ดึงข้อมูลใหม่จากฐานข้อมูล
      const res = await vaccineService.getvaccine();
      const allVaccines = res.data.vaccines;

      const flatRows = allVaccines.flatMap(item =>
        item.vaccines.map(v => ({
          age: `${item.ageRange} เดือน`,
          ageNum: item.ageRange,
          vaccine: v.vaccineName
        }))
      ).sort((a, b) => a.ageNum - b.ageNum);

      setDisplayRows(flatRows);

    } catch (error) {
      console.error('Error saving vaccines:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">การจัดการวัคซีน</h2>

      <div className="flex gap-2 mb-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          onClick={handleAddForm}
        >
          ➕ เพิ่มวัคซีน
        </button>
        <button className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded">
          ✏️ แก้ไขวัคซีน
        </button>
      </div>

      {showForm && (
        <>
          <div className="bg-gray-200 grid grid-cols-3 gap-4 p-2 rounded font-semibold text-sm mb-2">
            <div>ช่วงอายุ</div>
            <div>ชื่อวัคซีน</div>
            <div></div>
          </div>

          {formRows.map((row, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center mb-2">
              <select
                className="border rounded px-2 py-1"
                value={row.age}
                onChange={(e) => handleChange(index, 'age', e.target.value)}
              >
                <option value="">เลือกอายุ</option>
                {ageOptions.map((age, i) => (
                  <option key={i} value={age}>{age}</option>
                ))}
              </select>

              <input
                type="text"
                className="border rounded px-2 py-1"
                value={row.vaccine}
                onChange={(e) => handleChange(index, 'vaccine', e.target.value)}
                list="vaccine-list"
              />
              <datalist id="vaccine-list">
                {vaccineOptions.map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>


              <div className="flex items-center">
                {index === formRows.length - 1 && (
                  <>
                    <button
                      className="bg-black text-white rounded-full p-1 hover:bg-gray-700 mr-2"
                      onClick={handleAddRow}
                    >
                      <FaPlus size={12} />
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={handleSave}
                    >
                      บันทึก
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* แสดงตารางวัคซีนที่บันทึก */}
      {displayRows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">รายการวัคซีนทั้งหมด</h3>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ช่วงอายุ</th>
                <th className="border p-2">ชื่อวัคซีน</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2">{row.age}</td>
                  <td className="border p-2">{row.vaccine}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
};

export default VaccinePage;