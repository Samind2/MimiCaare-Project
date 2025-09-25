import React, { useState, useEffect } from 'react';
import standardDevService from "../../service/standardDev.service";
import developDataService from "../../service/dataDev.service";
import { FaPlus } from 'react-icons/fa';
import { toast } from "react-toastify";

const AddDevelopment = () => {
    const emptyDev = { category: '', detail: '', image: '', note: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [allDevelopments, setAllDevelopments] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const [developmentList, setDevelopmentList] = useState(
        Array.from({ length: 5 }, () => ({ ...emptyDev }))
    );

    // Meta develop
    const [metaDevelop, setMetaDevelop] = useState([]);
    const categoryOptions = [
        "การเคลื่อนไหวพื้นฐาน",
        "การใช้กล้ามเนื้อมัดเล็กและสติปัญญา",
        "ด้านการเข้าใจภาษา",
        "ด้านการใช้ภาษา",
        "ด้านการช่วยเหลือตัวเองและสังคม",
    ];

    const ageOptions = [
        { value: 1 }, { value: 2 }, { value: 4 }, { value: 6 }, { value: 8 },
        { value: 9 }, { value: 12 }, { value: 15 }, { value: 17 }, { value: 18 },
        { value: 24 }, { value: 29 }, { value: 30 }, { value: 39 }, { value: 41 },
        { value: 42 }, { value: 48 }, { value: 54 }, { value: 59 }, { value: 60 },
        { value: 66 }, { value: 72 }, { value: 78 },
    ];

    useEffect(() => {
        fetchDevelopments();
        fetchMetaDevelop();
    }, []);

    const fetchMetaDevelop = async () => {
        try {
            const res = await developDataService.getAllDevelop();
            if (res.data && res.data.data) {
                setMetaDevelop(res.data.data);
                const categories = [...new Set(res.data.data.map(item => item.category))];
                setCategoryOptions(categories);
            }
        } catch (err) {
            console.error("โหลด metaDevelop ไม่สำเร็จ", err);
        }
    };

    const fetchDevelopments = async () => {
        try {
            const res = await standardDevService.getDevelop();
            const data = res.data.data;
            data.sort((a, b) => a.ageRange - b.ageRange);
            setAllDevelopments(data);
        } catch (err) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err);
        }
    };

    const handleCategoryChange = (index, value) => {
        const updatedList = [...developmentList];
        updatedList[index].category = value;
        updatedList[index].detail = '';
        updatedList[index].image = '';
        updatedList[index].note = '';
        setDevelopmentList(updatedList);
    };

    const handleDetailChange = (index, value) => {
        const updatedList = [...developmentList];
        updatedList[index].detail = value;

        // ดึง image และ note จาก metaDevelop
        const matchedMeta = metaDevelop.find(
            item => item.category === updatedList[index].category && item.detail === value
        );

        if (matchedMeta) {
            updatedList[index].image = matchedMeta.image || '';
            updatedList[index].note = matchedMeta.note || '';
        } else {
            updatedList[index].image = '';
            updatedList[index].note = '';
        }

        setDevelopmentList(updatedList);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            const updatedList = [...developmentList];
            updatedList[index].image = base64Image;
            setDevelopmentList(updatedList);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        const validDevelopments = developmentList.filter(d => d.category && d.detail);

        if (!ageRange) {
            toast.warning('กรุณาเลือกช่วงอายุ');
            return;
        }

        const isDuplicate = allDevelopments.some(dev =>
            dev.ageRange === ageRange && (editMode ? dev.id !== editId : true)
        );

        if (isDuplicate) {
            toast.warning('ช่วงอายุนี้มีข้อมูลพัฒนาการอยู่แล้ว');
            return;
        }

        if (validDevelopments.length === 0) {
            toast.warning('กรุณากรอกพัฒนาการอย่างน้อยหนึ่งรายการ');
            return;
        }

        const newData = {
            ageRange: parseInt(ageRange, 10),
            developments: validDevelopments,
        };

        try {
            if (editMode) {
                await standardDevService.updateStandardDev(editId, newData);
                toast.success("แก้ไขข้อมูลสำเร็จ!", { autoClose: 1500 });
            } else {
                setIsAdding(true);
                await standardDevService.addStandardDev(newData);
                toast.success("เพิ่มพัฒนาการสำเร็จ!", { autoClose: 1500 });
            }

            setIsModalOpen(false);
            setAgeRange('');
            setEditId(null);
            setEditMode(false);
            setDevelopmentList(Array.from({ length: 5 }, () => ({ ...emptyDev })));
            fetchDevelopments();
        } catch (err) {
            setIsAdding(false);
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-pink-700">การจัดการพัฒนาการ</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-600 hover:scale-105 transition-transform text-white text-sm px-4 py-2 rounded-xl shadow-lg"
                >
                    <FaPlus /> เพิ่มแผนการพัฒนาการ
                </button>
            </div>

            {/* ตารางพัฒนาการ */}
            <div className="overflow-x-auto rounded-lg shadow-md border border-pink-200 mt-4">
                <table className="min-w-full divide-y divide-pink-200">
                    <thead className="bg-pink-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-pink-900 font-semibold rounded-tl-lg">ช่วงอายุ</th>
                            <th className="px-6 py-3 text-left text-pink-900 font-semibold">พัฒนาการ</th>
                            <th className="px-6 py-3 text-left text-pink-900 font-semibold">รายละเอียด</th>
                            <th className="px-6 py-3 text-center text-pink-900 font-semibold">รูปภาพ</th>
                            <th className="px-6 py-3 text-center text-pink-900 font-semibold rounded-tr-lg">ข้อแนะนำ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-200">
                        {allDevelopments.map(dev =>
                            dev.developments.map((item, idx) => (
                                <tr key={`${dev.id}-${idx}`} className="hover:bg-pink-50 transition">
                                    {idx === 0 && (
                                        <td rowSpan={dev.developments.length} className="px-6 py-4 text-center font-bold text-blue-900 bg-blue-50 rounded-l-lg align-middle">
                                            {dev.ageRange} เดือน
                                        </td>
                                    )}
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">{item.detail}</td>
                                    <td className="px-6 py-4 text-center">
                                        {item.image ? (
                                            <img src={item.image} alt="รูปพัฒนาการ" className="w-16 h-16 object-cover rounded-md border border-gray-300 mx-auto" />
                                        ) : (
                                            <span className="italic text-gray-400">ไม่มีรูป</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{item.note}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg transition-all scale-100">
                        <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
                            {editMode ? "แก้ไขเกณฑ์พัฒนาการ" : "เพิ่มเกณฑ์พัฒนาการ"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">ช่วงอายุ</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(Number(e.target.value))}
                                >
                                    <option value="">เลือกช่วงอายุ</option>
                                    {ageOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.value} เดือน
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                                {developmentList.map((dev, index) => (
                                    <div key={index} className="border rounded p-2 space-y-2 bg-gray-50">
                                        <div className="flex gap-2">
                                            <select
                                                className="w-1/2 border rounded px-3 py-2"
                                                value={dev.category}
                                                onChange={(e) => handleCategoryChange(index, e.target.value)}
                                            >
                                                <option value="">เลือกพัฒนาการ</option>
                                                {categoryOptions.map((cat, i) => (
                                                    <option key={i} value={cat}>{cat}</option>
                                                ))}
                                            </select>

                                            <select
                                                className="w-1/2 border rounded px-3 py-2"
                                                value={dev.detail}
                                                onChange={(e) => handleDetailChange(index, e.target.value)}
                                            >
                                                <option value="">เลือกรายละเอียด</option>
                                                {metaDevelop
                                                    .filter(m => m.category === dev.category)
                                                    .map((m, i) => (
                                                        <option key={i} value={m.detail}>{m.detail}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        {dev.image && (
                                            <img src={dev.image} alt="รูปพัฒนาการ" className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm" />
                                        )}
                                        <input
                                            type="text"
                                            placeholder="ข้อแนะนำ"
                                            value={dev.note ?? ''}
                                            className="input input-bordered w-full"
                                            readOnly
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 text-center space-x-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isAdding}
                                    className={`px-6 py-2 rounded-full font-medium shadow-md transition ${isAdding
                                        ? "bg-green-300 text-white cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
                                        }`}
                                >
                                    {isAdding ? "กำลังบันทึก..." : "บันทึก"}
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isAdding}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition disabled:opacity-50"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDevelopment;
