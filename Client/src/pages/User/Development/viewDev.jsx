import React, { useEffect, useState } from 'react';
import standardDevService from '../../../service/standardDev.service';
import childService from '../../../service/child.service';
import receiveDevelopService from '../../../service/receiveDev.service';
import { toast } from 'react-toastify';
import { FaChevronDown } from "react-icons/fa";


const ViewDev = () => {
  // State ตัวแปรหลัก
  const [selectedAgeRange, setSelectedAgeRange] = useState(1);
  const [devs, setDevs] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [checkStates, setCheckStates] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ช่วงอายุทั้งหมดที่มีในระบบ
  const ageRanges = [1, 2, 4, 6, 8, 9, 12, 15, 17, 18, 24, 29, 30, 39, 41, 42, 48, 54, 59, 60, 66, 72, 78];

  // แปลงตัวเลขช่วงอายุเป็นข้อความ
  const ageRangeToText = (ageInt) => {
    switch (ageInt) {
      case 1: return 'แรกเกิด - 1 เดือน';
      case 2: return '1 - 2 เดือน';
      case 4: return '3 - 4 เดือน';
      case 6: return '5 - 6 เดือน';
      case 8: return '7 - 8 เดือน';
      case 9: return '9 เดือน';
      case 12: return '10 - 12 เดือน';
      default: {
        const years = Math.floor(ageInt / 12);
        const months = ageInt % 12;
        return months === 0 ? `${years} ปี` : `${years} ปี ${months} เดือน`;
      }
    }
  };

  // โหลดรายชื่อเด็ก
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childService.getChildren();
        const data = res.data.children || res.data || [];
        setChildren(data);
        if (data.length > 0) setSelectedChild(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChildren();
  }, []);

  // โหลดข้อมูลพัฒนาการเมื่อลูกหรือช่วงอายุเปลี่ยน
  useEffect(() => {
    fetchAssessmentOrStandard();
  }, [selectedChild, selectedAgeRange]);

  // ดึงข้อมูลมาตรฐานหรือที่เคยประเมินแล้ว
  const fetchAssessmentOrStandard = async () => {
    if (!selectedChild) return;

    try {
      const resStandard = await standardDevService.getDevelop();
      const allDevs = resStandard.data.data || [];
      const selectedStandard = allDevs.find(dev => Number(dev.ageRange) === Number(selectedAgeRange));
      const standardList = selectedStandard ? selectedStandard.developments : [];

      let receivedList = [];

      try {
        const resReceived = await receiveDevelopService.getReceiveDevelopByChildId(selectedChild.id);
        receivedList = resReceived.data["had receive"] || [];
      } catch (err) {
        // ถ้า error 404 = ยังไม่มีการประเมิน => แสดงเฉพาะ standard
        if (err.response && err.response.status === 404) {
          setDevs(standardList);
          setCheckStates({});
          setIsSubmitted(false);
          return;
        } else {
          throw err; // กรณี error อื่น เช่น 500
        }
      }

      const receivedDataForAge = receivedList.find(item => Number(item.ageRange) === Number(selectedAgeRange));

      if (receivedDataForAge) {
        const estimates = receivedDataForAge?.Estimates || [];
        const statusMap = {};
        estimates.forEach(item => {
          const key = `${item.category}-${item.detail}`;
          statusMap[key] = item.status;
        });

        const merged = standardList.map(item => ({
          ...item,
          status: statusMap[`${item.category}-${item.detail}`] ?? null,
        }));

        const newCheckStates = {};
        merged.forEach((dev, idx) => {
          if (dev.status === true) newCheckStates[idx] = 'done';
          else if (dev.status === false) newCheckStates[idx] = 'not-done';
        });

        setDevs(merged);
        setCheckStates(newCheckStates);
        setIsSubmitted(true);
      } else {
        setDevs(standardList);
        setCheckStates({});
        setIsSubmitted(false);
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(err);
    }
  };


  const handleCheckChange = (index, value) => {
    if (!isSubmitted) {
      setCheckStates(prev => ({ ...prev, [index]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild || devs.length === 0) {
      toast.error("กรุณาเลือกเด็ก และช่วงอายุให้เรียบร้อย");
      return;
    }

    const keys = Object.keys(checkStates);
    if (keys.length < devs.length) {
      toast.error("กรุณาประเมินพัฒนาการให้ครบทุกข้อ");
      return;
    }

    const Estimates = devs.map((item, idx) => ({
      status: checkStates[idx] === 'done',
      category: item.category,
      detail: item.detail,
      image: item.image || null,
    }));

    const status = Estimates.every(e => e.status === true);

    try {
      const standardDev = await standardDevService.getDevelop();
      const devData = standardDev.data.data.find(dev => dev.ageRange === selectedAgeRange);
      if (!devData) {
        toast.error("ไม่พบข้อมูลพัฒนาการมาตรฐาน");
        return;
      }

      const payload = {
        childId: selectedChild.id,
        standardDevelopId: devData.id,
        ageRange: selectedAgeRange,
        status,
        Estimates,
      };

      await receiveDevelopService.addReceiveDevelop(payload);
      toast.success("บันทึกข้อมูลสำเร็จ");
      setIsSubmitted(true);
      await fetchAssessmentOrStandard();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">ประเมินพัฒนาการ</h1>

      {/* ส่วนเลือกเด็กและอายุ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-semibold">พัฒนาการของเด็กช่วงอายุ {ageRangeToText(selectedAgeRange)}</h2>

        <div className="flex gap-4">
          {/* ปุ่มเลือกเด็ก */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              className="btn bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-xl text-lg w-48 text-left truncate"
            >
              {selectedChild
                ? `${selectedChild.firstName} ${selectedChild.lastName}`
                : "เลือกเด็ก"}
              <FaChevronDown className="inline ml-2" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-3 shadow-lg bg-pink-50 rounded-xl w-56 max-h-60 overflow-auto"
            >
              {children.map((child) => (
                <li key={child.id}>
                  <a
                    className="hover:bg-red-200 rounded-md p-2 cursor-pointer"
                    onClick={() => setSelectedChild(child)}
                  >
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ปุ่มเลือกอายุ */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              className="btn bg-blue-200 text-blue-800 hover:bg-blue-300 rounded-xl text-lg cursor-pointer"
            >
              {ageRangeToText(selectedAgeRange)}
              <FaChevronDown className="inline ml-2" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content block p-3 shadow-lg bg-blue-100 rounded-xl w-56 max-h-60 overflow-y-auto space-y-2"
            >
              {ageRanges.map((range) => (
                <li key={range}>
                  <a
                    className="hover:bg-blue-300 rounded-md p-2 cursor-pointer"
                    onClick={() => setSelectedAgeRange(range)}
                  >
                    {ageRangeToText(range)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ตารางแสดงรายการพัฒนาการ */}
      {!selectedChild ? (
        <div className="text-center text-red-500 font-semibold mt-6">กรุณาเลือกเด็กก่อนเพื่อทำการประเมิน</div>
      ) : (
        <div className="overflow-x-auto mb-10">
          <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-md">
            <thead className="bg-[#F5F7FA] text-gray-700 text-sm uppercase font-bold">
              <tr>
                <th className="w-32 py-4 px-3 text-center">ประเมิน</th>
                <th className="w-64 py-4 px-3 text-left">ด้านพัฒนาการ</th>
                <th className="py-4 px-3 text-left">พัฒนาการตามวัย</th>
                <th className="w-32 py-4 px-3 text-center">รูปภาพ</th>
              </tr>
            </thead>
            <tbody>
              {devs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500 italic">ไม่มีข้อมูลในช่วงอายุนี้</td></tr>
              ) : (
                devs.map((item, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 transition ${checkStates[idx] === 'not-done' ? 'bg-red-100' : ''}`}>
                    <td className="py-4 px-3 text-center align-top">
                      <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center space-x-2">
                          <input id='VD-01' type="radio" name={`dev-${idx}`} checked={checkStates[idx] === 'done'} onChange={() => handleCheckChange(idx, 'done')} disabled={isSubmitted} />
                          <span>ทำได้</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input id='VD-02' type="radio" name={`dev-${idx}`} checked={checkStates[idx] === 'not-done'} onChange={() => handleCheckChange(idx, 'not-done')} disabled={isSubmitted} />
                          <span>ทำไม่ได้</span>
                        </label>
                      </div>
                    </td>
                    <td className="py-4 px-3 align-top">{item.category}</td>
                    <td className="py-4 px-3 align-top">{item.detail}</td>
                    <td className="py-4 px-3 text-center align-top">
                      {item.image ? <img src={item.image} alt="" className="w-24 h-24 object-cover rounded border" /> : <span className="text-gray-400 italic">ไม่มีรูป</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ปุ่มบันทึกหรือแก้ไข */}
      <div className="text-center mt-6">
        {!selectedChild ? (
          <button className="bg-gray-400 text-white px-8 py-3 rounded-md" disabled>กรุณาเลือกเด็กก่อน</button>
        ) : !isSubmitted ? (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md" onClick={handleSubmit}>บันทึก</button>
        ) : (
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-md" onClick={() => setIsSubmitted(false)}>แก้ไข</button>
        )}
      </div>
    </div>
  );
};

export default ViewDev;
