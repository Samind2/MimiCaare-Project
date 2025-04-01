import React from "react";

const HeroSection = () => {
  return (
    <div className="section-container bg-gradient-to-r from-[#FAFAFA] to-[#FCFCFC]">
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
            <a
              className="btn bg-[#E51317] px-8 py-3 font-semibold text-white rounded-full"
              href="/Signup"
            >
              ลงทะเบียน
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;