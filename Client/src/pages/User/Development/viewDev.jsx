import React, { useEffect, useState } from 'react';
import standardDevService from '../../../service/standardDev.service';
import childService from "../../../service/child.service";

const ViewDev = () => {
  // ใช้ number แทน string
  const [selectedAgeRange, setSelectedAgeRange] = useState(2); // เริ่มต้นเป็นเลข 2 ตามฐานข้อมูล
  const [devs, setDevs] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const [checkStates, setCheckStates] = useState({});

  // กำหนดช่วงอายุเป็น array ของ int (เดือน)
  const ageRanges = [
    1,  // แรกเกิด - 1 เดือน
    2,  // 1 - 2 เดือน
    4,  // 3 - 4 เดือน
    6,  // 5 - 6 เดือน
    8,  // 7 - 8 เดือน
    9,  // 9 เดือน
    12, // 10 - 12 เดือน
    15, // 13 - 15 เดือน
    17, // 16 - 17 เดือน
    18, // 18 เดือน
    24, // 19 - 24 เดือน
    29, // 25 - 29 เดือน
    30, // 30 เดือน
    39, // 31 - 39 เดือน
    41, // 37 - 41 เดือน (ซ้ำช่วง)
    42, // 42 เดือน
    48, // 43 - 48 เดือน
    54, // 49 - 54 เดือน
    59, // 55 - 59 เดือน
    60, // 60 เดือน
    66, // 61 - 66 เดือน
    72, // 67 - 72 เดือน
    78  // 73 - 78 เดือน
  ];

  // ฟังก์ชันแปลง int เป็นข้อความช่วงอายุ
  const ageRangeToText = (ageInt) => {
    switch (ageInt) {
      case 1: return 'แรกเกิด - 1 เดือน';
      case 2: return '1 - 2 เดือน';
      case 4: return '3 - 4 เดือน';
      case 6: return '5 - 6 เดือน';
      case 8: return '7 - 8 เดือน';
      case 9: return '9 เดือน';
      case 12: return '10 - 12 เดือน';
      case 15:
      case 17:
      case 18:
      case 24:
      case 29:
      case 30:
      case 39:
      case 41:
      case 42:
      case 48:
      case 54:
      case 59:
      case 60:
      case 66:
      case 72:
      case 78:
        {
          const years = Math.floor(ageInt / 12);
          const months = ageInt % 12;
          if (months === 0) return `${years} ปี`;
          return `${years} ปี ${months} เดือน`;
        }
      default: {
        const years = Math.floor(ageInt / 12);
        const months = ageInt % 12;
        if (months === 0) return `${years} ปี`;
        return `${years} ปี ${months} เดือน`;
      }
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await standardDevService.getDevelop();
        const allDevs = res.data.data || [];

        // เทียบ selectedAgeRange เป็น number
        const selectedData = allDevs.find(dev => Number(dev.ageRange) === Number(selectedAgeRange));
        const filteredDevs = selectedData ? selectedData.developments : [];

        setDevs(filteredDevs);
        setCheckStates({});
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedAgeRange]);

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
        console.error(err);
      }
    };

    fetchChildren();
  }, []);

  const handleCheckChange = (index, value) => {
    setCheckStates(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">ประเมินพัฒนาการ</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-semibold">
          พัฒนาการของเด็กช่วงอายุ {ageRangeToText(selectedAgeRange)}
        </h2>
        <div className="flex gap-4">
          {/* Dropdown เลือกเด็ก */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn w-40 h-12 px-3 text-left overflow-hidden whitespace-nowrap text-ellipsis"
              title={selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : "เลือกเด็ก"}
            >
              <span className="truncate block w-full">
                {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : "เลือกเด็ก"}
              </span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {children.map(child => (
                <li key={child._id}>
                  <a onClick={() => setSelectedChild(child)}>
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dropdown เลือกช่วงอายุ */}
          <div className="dropdown dropdown-hover">
            <label
              tabIndex={0}
              className="btn w-40 h-12 px-3 text-left overflow-hidden whitespace-nowrap text-ellipsis"
              title={ageRangeToText(selectedAgeRange)}
            >
              {ageRangeToText(selectedAgeRange)}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {ageRanges.map(range => (
                <li key={range}>
                  <a onClick={() => setSelectedAgeRange(range)}>
                    {ageRangeToText(range)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-md">
          <thead className="bg-[#F5F7FA] text-gray-700 text-sm uppercase font-bold">
            <tr>
              <th className="w-32 py-4 px-3 border-b border-gray-300 text-center">ประเมิน</th>
              <th className="w-64 py-4 px-3 border-b border-gray-300 text-left">ด้านพัฒนาการ</th>
              <th className="py-4 px-3 border-b border-gray-300 text-left">พัฒนาการตามวัย</th>
              <th className="w-32 py-4 px-3 border-b border-gray-300 text-center">รูปภาพ</th>
            </tr>
          </thead>
          <tbody>
            {devs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500 italic">
                  ไม่มีข้อมูลในช่วงอายุนี้
                </td>
              </tr>
            ) : (
              devs.map((item, idx) => (
                <tr
                  key={`${item.category}-${item.detail}-${idx}`}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-3 border-b border-gray-200 text-center align-top">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center space-x-2 cursor-pointer hover:text-green-600">
                        <input
                          type="radio"
                          name={`dev-assess-${idx}`}
                          checked={checkStates[idx] === 'done'}
                          onChange={() => handleCheckChange(idx, 'done')}
                          className="text-green-600"
                        />
                        <span>ทำได้</span>
                      </label>
                      <label className="inline-flex items-center space-x-2 cursor-pointer hover:text-red-600">
                        <input
                          type="radio"
                          name={`dev-assess-${idx}`}
                          checked={checkStates[idx] === 'not-done'}
                          onChange={() => handleCheckChange(idx, 'not-done')}
                          className="text-red-600"
                        />
                        <span>ทำไม่ได้</span>
                      </label>
                    </div>
                  </td>
                  <td className="py-4 px-3 border-b border-gray-200 text-gray-800 font-medium align-top">
                    {item.category}
                  </td>
                  <td className="py-4 px-3 border-b border-gray-200 align-top">
                    <div className="text-gray-700">{item.detail}</div>
                  </td>
                  <td className="py-4 px-3 border-b border-gray-200 text-center align-top">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt="พัฒนาการ"
                        className="w-24 h-24 object-cover rounded border border-gray-300 mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400 italic">ไม่มีรูป</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-md shadow-md transition">
          บันทึก
        </button>
      </div>
    </div>
  );
};

export default ViewDev;
