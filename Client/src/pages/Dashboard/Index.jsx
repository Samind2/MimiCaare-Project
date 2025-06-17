import React from 'react';
import { FaUserFriends, FaSyringe, FaChild } from 'react-icons/fa';

const Index = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {/* การ์ด จัดการผู้ใช้ */}
      <div className="bg-pink-100 text-pink-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <div className="flex items-center gap-3 mb-4">
          <FaUserFriends size={28} className="text-pink-600" />
          <h2 className="text-xl font-bold">จัดการผู้ใช้</h2>
        </div>
        <p className="text-sm mb-6">ดูและจัดการข้อมูลผู้ใช้งานทั้งหมด</p>
        <a
          href="/dashboard/ManageRights"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition"
        >
          ไปที่จัดการผู้ใช้
        </a>
      </div>

      {/* การ์ด จัดการวัคซีน */}
      <div className="bg-blue-100 text-blue-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <div className="flex items-center gap-3 mb-4">
          <FaSyringe size={28} className="text-blue-600" />
          <h2 className="text-xl font-bold">จัดการวัคซีน</h2>
        </div>
        <p className="text-sm mb-6">เพิ่มและจัดการข้อมูลวัคซีนในระบบ</p>
        <a
          href="/dashboard/add-vaccine"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition"
        >
          จัดการข้อมูลวัคซีน
        </a>
      </div>

      {/* การ์ด จัดการพัฒนาการ */}
      <div className="bg-green-100 text-green-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <div className="flex items-center gap-3 mb-4">
          <FaChild size={28} className="text-green-600" />
          <h2 className="text-xl font-bold">จัดการพัฒนาการ</h2>
        </div>
        <p className="text-sm mb-6">เพิ่มข้อมูลพัฒนาการของเด็กในระบบ</p>
        <a
          href="/dashboard/add-development"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition"
        >
          จัดการข้อมูลพัฒนาการ
        </a>
      </div>
    </div>
  );
};

export default Index;
