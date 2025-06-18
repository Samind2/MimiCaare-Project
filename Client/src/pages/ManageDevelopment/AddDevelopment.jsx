import React, { useState, useEffect } from 'react';
import standardDevService from "../../service/standardDev.service";
import { toast } from "react-toastify";

const AddDevelopment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState('');
    const [developmentList, setDevelopmentList] = useState([
        { category: '', detail: '', image: '' },
        { category: '', detail: '', image: '' },
        { category: '', detail: '', image: '' },
        { category: '', detail: '', image: '' },
        { category: '', detail: '', image: '' },
    ]);
    const [allDevelopments, setAllDevelopments] = useState([]);

    // 
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


    // const getAgeLabel = (val) => {
    //     const found = ageOptions.find(opt => opt.value === val);
    //     return found ? found.label : val;
    // };

    const getAgeLabel = (val) => {
        const found = ageOptions.find(opt => opt.value === val);
        if (found) {
            return convertMonthsToYearText(found.value);
        }
        return val;
    };

    const convertMonthsToYearText = (months) => {
        // กรณีพิเศษแสดงข้อความช่วงสั้นๆ
        if (months === 1) return "แรกเกิด - 1 เดือน";
        if (months === 2) return "1 - 2 เดือน";
        if (months === 4) return "3 - 4 เดือน";
        if (months === 6) return "5 - 6 เดือน";
        if (months === 8) return "7 - 8 เดือน";
        if (months === 9) return "9 เดือน";
        if (months === 12) return "10 - 12 เดือน";

        // สำหรับเลขเดือนอื่น แปลงเป็นปีและเดือน
        const years = Math.floor(months / 12);
        const remMonths = months % 12;

        let result = "";
        if (years > 0) result += `${years} ปี`;
        if (remMonths > 0) result += (years > 0 ? ` ${remMonths} เดือน` : `${remMonths} เดือน`);
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
            alert('กรุณาเลือกช่วงอายุ');
            return;
        }

        // เช็คว่ามีช่วงอายุ;ซ้ำในฐานข้อมูลหรือไม่
        const isDuplicate = allDevelopments.some(dev => dev.ageRange === ageRange);
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
            await standardDevService.addStandardDev(newData);
            toast.success("เพิ่มพัฒนาการสำเร็จ!", { autoClose: 1500 });
            setIsModalOpen(false);
            setAgeRange('');
            setDevelopmentList([
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
                { category: '', detail: '' },
            ]);
            fetchDevelopments();
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการบันทึก:', err);
        }
    };

    const handleDevelopmentChange = (index, key, value) => {
        const updatedList = [...developmentList];
        updatedList[index][key] = value;
        setDevelopmentList(updatedList);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedList = [...developmentList];
                updatedList[index].image = reader.result;
                setDevelopmentList(updatedList);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleDelete = async (idToDelete) => {
        // สร้าง Toast 
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
                            <th className="px-4 py-2">รูปภาพ</th>
                            <th className="px-4 py-2">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allDevelopments.length > 0 ? (
                            allDevelopments.map((dev, idx) => {
                                if (dev.developments.length > 0) {
                                    return dev.developments.map((item, subIdx) => (
                                        <tr key={`${idx}-${subIdx}`} className="bg-white shadow rounded">
                                            {subIdx === 0 && (
                                                <td rowSpan={dev.developments.length} className="px-4 py-2 font-medium align-middle">
                                                    {getAgeLabel(dev.ageRange)}
                                                </td>
                                            )}
                                            <td className="px-4 py-2 align-middle">{item.category}</td>
                                            <td className="px-4 py-2 align-middle">{item.detail}</td>
                                            <td className="px-4 py-2 align-middle">
                                                {item.image ? (
                                                    <img src={item.image} alt="รูปภาพพัฒนาการ" className="w-20 h-auto rounded" />
                                                ) : (
                                                    <span className="text-gray-400">ไม่มีรูป</span>
                                                )}
                                            </td>
                                            {subIdx === 0 && (
                                                <td rowSpan={dev.developments.length} className="px-4 py-2 align-middle">
                                                    <button onClick={() => handleDelete(dev.id)} className="text-red-600 hover:underline">
                                                        ลบ
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ));
                                } else {
                                    return (
                                        <tr key={idx}>
                                            <td colSpan="4" className="text-center text-gray-400 py-4">
                                                ไม่มีข้อมูลพัฒนาการในช่วงอายุ {getAgeLabel(dev.ageRange)}
                                            </td>
                                        </tr>
                                    );
                                }
                            })
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
                                                className="w-1/2 border rounded px-3 py-2"
                                                value={dev.category}
                                                onChange={(e) =>
                                                    handleDevelopmentChange(index, 'category', e.target.value)
                                                }
                                            >
                                                <option value="">เลือกพัฒนาการ</option>
                                                {categoryOptions
                                                    .filter(cat => !selectedCategories.includes(cat))
                                                    .map((cat, i) => (
                                                        <option key={i} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                            </select>

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

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(index, e)}
                                            className="w-full"
                                        />
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
