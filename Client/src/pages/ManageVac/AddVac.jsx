import React, { useEffect, useState } from 'react';
import vaccineService from '../../service/standardVaccine.service';
import vacineData from '../../service/dataVac.service';
import { FaPlus } from 'react-icons/fa';
import { toast } from "react-toastify";

const VaccinePage = () => {
  const [vaccineOptions, setVaccineOptions] = useState([]);
  const [dataVaccines, setDataVaccines] = useState([]);
  const [formRows, setFormRows] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // modal เพิ่มข้อมูล
  const [groupedByAge, setGroupedByAge] = useState({});
  const [editAge, setEditAge] = useState(null); // modal แก้ไข
  const [editVaccines, setEditVaccines] = useState([]);

  const ageOptions = ['0 เดือน', '1 เดือน', '2 เดือน', '4 เดือน', '6 เดือน', '9 เดือน', '1 ปี', '1 ปี 6 เดือน', '2 ปี 6 เดือน', '4 ปี', '11 ปี', '12 ปี'];

  useEffect(() => {
    fetchVaccines();
    fetchDataVaccines();
  }, []);

  const fetchDataVaccines = async () => {
    try {
      const res = await vacineData.getAllVaccines();
      const data = res.data.data || [];
      console.log(res.data)
      setDataVaccines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching meta vaccines:", error);
      setDataVaccines([]);
    }
  };

  const fetchVaccines = async () => {
    try {
      const res = await vaccineService.getvaccine();
      const allVaccines = res.data.vaccines;

      const grouped = {};
      allVaccines.forEach(item => {
        grouped[item.ageRange] = {
          id: item.id,
          vaccines: item.vaccines.map(v => v.vaccineName)
        };
      });

      setGroupedByAge(grouped);

      const vaccineNames = [...new Set(allVaccines.flatMap(item => item.vaccines.map(v => v.vaccineName)))];
      setVaccineOptions(vaccineNames);
    } catch (err) {
      console.error('Error fetching vaccines:', err);
    }
  };

  const mapAgeToText = (age) => {
    if (age === 0) return "แรกเกิด";
    if (age >= 12) {
      const years = Math.floor(age / 12);
      const months = age % 12;
      return months === 0 ? `${years} ปี` : `${years} ปี ${months} เดือน`;
    }
    return `${age} เดือน`;
  };

  const mapAgeTextToNumber = (ageText) => {
    const map = {
      '0 เดือน': 0, '1 เดือน': 1, '2 เดือน': 2, '4 เดือน': 4, '6 เดือน': 6, '9 เดือน': 9,
      '1 ปี': 12, '1 ปี 6 เดือน': 18, '2 ปี 6 เดือน': 30, '4 ปี': 48, '11 ปี': 132, '12 ปี': 144,
    };
    return map[ageText] || 0;
  };

  //  เพิ่มข้อมูล 
  const handleAddForm = () => {
    setIsAddModalOpen(true);
    setFormRows([{ age: '', vaccine: '' }]);
  };

  const handleAddRow = () => {
    setFormRows([...formRows, { age: '', vaccine: '' }]);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...formRows];
    updatedRows[index][field] = value;
    setFormRows(updatedRows);
  };

  const handleSubmit = async () => {
    try {
      if (!formRows[0].age) {
        toast.error("กรุณาเลือกอายุ", { autoClose: 2000 });
        return;
      }

      const ageNum = mapAgeTextToNumber(formRows[0].age);

      if (groupedByAge[ageNum]) {
        toast.error(`มีข้อมูลวัคซีนสำหรับอายุ ${formRows[0].age} แล้ว`, { autoClose: 2000 });
        return;
      }

      const vaccines = formRows.map(row => ({ vaccineName: row.vaccine, note: "" }));

      const payload = { ageRange: ageNum, vaccines };

      await vaccineService.addvaccine(payload);

      const newVaccineNames = formRows.map(row => row.vaccine).filter(vac => !vaccineOptions.includes(vac));
      if (newVaccineNames.length > 0) {
        setVaccineOptions(prev => [...new Set([...prev, ...newVaccineNames])]);
      }

      toast.success("บันทึกข้อมูลวัคซีนสำเร็จ", { autoClose: 1500 });
      setFormRows([]);
      setIsAddModalOpen(false);
      fetchVaccines();
    } catch (error) {
      console.error('Error saving vaccines:', error);
      toast.error("เกิดข้อผิดพลาด", { autoClose: 1500 });
    }
  };


  //  แก้ไขข้อมูล 
  const handleEdit = (age) => {
    setEditAge(age);
    setEditVaccines([...groupedByAge[age].vaccines]);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ageRange: parseInt(editAge),
        vaccines: editVaccines.map(v => ({ vaccineName: v, note: "" }))
      };
      await vaccineService.UpdateStandardVaccine(groupedByAge[editAge].id, payload);
      toast.success("แก้ไขข้อมูลสำเร็จ");
      setEditAge(null);
      setEditVaccines([]);
      fetchVaccines();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };

  //  ลบข้อมูล 
  const handleDelete = async (idToDelete) => {
    const confirmDelete = () =>
      new Promise((resolve) => {
        const ToastContent = ({ closeToast }) => (
          <div>
            <p>คุณต้องการลบข้อมูลวัคซีนใช่หรือไม่?</p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="btn btn-sm btn-error"
                onClick={() => {
                  closeToast();
                  resolve(false);
                }}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={() => {
                  closeToast();
                  resolve(true);
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        );

        toast.info(<ToastContent />, {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          draggable: false,
        });
      });

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await vaccineService.DeleteStandardVaccine(idToDelete);
      toast.success("ลบข้อมูลสำเร็จ");
      fetchVaccines();
    } catch (error) {
      toast.error("ลบข้อมูลไม่สำเร็จ");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">การจัดการวัคซีน</h2>
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded"
          onClick={handleAddForm}
        >
          <FaPlus className="inline mr-2" />
          เพิ่มข้อมูลวัคซีน
        </button>
      </div>

      {/* ตารางวัคซีน */}
      {Object.keys(groupedByAge).length > 0 ? (
        <div className="w-full">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-lg">อายุ</th>
                <th className="py-3 px-4 text-left">วัคซีน</th>
                <th className="py-3 px-4 text-left rounded-tr-lg">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByAge).map(([age, group]) => (
                <tr key={age} className="bg-white shadow rounded-lg hover:scale-[1.01] transition">
                  <td className="py-3 px-4 rounded-l-lg text-gray-700 font-medium">{mapAgeToText(Number(age))}</td>
                  <td className="py-3 px-4 text-gray-600">
                    <ul className="list-disc list-inside space-y-1">
                      {group.vaccines.map((v, idx) => <li key={idx}>{v}</li>)}
                    </ul>
                  </td>
                  <td className="px-6 py-2 flex gap-2 rounded-r-lg">
                    <button
                      onClick={() => handleEdit(Number(age))}
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:scale-105 transition rounded-full px-6 py-2 text-sm font-semibold shadow"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 transition rounded-full px-6 py-2 text-sm font-semibold shadow"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">ไม่มีข้อมูลวัคซีน</p>
      )}

      {/*  Modal เพิ่ม  */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-center text-blue-800 mb-4">เพิ่มข้อมูลวัคซีน</h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {formRows.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {/* ให้แสดง Dropdown อายุแค่แถวแรก */}
                  {index === 0 && (
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={row.age}
                      onChange={(e) => handleChange(index, 'age', e.target.value)}
                    >
                      <option value="">เลือกอายุ</option>
                      {ageOptions.map((age, i) => (
                        <option key={i} value={age === '0 เดือน' ? '0' : age}>
                          {age === '0 เดือน' ? 'แรกเกิด' : age}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Dropdown วัคซีน */}
                  <select
                    className={`border border-gray-300 rounded-lg px-3 py-2 text-sm ${index === 0 ? 'w-2/3' : 'w-full'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                    value={row.vaccine}
                    onChange={(e) => handleChange(index, 'vaccine', e.target.value)}
                  >
                    <option value="">เลือกวัคซีน</option>
                    {dataVaccines
                      .filter(v => !formRows.some(r => r.vaccine === v.vaccineName && r !== row))
                      .map((v, i) => (
                        <option key={i} value={v.vaccineName}>{v.vaccineName}</option>
                      ))
                    }
                  </select>

                  {/* ปุ่ม + เพิ่มแถว */}
                  {index === formRows.length - 1 && (
                    <button
                      className="bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105 transition p-2 rounded-full"
                      onClick={handleAddRow}
                    >
                      <FaPlus size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>


            <div className="mt-6 text-center space-x-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition" onClick={handleSubmit}>บันทึก</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow transition" onClick={() => setIsAddModalOpen(false)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/*  Modal แก้ไข  */}
      {editAge !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
              แก้ไขข้อมูลวัคซีน อายุ {mapAgeToText(editAge)}
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {editVaccines.map((vaccine, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={vaccine}
                    onChange={(e) => {
                      const newVaccines = [...editVaccines];
                      newVaccines[index] = e.target.value;
                      setEditVaccines(newVaccines);
                    }}
                  >
                    <option value="">เลือกวัคซีน</option>
                    {dataVaccines.map((v, i) => (
                      <option key={i} value={v.vaccineName}>{v.vaccineName}</option>
                    ))}
                  </select>

                  <button
                    className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-full"
                    onClick={() => {
                      const newVaccines = editVaccines.filter((_, i) => i !== index);
                      setEditVaccines(newVaccines);
                    }}
                  >
                    ลบ
                  </button>
                </div>
              ))}

              <button
                className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded"
                onClick={() => setEditVaccines([...editVaccines, ''])}
              >
                เพิ่มวัคซีน
              </button>
            </div>


            <div className="mt-6 text-center space-x-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition" onClick={handleUpdate}>บันทึกการแก้ไข</button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow transition" onClick={() => {
                setEditAge(null);
                setEditVaccines([]);
              }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VaccinePage;
