import React, { useState, useEffect } from 'react';
import standardDevService from "../../service/standardDev.service";
import developDataService from "../../service/dataDev.service";
import { FaPlus, FaPlusCircle, FaPencilAlt } from 'react-icons/fa';
import { toast } from "react-toastify";

const AddDevelopment = () => {
    const emptyDev = { category: '', detail: '', image: '', note: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); 
    const [allDevelopments, setAllDevelopments] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const [developmentList, setDevelopmentList] = useState([{ ...emptyDev }]);


    // Meta develop
    const [metaDevelop, setMetaDevelop] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([
        "ด้านการเคลื่อนไหวพื้นฐาน",
        "ด้านการใช้กล้ามเนื้อมัดเล็กและสติปัญญา",
        "ด้านการเข้าใจภาษา",
        "ด้านการใช้ภาษา",
        "ด้านการช่วยเหลือตัวเองและสังคม",
    ]);

    const ageOptions = [
        { value: 1 }, { value: 2 }, { value: 4 }, { value: 6 }, { value: 8 },
        { value: 9 }, { value: 12 }, { value: 15 }, { value: 17 }, { value: 18 },
        { value: 24 }, { value: 29 }, { value: 30 }, { value: 36 }, { value: 41 },
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
                // categoryOptions(categories);
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



    const handleSubmit = async () => {
        // เช็คจำนวนพัฒนาการ
        if (developmentList.length < 5) {
            toast.warning(`กรุณาเพิ่มพัฒนาการอย่างน้อย 5 รายการ`);
            return;
        }

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
            setIsAdding(true);
            if (editMode) {
                await standardDevService.updateStandardDev(editId, newData);
                toast.success("แก้ไขข้อมูลสำเร็จ!", { autoClose: 1500 });
            } else {
                await standardDevService.addStandardDev(newData);
                toast.success("เพิ่มพัฒนาการสำเร็จ!", { autoClose: 1500 });
            }

            setIsModalOpen(false);
            setAgeRange('');
            setEditId(null);
            setEditMode(false);
            setDevelopmentList([{ ...emptyDev }]);
            fetchDevelopments();
        } catch (err) {
            setIsAdding(false);
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };


    const handleAddDevelopment = () => {
        setDevelopmentList([...developmentList, { ...emptyDev }]);
    };


    const handleRemoveDevelopment = (index) => {
        const updated = developmentList.filter((_, i) => i !== index);
        setDevelopmentList(updated.length > 0 ? updated : [{ ...emptyDev }]);
    };

    // แก้ไขพัฒนาการ
    const handleEdit = (devId) => {
        const devToEdit = allDevelopments.find((dev) => dev.id === devId);
        if (devToEdit) {
            setEditMode(true);
            setEditId(devId);
            setAgeRange(devToEdit.ageRange);
            setDevelopmentList(devToEdit.developments.map((item) => ({
                category: item.category,
                detail: item.detail,
                image: item.image || '',
                note: item.note || '',
            })));
            setIsModalOpen(true);
        }
    };

    // แก้ไขพัฒนาการแต่ละรายการ
    const handleDevelopmentChange = (index, key, value) => {
        const updatedList = [...developmentList];
        updatedList[index][key] = value;
        setDevelopmentList(updatedList);
    };

    // เปลี่ยนรูปภาพ

    // const handleImageChange = (index, event) => {
    //     const file = event.target.files[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         const base64Image = reader.result;
    //         const updatedList = [...developmentList];
    //         updatedList[index].image = base64Image;
    //         setDevelopmentList(updatedList);
    //     };
    //     reader.readAsDataURL(file);
    // };


    // ลบพัฒนาการ
    const handleDelete = async (idToDelete) => {

        // สร้างtoast เพื่อยืนยันการลบ
        const confirmDelete = () =>
            new Promise((resolve) => {
                const ToastContent = ({ closeToast }) => (
                    <div>
                        <p>คุณต้องการลบข้อมูลช่วงอายุ {idToDelete} ใช่หรือไม่?</p>

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
                                    resolve(true); // ยืนยัน
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
            await standardDevService.deleteStandardDev(idToDelete);
            toast.success("ลบข้อมูลสำเร็จ");
            fetchDevelopments();
        } catch (error) {
            toast.error("ลบข้อมูลไม่สำเร็จ");
            console.error(error);
        }
    };

    const getAgeLabel = (age) => {
        return age ? `${age} เดือน` : '-';
    };

    // Pagination
    const itemsPerPage = 3;
    const totalPages = Math.ceil(allDevelopments.length / itemsPerPage);
    const paginatedData = allDevelopments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">การจัดการพัฒนาการ</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-600 hover:scale-105 transition-transform text-white text-sm px-4 py-2 rounded-xl shadow-lg"
                >
                    <FaPlus className="text-white" />
                    <span>เพิ่มแผนการพัฒนาการ</span>
                </button>
            </div>

            {/* ตารางแสดงข้อมูล */}
            <div className="overflow-x-auto rounded-lg shadow-md border border-pink-200">
                <table className="min-w-full divide-y divide-pink-200">
                    <thead className="bg-pink-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-pink-900 text-sm md:text-base font-semibold rounded-tl-lg">
                                ช่วงอายุ
                            </th>
                            <th className="px-6 py-3 text-left text-pink-900 text-sm md:text-base font-semibold">
                                พัฒนาการ
                            </th>
                            <th className="px-6 py-3 text-left text-pink-900 text-sm md:text-base font-semibold">
                                รายละเอียด
                            </th>
                            <th className="px-6 py-3 text-center text-pink-900 text-sm md:text-base font-semibold">
                                รูปภาพ
                            </th>
                            <th className="px-6 py-3 text-center text-pink-900 text-sm md:text-base font-semibold rounded-tr-lg">
                                ข้อแนะนำ
                            </th>
                            <th className="px-6 py-3 text-center text-pink-900 text-sm md:text-base font-semibold rounded-tr-lg">
                                การจัดการ
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((dev, idx) => {
                                const realIndex = (currentPage - 1) * itemsPerPage + idx;
                                const bgGroup = realIndex % 2 === 0 ? "bg-pink-50" : "bg-green-50";
                                return (
                                    <React.Fragment key={idx}>
                                        <tr><td colSpan={5} className="pt-4"></td></tr>
                                        {dev.developments.map((item, subIdx) => (
                                            <tr
                                                key={`${idx}-${subIdx}`}
                                                className={`${bgGroup} hover:bg-pink-100 transition duration-200`}
                                            >
                                                {subIdx === 0 && (
                                                    <td
                                                        rowSpan={dev.developments.length}
                                                        className="px-6 py-4 text-center font-bold text-blue-900 bg-blue-100 rounded-l-xl align-middle select-none"
                                                    >
                                                        {getAgeLabel(dev.ageRange)}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-gray-700">{item.category}</td>
                                                <td className="px-6 py-4 text-gray-600">{item.detail}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt="รูปพัฒนาการ"
                                                            className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm mx-auto"
                                                        />
                                                    ) : (
                                                        <span className="italic text-gray-400">ไม่มีรูป</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{item.note}</td>
                                                {subIdx === 0 && (
                                                    <td
                                                        rowSpan={dev.developments.length}
                                                        className="px-6 py-4 text-center bg-pink-100 rounded-r-xl align-middle"
                                                    >

                                                        <div className="flex flex-col gap-3 items-center">
                                                            <button
                                                                onClick={() => handleDelete(dev.id)}
                                                                className="bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 transition px-6 py-2 rounded-full text-sm font-semibold shadow-md"
                                                                type="button"
                                                            >
                                                                ลบ
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(dev.id)}
                                                                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:scale-105 transition px-6 py-2 rounded-full text-sm font-semibold shadow-md"
                                                                type="button"
                                                            >
                                                                แก้ไข
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center text-gray-400 py-8 italic">
                                    -- ไม่มีข้อมูลพัฒนาการ --
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >ย้อนกลับ</button>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >{i + 1}</button>
                ))}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >ถัดไป</button>
            </div>


            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999] transition">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] md:w-[700px] max-h-[90vh] overflow-y-auto animate-fadeIn">

                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-bold text-pink-700 flex items-center gap-2">
                                {editMode ? <><FaPencilAlt /> แก้ไขเกณฑ์พัฒนาการ</> : <><FaPlusCircle /> เพิ่มเกณฑ์พัฒนาการ</>}

                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-red-500 transition"
                            >
                                < FaPlus className="transform rotate-45 text-2xl" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-5">
                            {/* เลือกช่วงอายุ */}
                            <div>
                                <label className="block mb-1 font-medium text-gray-700">ช่วงอายุ</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
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

                            {/* รายการพัฒนาการ */}
                            <div className="space-y-4">
                                {developmentList.map((dev, index) => (
                                    <div
                                        key={index}
                                        className="border border-pink-200 rounded-xl p-4 bg-pink-50 relative shadow-sm "
                                    >

                                        {developmentList.length > 1 && index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDevelopment(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
                                            >
                                                <FaPlus className="transform rotate-45" />
                                            </button>
                                        )}


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
                                                    .filter(m => m.category.trim() === dev.category.trim())
                                                    .map((m, i) => (
                                                        <option key={i} value={m.detail}>{m.detail}</option>
                                                    ))}
                                            </select>
                                        </div>

                                        {dev.image && (
                                            <img src={dev.image} alt="รูปพัฒนาการ"
                                                className="w-20 h-20 object-cover rounded-md border border-gray-300 shadow-sm" />
                                        )}

                                        <input
                                            type="text"
                                            placeholder="ข้อแนะนำ"
                                            value={dev.note ?? ''}
                                            className="input input-bordered w-full"
                                            onChange={(e) => handleDevelopmentChange(index, 'note', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* ปุ่มเพิ่มช่อง */}
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleAddDevelopment}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
                                >
                                    < FaPlusCircle className="inline mr-2" />
                                    เพิ่มพัฒนาการ
                                </button>
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