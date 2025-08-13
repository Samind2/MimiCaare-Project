import React, { useEffect, useState } from 'react';
import standardDevService from '../../../service/standardDev.service';
import childService from '../../../service/child.service';
import receiveDevelopService from '../../../service/receiveDev.service';
import { toast } from 'react-toastify';
import { FaChevronDown } from "react-icons/fa";

const ViewDev = () => {
  const [selectedAgeRange, setSelectedAgeRange] = useState(1);
  const [devs, setDevs] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [checkStates, setCheckStates] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const ageRanges = [1, 2, 4, 6, 8, 9, 12, 15, 17, 18, 24, 29, 30, 39, 41, 42, 48, 54, 59, 60, 66, 72, 78];

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

  useEffect(() => {
    fetchAssessmentOrStandard();
  }, [selectedChild, selectedAgeRange]);

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
        if (err.response && err.response.status === 404) {
          setDevs(standardList);
          setCheckStates({});
          setIsSubmitted(false);
          return;
        } else {
          throw err;
        }
      }

      // ใช้ filter + sort หา receive ล่าสุดของอายุ
      const receivedDataForAgeList = receivedList
        .filter(item => Number(item.ageRange) === Number(selectedAgeRange))
        .sort((a, b) => new Date(b.receiveDate) - new Date(a.receiveDate));

      const receivedDataForAge = receivedDataForAgeList[0]; // รายการล่าสุด

      if (receivedDataForAge) {
        const estimates = receivedDataForAge?.developments || [];
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

  const handleAnswer = (value) => {
    setCheckStates(prev => ({ ...prev, [currentIndex]: value }));

    if (currentIndex < devs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  // 
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

    const statusList = devs.map((_, idx) => checkStates[idx] === 'done');

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
        status: statusList
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
    <div className="p-6 mx-auto w-full max-w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">ประเมินพัฒนาการ</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-xl font-semibold">พัฒนาการของเด็กช่วงอายุ {ageRangeToText(selectedAgeRange)}</h2>

        <div className="flex gap-4">
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              className="btn bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-xl text-lg w-48 text-left flex justify-between items-center overflow-hidden"
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
                .filter(child => child.id !== selectedChild?.id) // กรองเด็กที่เลือกออก
                .map((child) => (
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

      {!selectedChild ? (
        <div className="text-center text-red-500 font-semibold mt-6">
          กรุณาเลือกเด็กก่อนเพื่อทำการประเมิน
        </div>
      ) : !isSubmitted ? (
        // โหมดทีละข้อ
        devs.length > 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">
              ข้อ {currentIndex + 1} / {devs.length}
            </h2>
            <p className="text-gray-600 mb-2">ด้าน: {devs[currentIndex].category}</p>
            <p className="font-medium mb-4">{devs[currentIndex].detail}</p>
            {devs[currentIndex].image && (
              <img
                src={devs[currentIndex].image}
                alt=""
                className="mx-auto w-32 h-32 object-cover rounded border mb-4"
              />
            )}
            <p className="text-sm text-gray-500 mb-6">{devs[currentIndex].note}</p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleAnswer('done')}
                className="px-5 py-2 bg-green-200 text-green-900 rounded-lg hover:bg-green-300"
              >
                ทำได้
              </button>
              <button
                onClick={() => handleAnswer('not-done')}
                className="px-5 py-2 bg-red-200 text-red-900 rounded-lg hover:bg-red-300"
              >
                ทำไม่ได้
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">ไม่มีข้อมูลในช่วงอายุนี้</p>
        )
      ) : (
        // โหมดสรุปผล
        <div>
          <div className="overflow-x-auto mb-6">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-200 text-gray-700 text-sm">
                <tr>
                  <th className="text-center">ผลประเมิน</th>
                  <th className="text-left">ด้านพัฒนาการ</th>
                  <th className="text-left">พัฒนาการตามวัย</th>
                  <th className="text-center">รูปภาพ</th>
                  <th className="text-center">ข้อแนะนำ</th>
                </tr>
              </thead>
              <tbody>
                {devs.map((item, idx) => (
                  <tr key={idx} className={checkStates[idx] === 'not-done' ? 'bg-red-100' : ''}>
                    <td className="text-center">
                      {checkStates[idx] === 'done' ? '✓ ทำได้' : '✗ ทำไม่ได้'}
                    </td>
                    <td>{item.category}</td>
                    <td>{item.detail}</td>
                    <td className="text-center">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-24 h-24 object-cover rounded border" />
                      ) : (
                        <span className="text-gray-400 italic">ไม่มีรูป</span>
                      )}
                    </td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDev;
