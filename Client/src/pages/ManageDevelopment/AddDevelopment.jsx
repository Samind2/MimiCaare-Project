import React, { useState, useEffect } from 'react';
import standardDevService from "../../service/standardDev.service";
import { FaPlus } from 'react-icons/fa';
import { toast } from "react-toastify";

const AddDevelopment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); // เก็บสถานะเปิด/ปิด modal
    const [ageRange, setAgeRange] = useState(''); // เก็บช่วงอายุที่เลือก
    const [editMode, setEditMode] = useState(false); // เก็บสถานะการแก้ไข
    const [editId, setEditId] = useState(null); // เก็บ id ที่จะแก้ไข
    const [currentPage, setCurrentPage] = useState(1); // หน้าปัจจุบัน
    const itemsPerPage = 3; // จำนวนกลุ่มช่วงอายุต่อหน้า
    const [developmentList, setDevelopmentList] = useState([ // เก็บข้อมูลพัฒนาการที่กรอก
        { category: '', detail: '', image: '', note: '' },
        { category: '', detail: '', image: '', note: '' }, 
        { category: '', detail: '', image: '', note: '' }, 
        { category: '', detail: '', image: '', note: '' }, 
        { category: '', detail: '', image: '', note: '' },]);
    const [allDevelopments, setAllDevelopments] = useState([]); // เก็บข้อมูลพัฒนาการทั้งหมดจากฐานข้อมูล

    // ช่วงอายุที่ใช้
    const ageOptions = [
        { value: 1 },
        { value: 2 },
        { value: 4 },
        { value: 6 },
        { value: 8 },
        { value: 9 },
        { value: 12 },
        { value: 15 },
        { value: 17 },
        { value: 18 },
        { value: 24 },
        { value: 29 },
        { value: 30 },
        { value: 39 },
        { value: 41 },
        { value: 42 },
        { value: 48 },
        { value: 54 },
        { value: 59 },
        { value: 60 },
        { value: 66 },
        { value: 72 },
        { value: 78 },
    ];

    // แปลงค่าเดือนเป็นข้อความช่วงอายุ
    const getAgeLabel = (ageValue) => {
        const found = ageOptions.find(opt => opt.value === ageValue); // ค้นหาช่วงอายุที่ตรงกับค่า val
        if (found) {
            return convertMonthsToYearText(found.value);
        }
        return ageValue;
    };

    const convertMonthsToYearText = (months) => {
        if (months === 1) return "แรกเกิด - 1 เดือน";
        if (months === 2) return "1 - 2 เดือน";
        if (months === 4) return "3 - 4 เดือน";
        if (months === 6) return "5 - 6 เดือน";
        if (months === 8) return "7 - 8 เดือน";
        if (months === 9) return "9 เดือน";
        if (months === 12) return "10 - 12 เดือน";

        // สำหรับเลขเดือนอื่น แปลงเป็นปีและเดือน
        const years = Math.floor(months / 12);
        const remainingMonths  = months % 12;

        let result = "";
        if (years > 0) result += `${years} ปี`;
        if (remainingMonths > 0) result += (years > 0 ? ` ${remainingMonths } เดือน` : `${remainingMonths } เดือน`);
        return result;
    };


    const categoryOptions = [
        "การเคลื่อนไหวพื้นฐาน ",
        "การใช้กล้ามเนื้อมัดเล็กและสติปัญญา",
        "ด้านการเข้าใจภาษา",
        "ด้านการใช้ภาษา",
        "ด้านการช่วยเหลือตัวเองและสังคม",
    ];

    const detailOptions = [
        "ท่านอนคว่ำยกศรีษะและหันไปข้างใดข้างหนึ่ง",
        "มองตามถึงกึ่งกลางลำตัว",
        "สะดุ้งหรือเคลื่อนไหวร่างกายเมื่อได้ยินเสียงพูดระดับปกติ",
        "ส่งเสียง อ้อ แอ้ง แอ้ง",
        "มองจ้องหน้าได้นาน 1 - 2 วินาที",
    ];

    useEffect(() => {
        fetchDevelopments();
    }, []);

    const fetchDevelopments = async () => {
        try {
            const res = await standardDevService.getDevelop();
            const data = res.data.data;
            data.sort((a, b) => a.ageRange - b.ageRange); // เรียงตามช่วงอายุ
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
            toast.warning('กรุณาเลือกช่วงอายุ');
            return;
        }

        // เช็คว่ามีช่วงอายุซ้ำในฐานข้อมูลหรือไม่
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
                // แก้ไขข้อมูล
                await standardDevService.updateStandardDev(editId, newData);
                toast.success("แก้ไขข้อมูลสำเร็จ!", { autoClose: 1500 });
            } else {
                // เพิ่มข้อมูลใหม่
                await standardDevService.addStandardDev(newData);
                toast.success("เพิ่มพัฒนาการสำเร็จ!", { autoClose: 1500 });
            }

            // รีเซ็ตฟอร์ม
            setIsModalOpen(false);
            setAgeRange('');
            setEditId(null);
            setEditMode(false);
            setDevelopmentList([
                { category: '', detail: '', image: '', note: '', },
                { category: '', detail: '', image: '', note: '', }, 
                { category: '', detail: '', image: '', note: '', }, 
                { category: '', detail: '', image: '', note: '', }, 
                { category: '', detail: '', image: '', note: '', },
            ]);
            fetchDevelopments();
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            console.error(err);
        }
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

    // เปลี่ยนรูปภาพเมื่อมีการอัปโหลด

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

    // ลบพัฒนาการ
    const handleDelete = async (idToDelete) => {

        // สร้างtoast เพื่อยืนยันการลบ
        const confirmDelete = () =>
            new Promise((resolve) => {
                const ToastContent = ({ closeToast }) => ( // ฟังก์ชันที่ใช้แสดงเนื้อหาใน Toast
                    <div>
                        <p>คุณต้องการลบข้อมูลช่วงอายุ {idToDelete} ใช่หรือไม่?</p>
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                className="btn btn-sm btn-error"
                                onClick={() => {
                                    closeToast();
                                    resolve(false); // ยกเลิก
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

    // แบ่งข้อมูลพัฒนาการเป็นกลุ่มตามช่วงอายุ
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
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg transition-all scale-100">
                        <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
                            เพิ่มเกณฑ์พัฒนาการ
                        </h2>

                        <div className="space-y-4">
                            {/* ช่วงอายุ */}
                            <div>
                                <label className="block mb-1">ช่วงอายุ</label>
                                <select
                                    id='DEV-01'
                                    className="w-full border rounded px-3 py-2"
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(Number(e.target.value))}
                                >
                                    <option value="">เลือกช่วงอายุ</option>
                                    {ageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {convertMonthsToYearText(opt.value)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
                                {/* พัฒนาการแต่ละด้าน */}
                                {developmentList.map((dev, index) => {
                                    const selectedCategories = developmentList
                                        .filter((_, i) => i !== index)
                                        .map(d => d.category)
                                        .filter(c => c);

                                    return (
                                        <div key={index} className="border rounded p-2 space-y-2 bg-gray-50">
                                            <div className="flex gap-2">
                                                <select
                                                    id='DEV-02'
                                                    className="w-1/2 border rounded px-3 py-2"
                                                    value={dev.category}
                                                    onChange={(e) =>
                                                        handleDevelopmentChange(index, 'category', e.target.value)
                                                    }
                                                >
                                                    <option value="">เลือกพัฒนาการ</option>
                                                    {categoryOptions
                                                        .filter(category => !selectedCategories.includes(category))
                                                        .map((category, i) => (
                                                            <option key={i} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                </select>

                                                <select
                                                    id='DEV-03'
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

                                            <div className="flex flex-col">
                                                <label
                                                    htmlFor={`image-upload-${index}`}
                                                    className="mb-1 text-sm font-medium text-pink-600 cursor-pointer select-none flex items-center gap-1"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 15a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4H3v-4zM7 10l5-5m0 0l5 5m-5-5v12"
                                                        />
                                                    </svg>
                                                    อัปโหลดรูปภาพ
                                                </label>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(index, e)}
                                                    className="file-input file-input-bordered w-full"
                                                />

                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="ข้อแนะนำ"
                                                    value={dev.note ?? ''}
                                                    onChange={(e) => handleDevelopmentChange(index, "note", e.target.value)}
                                                    className="input input-bordered w-full"
                                                />
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ปุ่ม */}
                        <div className="mt-6 text-center space-x-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition"
                            >
                                บันทึก
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full font-medium shadow-md hover:scale-105 transition"
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
