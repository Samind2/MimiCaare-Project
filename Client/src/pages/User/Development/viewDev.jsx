import React, { useEffect, useState } from 'react';
import standardDevService from '../../../service/standardDev.service';
import childService from '../../../service/child.service';
import receiveDevelopService from '../../../service/receiveDev.service';
import { toast } from 'react-toastify';
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose, IoMdCheckmark, IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";



const ViewDev = () => {
  // STATE
  const [selectedAgeRange, setSelectedAgeRange] = useState(1); // ค่าเริ่มต้นเป็น 1 เดือน
  const [standardDevelopments, setStandardDevelopments] = useState([]); // ข้อมูลพัฒนาการมาตรฐาน
  const [childrenList, setChildrenList] = useState([]); // ข้อมูลเด็กทั้งหมด
  const [selectedChild, setSelectedChild] = useState(null); // เด็กที่เลือก
  const [developmentStatusMap, setDevelopmentStatusMap] = useState({}); // เก็บสถานะ“ทำได้”หรือ“ทำไม่ได้”ของแต่ละข้อ
  const [isAssessmentSubmitted, setIsAssessmentSubmitted] = useState(false); // เช็คว่าประเมินแล้วหรือยัง
  const [currentDevelopmentIndex, setCurrentDevelopmentIndex] = useState(0); // ดึงข้อมูลที่บันทึกข้อปัจจุบันมาแสดง
  //const [lastAssessmentMap, setLastAssessmentMap] = useState(null); // เก็บสถานะการประเมินครั้งล่าสุดสำหรับปุ่มประเมินใหม่

  const ageRanges = [1, 2, 4, 6, 8, 9, 12, 15, 17, 18, 24, 29, 30, 39, 41, 42, 48, 54, 59, 60, 66, 72, 78];

  const ageRangeToText = (age) => {
    switch (age) {
      case 1: return 'แรกเกิด - 1 เดือน';
      case 2: return '1 - 2 เดือน';
      case 4: return '3 - 4 เดือน';
      case 6: return '5 - 6 เดือน';
      case 8: return '7 - 8 เดือน';
      case 9: return '9 เดือน';
      case 12: return '10 - 12 เดือน';
      default: {
        const years = Math.floor(age / 12);
        const months = age % 12;
        return months === 0 ? `${years} ปี` : `${years} ปี ${months} เดือน`;
      }
    }
  };

  // โหลดข้อมูลเด็ก
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childService.getChildren();
        const data = res.data.children || res.data || [];
        setChildrenList(data);
        if (data.length > 0) setSelectedChild(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChildren();
  }, []);

  // โหลดข้อมูลพัฒนาการ
  useEffect(() => {
    fetchStandardOrReceivedDevelopments();
  }, [selectedChild, selectedAgeRange]);

  const fetchStandardOrReceivedDevelopments = async () => {
    if (!selectedChild) return;

    try {
      const resStandard = await standardDevService.getDevelop();
      const allStandards = resStandard.data.data || [];
      const ageStandard = allStandards.find(dev => Number(dev.ageRange) === Number(selectedAgeRange));
      const standardList = ageStandard ? ageStandard.developments : [];

      let receivedDevelopments = [];
      try {
        const resReceived = await receiveDevelopService.getReceiveDevelopByChildId(selectedChild.id);
        receivedDevelopments = resReceived.data["had receive"] || [];
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setStandardDevelopments(standardList);
          setDevelopmentStatusMap({});
          setIsAssessmentSubmitted(false);
          return;
        } else {
          throw err;
        }
      }

      const receivedForAge = receivedDevelopments
        .filter(item => Number(item.ageRange) === Number(selectedAgeRange))
        .sort((a, b) => new Date(b.receiveDate) - new Date(a.receiveDate))[0];

      if (receivedForAge) {
        const statusMapping = {};
        receivedForAge.developments.forEach(item => {
          const key = `${item.category}-${item.detail}`;
          statusMapping[key] = item.status;
        });

        const mergedDevelopments = standardList.map(item => ({
          ...item,
          status: statusMapping[`${item.category}-${item.detail}`] ?? null,
        }));

        const newStatusMap = {};
        mergedDevelopments.forEach((dev, idx) => {
          if (dev.status === true) newStatusMap[idx] = 'done';
          else if (dev.status === false) newStatusMap[idx] = 'not-done';
        });

        setStandardDevelopments(mergedDevelopments);
        setDevelopmentStatusMap(newStatusMap);
        setIsAssessmentSubmitted(true);
      } else {
        setStandardDevelopments(standardList);
        setDevelopmentStatusMap({});
        setIsAssessmentSubmitted(false);
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      console.error(err);
    }
  };

  // ฟังก์ชันประเมินพัฒนาการ
  const handleDevelopmentAnswer = (value) => {
    setDevelopmentStatusMap(prev => ({ ...prev, [currentDevelopmentIndex]: value }));
    const updatedMap = { ...developmentStatusMap, [currentDevelopmentIndex]: value };

    if (currentDevelopmentIndex < standardDevelopments.length - 1) {
      setCurrentDevelopmentIndex(currentDevelopmentIndex + 1);
    } else {
      submitAssessment(updatedMap);
    }
  };

  const submitAssessment = async (finalStatusMap) => {
    if (!selectedChild || standardDevelopments.length === 0) {
      toast.error("กรุณาเลือกเด็ก และช่วงอายุให้เรียบร้อย");
      return;
    }

    const answeredKeys = Object.keys(finalStatusMap);
    if (answeredKeys.length < standardDevelopments.length) {
      toast.error("กรุณาประเมินพัฒนาการให้ครบทุกข้อ");
      return;
    }

    const statusList = standardDevelopments.map((_, idx) => finalStatusMap[idx] === 'done');

    try {
      const standardDevData = await standardDevService.getDevelop();
      const devDataForAge = standardDevData.data.data.find(dev => dev.ageRange === selectedAgeRange);
      if (!devDataForAge) {
        toast.error("ไม่พบข้อมูลพัฒนาการมาตรฐาน");
        return;
      }

      const payload = {
        childId: selectedChild.id,
        standardDevelopId: devDataForAge.id,
        ageRange: selectedAgeRange,
        status: statusList
      };

      await receiveDevelopService.addReceiveDevelop(payload);
      toast.success("บันทึกข้อมูลสำเร็จ", { autoClose: 1500 });
      setIsAssessmentSubmitted(true);
      //setLastAssessmentMap(finalStatusMap);
      await fetchStandardOrReceivedDevelopments();
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
          {/* เลือกเด็ก */}
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              className="btn bg-pink-100 text-pink-800 hover:bg-pink-200 rounded-xl text-lg w-48 text-left flex justify-between items-center overflow-hidden"
            >
              <span className="truncate inline-block max-w-[85%]">
                {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : "เลือกเด็ก"}
              </span>
              <FaChevronDown className="inline ml-2" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-3 shadow-lg bg-pink-50 rounded-xl w-56 max-h-60 overflow-auto"
            >
              {childrenList.filter(child => child.id !== selectedChild?.id).map((child) => (
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

          {/* เลือกช่วงอายุ */}
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

      {/* แสดงผล */}
      {!selectedChild ? (
        <div className="text-center text-red-500 font-semibold mt-6">
          กรุณาเลือกเด็กก่อนเพื่อทำการประเมิน
        </div>
      ) : !isAssessmentSubmitted ? (
        standardDevelopments.length > 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">
              ข้อ {currentDevelopmentIndex + 1} / {standardDevelopments.length}
            </h2>
            <p className="text-gray-600 mb-2">ด้าน: {standardDevelopments[currentDevelopmentIndex].category}</p>
            <p className="font-medium mb-4">{standardDevelopments[currentDevelopmentIndex].detail}</p>
            {standardDevelopments[currentDevelopmentIndex].image && (
              <img
                src={standardDevelopments[currentDevelopmentIndex].image}
                alt=""
                className="mx-auto w-32 h-32 object-cover rounded border mb-4"
              />
            )}
            <p className="text-sm text-gray-500 mb-6">{standardDevelopments[currentDevelopmentIndex].note}</p>

            <div className="flex justify-center gap-6">
              {/* ปุ่มย้อนกลับ */}
              {currentDevelopmentIndex > 0 && (
                <button
                  onClick={() => setCurrentDevelopmentIndex(currentDevelopmentIndex - 1)}
                  className="px-5 py-2 bg-yellow-200 text-yellow-900 rounded-lg hover:bg-yellow-300"
                >
                  ย้อนกลับ
                </button>
              )}

              {/* ปุ่มทำได้ */}
              <button
                onClick={() => handleDevelopmentAnswer('done')}
                className={`px-5 py-2 rounded-lg flex items-center justify-center gap-2
    ${developmentStatusMap[currentDevelopmentIndex] === 'done'
                    ? "bg-green-600 text-white"
                    : "bg-green-200 text-green-900 hover:bg-green-400"}`}
              >
                ทำได้
                {developmentStatusMap[currentDevelopmentIndex] === 'done' && (
                  <IoMdCheckmarkCircleOutline className="text-white text-xl" />
                )}
              </button>

              {/* ปุ่มทำไม่ได้ */}
              <button
                onClick={() => handleDevelopmentAnswer('not-done')}
                className={`px-5 py-2 rounded-lg flex items-center justify-center gap-2
    ${developmentStatusMap[currentDevelopmentIndex] === 'not-done'
                    ? "bg-red-600 text-white"
                    : "bg-red-200 text-red-900 hover:bg-red-400"}`}
              >
                ทำไม่ได้
                {developmentStatusMap[currentDevelopmentIndex] === 'not-done' && (
                  <IoMdCloseCircleOutline className="text-white text-xl" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">ไม่มีข้อมูลในช่วงอายุนี้</p>
        )
      ) : (
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
                {standardDevelopments.map((item, idx) => (
                  <tr key={idx}>
                    <td
                      className={`text-center font-bold ${developmentStatusMap[idx] === "done"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {developmentStatusMap[idx] === "done" ? (
                        <IoMdCheckmark className="inline text-xl" />
                      ) : (
                        <IoMdClose className="inline text-xl" />
                      )}
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

          {/* ปุ่มประเมินใหม่
          <div className="text-center">
            <button
              onClick={() => {
                setIsAssessmentSubmitted(false);
                setCurrentDevelopmentIndex(0);
                setDevelopmentStatusMap(lastAssessmentMap || {});
              }}
              className="px-6 py-2 bg-yellow-300 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-400"
            >
              🔄 ประเมินใหม่
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ViewDev;
