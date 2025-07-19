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
      const childrenArray = Array.isArray(response.data.children)
        ? response.data.children
        : [];
      setChildren(childrenArray);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเด็ก:", error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleDelete = async (idToDelete) => {
    const confirmDelete = () =>
      new Promise((resolve) => {
        const ToastContent = ({ closeToast }) => (
          <div>
            <p>คุณต้องการลบข้อมูลเด็กหมายเลข {idToDelete} ใช่หรือไม่?</p>
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
                  resolve(true);
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
      await childService.deleteChild(idToDelete);
      toast.success("ลบข้อมูลสำเร็จ");
      fetchChildren();
    } catch (error) {
      toast.error("ลบข้อมูลไม่สำเร็จ");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8E8EE] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#444]">รายการเด็กในระบบ</h1>
          <button
            data-testid="B-AddChild"
            className="btn bg-[#FA5453] hover:bg-[#ff7676] text-white px-6 py-2 rounded-full shadow-md transition duration-300"
            onClick={() => navigate("/addChild")}
          >
            <FaPlus className="inline mr-2" />
            เพิ่มเด็ก
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <p>ยังไม่มีข้อมูลเด็กในระบบ</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
