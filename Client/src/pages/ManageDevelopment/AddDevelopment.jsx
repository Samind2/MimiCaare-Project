import React, { useState, useEffect } from "react";
import standardDevService from "../../service/standardDev.service";
import developDataService from "../../service/dataDev.service";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const AddDevelopment = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [developmentList, setDevelopmentList] = useState([]);
    const [allDevelopments, setAllDevelopments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // ตัวเลือกหมวดหมู่และรายละเอียด
    const [categories, setCategories] = useState([]);
    const [detailsMap, setDetailsMap] = useState({});

    // โหลดข้อมูลเริ่มต้น
    useEffect(() => {
        fetchDevelopments();
        fetchCategories();
    }, []);

    // โหลดข้อมูลพัฒนาการทั้งหมด
    const fetchDevelopments = async () => {
        try {
            const res = await standardDevService.getDevelop();
            const data = res.data.data;
            data.sort((a, b) => a.ageRange - b.ageRange);
            setAllDevelopments(data);
        } catch (err) {
            console.error("โหลดข้อมูลพัฒนาการล้มเหลว:", err);
            toast.error("โหลดข้อมูลพัฒนาการล้มเหลว");
        }
    };

    // โหลดหมวดหมู่ทั้งหมด
    const fetchCategories = async () => {
        try {
            const res = await developDataService.getAllDevelop();
            const data = res.data.data;

            // group by category
            const categoryMap = {};
            data.forEach((item) => {
                if (!categoryMap[item.category]) categoryMap[item.category] = [];
                categoryMap[item.category].push(item);
            });

            setCategories(Object.keys(categoryMap));
            setDetailsMap(categoryMap);
        } catch (err) {
            console.error("โหลดหมวดหมู่ไม่สำเร็จ:", err);
            toast.error("โหลดหมวดหมู่ไม่สำเร็จ");
        }
    };

    // modal เปิด
    const handleOpenModal = () => {
        const defaultList = categories.map((cat) => ({
            category: cat,
            detail: "",
            image: "",
            note: "",
        }));
        setDevelopmentList(defaultList);
        setIsModalOpen(true);
    };

    // แก้ไข development item
    const handleDetailChange = (index, selectedDetail) => {
        const updatedList = [...developmentList];
        const detailData = detailsMap[updatedList[index].category]?.find(
            (d) => d.detail === selectedDetail
        );
        if (detailData) {
            updatedList[index] = {
                ...updatedList[index],
                detail: detailData.detail,
                image: detailData.image || "",
                note: detailData.note || "",
            };
            setDevelopmentList(updatedList);
        }
    };

    // แปลงเดือน → label
    const convertMonthsToYearText = (months) => {
        if (months === 1) return "แรกเกิด - 1 เดือน";
        if (months === 2) return "1 - 2 เดือน";
        if (months === 4) return "3 - 4 เดือน";
        if (months === 6) return "5 - 6 เดือน";
        if (months === 8) return "7 - 8 เดือน";
        if (months === 9) return "9 เดือน";
        if (months === 12) return "10 - 12 เดือน";

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        let result = "";
        if (years > 0) result += `${years} ปี`;
        if (remainingMonths > 0)
            result += years > 0 ? ` ${remainingMonths} เดือน` : `${remainingMonths} เดือน`;
        return result;
    };

    const handleSave = async () => {
        try {
            if (!ageRange) {
                toast.error("กรุณาเลือกช่วงอายุ");
                return;
            }

            for (let dev of developmentList) {
                if (!dev.detail) {
                    toast.error(`กรุณาเลือกรายละเอียดในหมวด "${dev.category}"`);
                    return;
                }
            }

            const newData = {
                ageRange: parseInt(ageRange, 10),
                developments: developmentList,
            };
            setIsSaving(true);

            if (editMode) {
                await standardDevService.updateStandardDev(editId, newData);
                toast.success("แก้ไขข้อมูลสำเร็จ!");
            } else {
                await standardDevService.addStandardDev(newData);
                toast.success("เพิ่มพัฒนาการสำเร็จ!");
            }

            setIsModalOpen(false);
            setAgeRange("");
            setEditId(null);
            setEditMode(false);
            setDevelopmentList([]);
            fetchDevelopments();
            setIsSaving(false);
        } catch (err) {
            console.error("บันทึกไม่สำเร็จ:", err);
            toast.error("บันทึกข้อมูลไม่สำเร็จ");
        }
    };

    // pagination
    const totalPages = Math.ceil(allDevelopments.length / itemsPerPage);
    const paginatedData = allDevelopments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6">
            <button onClick={handleOpenModal} className="btn btn-primary mb-4">
                <FaPlus /> เพิ่มพัฒนาการ
            </button>

            {/* ตารางข้อมูล */}
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>ช่วงอายุ</th>
                        <th>รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((dev) => (
                        <tr key={dev.id}>
                            <td>{convertMonthsToYearText(dev.ageRange)}</td>
                            <td>
                                {dev.developments.map((d, i) => (
                                    <div key={i}>
                                        <strong>{d.category}:</strong> {d.detail}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* pagination */}
            <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`btn btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editMode ? "แก้ไขพัฒนาการ" : "เพิ่มพัฒนาการ"}
                        </h2>

                        {/* ช่วงอายุ */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">ช่วงอายุ</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2"
                                value={ageRange}
                                onChange={(e) => setAgeRange(e.target.value)}
                            />
                        </div>

                        {developmentList.map((dev, index) => (
                            <div key={index} className="mb-4 border p-2 rounded">
                                <p className="font-semibold mb-2">{dev.category}</p>

                                <select
                                    className="w-full mb-2 border rounded p-2"
                                    value={dev.detail}
                                    onChange={(e) => handleDetailChange(index, e.target.value)}
                                >
                                    <option value="">เลือกรายละเอียด</option>
                                    {detailsMap[dev.category]?.map((d, i) => (
                                        <option key={i} value={d.detail}>
                                            {d.detail}
                                        </option>
                                    ))}
                                </select>

                                {dev.image && (
                                    <img
                                        src={dev.image}
                                        alt="preview"
                                        className="w-20 h-20 mb-2"
                                    />
                                )}
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={dev.note || ""}
                                    readOnly
                                />
                            </div>
                        ))}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-gray"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-green"
                                disabled={isSaving}
                            >
                                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDevelopment;
