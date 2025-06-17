import React, { useEffect, useState } from 'react';
import standardDevService from '../../../service/standardDev.service';
import childService from "../../../service/child.service";

const ViewDev = () => {
  const [devs, setDevs] = useState([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState('แรกเกิด - 1 เดือน');
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // เก็บสถานะเลือก "ทำได้" หรือ "ทำไม่ได้" ของแต่ละ item
  const [checkStates, setCheckStates] = useState({});

  const ageRanges = [
    'แรกเกิด - 1 เดือน',
    '2 - 3 เดือน',
    '4 - 6 เดือน',
    '1-2 ปี'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await standardDevService.getDevelop();
        const allDevs = res.data.data || [];

        const selectedData = allDevs.find(dev => dev.ageRange === selectedAgeRange);
        const filteredDevs = selectedData ? selectedData.developments : [];

        setDevs(filteredDevs);
        setCheckStates({}); // เคลียร์สถานะ checkbox ทุกครั้งที่เปลี่ยนช่วงอายุ
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [selectedAgeRange]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childService.getChildren(); // ใช้ getChildren จาก service
        const data = res.data.children || res.data || []; // ปรับตามโครงสร้าง response จริง
        setChildren(data);
        if (data.length > 0) {
          setSelectedChild(data[0]); // ตั้งค่าคนแรกเป็น default
        }
      } catch (err) {
        console.error("Error fetching children", err);
      }
    };

    fetchChildren();
  }, []);

  // ฟังก์ชันจัดการเลือก radio
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
        <h2 className="text-xl font-semibold">พัฒนาการของเด็กช่วงอายุ {selectedAgeRange}</h2>
        <div className="flex gap-4">
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn w-40 h-12 px-3 text-left overflow-hidden whitespace-nowrap text-ellipsis"
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
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {children.map((child) => (
                <li key={child._id}>
                  <a onClick={() => setSelectedChild(child)}>
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="dropdown dropdown-hover">
            <label
              tabIndex={0}
              className="btn w-40 h-12 px-3 text-left overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {selectedAgeRange}
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {ageRanges.map((range) => (
                <li key={range}>
                  <a onClick={() => setSelectedAgeRange(range)}>{range}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="table-auto w-full border border-gray-300 rounded-md shadow-sm">
          <thead className="bg-gray-100 text-sm font-semibold text-gray-700">
            <tr>
              <th className="w-32 py-3 border-b border-gray-300">ประเมิน</th>
              <th className="w-64 py-3 border-b border-gray-300">ด้านพัฒนาการ</th>
              <th className="py-3 border-b border-gray-300">พัฒนาการตามวัย</th>
            </tr>
          </thead>
          <tbody>
            {devs.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500 italic">
                  ไม่มีข้อมูลในช่วงอายุนี้
                </td>
              </tr>
            ) : (
              devs.map((item, idx) => (
                <tr key={idx} className="align-top hover:bg-gray-50 transition-colors">
                  <td className="py-4 border-b border-gray-200 text-center">
                    <div className="flex flex-col space-y-1">
                      <label className="inline-flex items-center cursor-pointer space-x-2 px-2 py-1 rounded hover:bg-gray-100">
                        <input
                          type="radio"
                          name={`dev-assess-${idx}`}
                          checked={checkStates[idx] === 'done'}
                          onChange={() => handleCheckChange(idx, 'done')}
                          className="cursor-pointer"
                        />
                        <span>ทำได้</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer space-x-2 px-2 py-1 rounded hover:bg-gray-100">
                        <input
                          type="radio"
                          name={`dev-assess-${idx}`}
                          checked={checkStates[idx] === 'not-done'}
                          onChange={() => handleCheckChange(idx, 'not-done')}
                          className="cursor-pointer"
                        />
                        <span>ทำไม่ได้</span>
                      </label>
                    </div>
                  </td>
                  <td className="py-4 border-b border-gray-200 font-medium text-gray-800">{item.category}</td>
                  <td className="py-4 border-b border-gray-200">
                    <div className="flex flex-col gap-2">
                      <span>{item.detail}</span>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt="dev"
                          className="w-24 h-24 object-contain rounded-md border"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button className="btn btn-primary px-8 py-3 font-semibold text-lg rounded-md shadow-md hover:shadow-lg transition-shadow">
          บันทึก
        </button>
      </div>
    </div>
  );
};

export default ViewDev;
