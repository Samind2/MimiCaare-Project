import React, { useState, useEffect } from 'react';
import standardDevService from "../../service/standardDev.service";

const AddDevelopment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState('');
    const [developmentList, setDevelopmentList] = useState([
        { category: '', detail: '' },
        { category: '', detail: '' },
        { category: '', detail: '' },
        { category: '', detail: '' },
        { category: '', detail: '' },
    ]);
    const [allDevelopments, setAllDevelopments] = useState([]);

    const categoryOptions = [
        "การเคลื่อนไหวพื้นฐาน ",
        "การใช้กล้ามเนื้อมัดเล็กและสติปัญญา",
        "ด้านการเข้าใจภาษา",
        "ด้านการใช้ภาษา",
        "ด้านการช่วยเหลือตัวเองและสังคม",
    ];

    const detailOptions = [
        "พัฒนากล้ามเนื้อใหญ่",
        "พัฒนากล้ามเนื้อเล็ก",
        "พูดคำง่ายๆ",
        "เข้าใจคำสั่งง่ายๆ",
        "เล่นกับเพื่อน",
        "แสดงอารมณ์",
    ];

    useEffect(() => {
        fetchDevelopments();
    }, []);

    const fetchDevelopments = async () => {
        try {
            const res = await standardDevService.getDevelop();
            let data = res.data.data; // หรือ res.data ตามโครงสร้าง API

            // เรียงข้อมูลจากมากไปน้อย ตามจำนวน developments ในแต่ละ ageRange
            data.sort((a, b) => b.developments.length - a.developments.length);

            setAllDevelopments(data);
        } catch (err) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err);
        }
    };
    const handleSubmit = async () => {
        const validDevelopments = developmentList.filter(
            (d) => d.category && d.detail
        );

        if (!ageRange) {
            alert('กรุณาเลือกช่วงอายุ');
            return;
        }

        if (validDevelopments.length === 0) {
            alert('กรุณากรอกพัฒนาการอย่างน้อยหนึ่งรายการ');
            return;
        }

        const newData = {
            ageRange,
            developments: validDevelopments,
        };

        try {
            await standardDevService.addStandardDev(newData);
            setIsModalOpen(false);
            setAgeRange('');
            setDevelopmentList([
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
            ]);
            fetchDevelopments(); // refresh ตาราง
        } catch (err) {
            console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
        }
    };

    const handleDevelopmentChange = (index, key, value) => {
        const updatedList = [...developmentList];
        updatedList[index][key] = value;
        setDevelopmentList(updatedList);
    };

    const handleDelete = async (ageRangeToDelete) => {
        if (window.confirm(`คุณต้องการลบข้อมูลช่วงอายุ ${ageRangeToDelete} ใช่หรือไม่?`)) {
            try {
                await standardDevService.deleteStandardDev(ageRangeToDelete);
                fetchDevelopments();
            } catch (error) {
                console.error('ลบข้อมูลไม่สำเร็จ', error);
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">การจัดการพัฒนาการ</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-700 hover:bg-purple-800 text-white text-sm px-4 py-2 rounded"
                >
                    เพิ่มแผนการพัฒนาการ
                </button>
            </div>

            {/* ตารางแสดงข้อมูล */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead className="bg-gray-100 text-gray-700 font-medium">
                        <tr>
                            <th className="px-4 py-2">ช่วงอายุ</th>
                            <th className="px-4 py-2">พัฒนาการ</th>
                            <th className="px-4 py-2">รายละเอียด</th>
                            <th className="px-4 py-2">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allDevelopments.length > 0 ? (
                            allDevelopments.map((dev, idx) =>
                                dev.developments.length > 0 ? (
                                    dev.developments.map((item, subIdx) => (
                                        <tr key={`${idx}-${subIdx}`} className="bg-white shadow rounded">
                                            {subIdx === 0 && (
                                                <td rowSpan={dev.developments.length} className="px-4 py-2 font-medium align-middle">
                                                    {dev.ageRange}
                                                </td>
                                            )}
                                            <td className="px-4 py-2 align-middle">{item.category}</td>
                                            <td className="px-4 py-2 align-middle">{item.detail}</td>
                                            {subIdx === 0 && (
                                                <td rowSpan={dev.developments.length} className="px-4 py-2 align-middle">
                                                    <button
                                                        className="text-red-500 hover:underline text-sm"
                                                        onClick={() => {
                                                            // ฟังก์ชันลบข้อมูลในอนาคต
                                                            handleDelete(dev.ageRange);
                                                        }}
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr key={idx}>
                                        <td colSpan="4" className="text-center text-gray-400 py-4">
                                            ไม่มีข้อมูลพัฒนาการในช่วงอายุ {dev.ageRange}
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-gray-400 py-8">
                                    -- ไม่มีข้อมูลพัฒนาการ --
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
                        <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
                            เพิ่มเกณฑ์พัฒนาการ
                        </h2>

                        <div className="space-y-4">
                            {/* ช่วงอายุ */}
                            <div>
                                <label className="block mb-1">ช่วงอายุ</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value)}
                                >
                                    <option value="">เลือกช่วงอายุ</option>
                                    <option>0-1 ปี</option>
                                    <option>1-2 ปี</option>
                                    <option>2-3 ปี</option>
                                </select>
                            </div>

                            {/* พัฒนาการแต่ละด้าน */}
                            {developmentList.map((dev, index) => {
                                // หา category ที่ถูกเลือกในบรรทัดอื่น (ยกเว้นตัวเอง)
                                const selectedCategories = developmentList
                                    .filter((_, i) => i !== index) // ยกเว้นตัวเอง
                                    .map(d => d.category)
                                    .filter(c => c); // กรองเอาเฉพาะที่ไม่ใช่ค่าว่าง

                                return (
                                    <div key={index} className="flex gap-2">
                                        <select
                                            className="w-1/2 border rounded px-3 py-2"
                                            value={dev.category}
                                            onChange={(e) =>
                                                handleDevelopmentChange(index, 'category', e.target.value)
                                            }
                                        >
                                            <option value="">เลือกพัฒนาการ</option>
                                            {categoryOptions
                                                .filter(cat => !selectedCategories.includes(cat)) // กรองตัวเลือกที่ถูกเลือกแล้ว
                                                .map((cat, i) => (
                                                    <option key={i} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                        </select>

                                        {/* ส่วน detail ไม่ต้องกรอง เพราะรายละเอียดไม่ซ้ำกันก็ได้ */}
                                        <select
                                            className="w-1/2 border rounded px-3 py-2"
                                            value={dev.detail}
                                            onChange={(e) =>
                                                handleDevelopmentChange(index, 'detail', e.target.value)
                                            }
                                        >
                                            <option value="">เลือกรายละเอียด</option>
                                            {detailOptions.map((detail, i) => (
                                                <option key={i} value={detail}>
                                                    {detail}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ปุ่ม */}
                        <div className="mt-6 text-center space-x-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                            >
                                บันทึก
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddDevelopment;
