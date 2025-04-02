import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useContext(AuthContext); // ดึงข้อมูล user จาก context
  const navigate = useNavigate();
  return (
    <div className="section-container bg-gradient-to-r from-[#fcfcfc] to-[#ffffff]">
      <div className="py-24 flex flex-col md:flex-row-reverse justify-between items-center">
        <div className="md:w-1/2 flex justify-end">
          <img src="/images/Home/Baby (2).png" alt="Baby" />
        </div>
        <div className="md:w-1/2 space-y-7 px-4">
          <h3 className="md:text-3xl font-bold md:leading-snug leading-snug">
            <span className="text-[#114965]">ยินดีต้อนรับสู่</span>
            <span className="text-[#E51317]"> MiMiCare </span>
          </h3>
          <p className="text-xl text-[#4a4a4a]">
            ระบบบันทึกการรับวัคซีนและพัฒนาการเด็ก
            ช่วยติดตามสุขภาพและพัฒนาการของเด็กอย่างเป็นระบบ
            บันทึกข้อมูลวัคซีนตามช่วงอายุ
            พร้อมแจ้งเตือนวันนัดถัดไปและผู้ปกครองสามารถติดตามพัฒนาการด้านร่างกายและพฤติกรรมของเด็กได้ง่าย
          </p>
          <div className="flex justify-center">
            {/* แสดงปุ่ม "เข้าสู่ระบบ" ถ้ายังไม่ได้ล็อกอิน */}
            {!user ? (
              <button
                className="btn bg-[#E51317] text-white px-8 py-3 font-semibold rounded-full"
                onClick={() => navigate("/signup")}
              >
                ลงทะเบียน
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-lg text-[#4a4a4a]">
                  สวัสดี {user.firstName},
                  <span className="text-[#E51317]"> มาติดตามพัฒนาการของเด็กกันเถอะ </span>
                </span>
                {/* <button
                  className="btn bg-[#FFD700] text-white px-4 py-2 rounded-full"
                  onClick={() => navigate("/dashboard")}
                >
                  ดูข้อมูลการรับวัคซีน
                </button>
                <button
                  className="btn bg-[#FFD700] text-white px-4 py-2 rounded-full"
                  onClick={() => navigate("/dashboard")}
                >
                  ดูข้อมูลพัฒนาการ
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;