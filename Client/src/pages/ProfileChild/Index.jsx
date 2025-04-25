import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import childService from "../../service/child.service";
import ChildCard from "../../components/Card";

const Index = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await childService.getChildren();
        console.log("data ที่ได้จาก backend:", response.data);

        const childrenArray = Array.isArray(response.data.children)
          ? response.data.children
          : [];

        setChildren(childrenArray);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเด็ก:", error);
      }
    };

    fetchChildren();
  }, []);

  return (
    <div className="p-4">
      {/* ปุ่มเพิ่มเด็กอยู่ซ้าย */}
      <div className="mb-4">
        <button
          className="btn bg-[#E51317] text-white px-8 py-3 font-semibold rounded-full"
          onClick={() => navigate("/addChild")}
        >
          เพิ่มเด็ก
        </button>
      </div>

      {/* แสดงรายการเด็ก */}
      <div className="flex flex-wrap gap-4 justify-center">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
};

export default Index;
