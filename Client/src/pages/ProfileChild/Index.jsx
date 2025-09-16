import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import childService from "../../service/child.service";
import ChildCard from "../../components/Card";
import { toast } from "react-toastify";

const Index = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);

  const fetchChildren = async () => {
    try {
      const response = await childService.getChildren();
      const childrenArray = Array.isArray(response.data.children) ? response.data.children : [];
      setChildren(childrenArray);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเด็ก:", error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleDelete = async (child) => {
    const confirmDelete = () =>
      new Promise((resolve) => {
        const ToastContent = ({ closeToast }) => (
          <div>
            <p>คุณต้องการลบข้อมูลเด็กชื่อ <b>{child.firstName}</b> ใช่หรือไม่?</p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="btn btn-sm btn-error"
                onClick={() => { closeToast(); resolve(false); }}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={() => { closeToast(); resolve(true); }}
              >
                ตกลง
              </button>
            </div>
          </div>
        );

        toast.info(<ToastContent />, { autoClose: false, closeOnClick: false, closeButton: false, draggable: false });
      });

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await childService.deleteChild(child.id);
      toast.success("ลบข้อมูลสำเร็จ");
      fetchChildren();
    } catch (error) {
      toast.error("ลบข้อมูลไม่สำเร็จ");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-pink-100 to-pink-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-600">รายการเด็กในระบบ</h1>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-1 text-sm md:text-base transition-all duration-300"
            onClick={() => navigate("/addChild")}
          >
            <FaPlus className="text-sm md:text-base" /> เพิ่มเด็ก
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            ยังไม่มีข้อมูลเด็กในระบบ
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} onDelete={() => handleDelete(child)} small />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;