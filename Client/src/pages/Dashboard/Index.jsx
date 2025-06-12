import React from 'react';

const Index = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
     {/* การ์ด จัดการผู้ใช้ */}
      <div className="bg-gray-800 text-white p-4 rounded-md bg-cover bg-center"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <h2 className="font-semibold mb-2">จัดการผู้ใช้</h2>
        <p className="text-sm mb-4">ดูและจัดการข้อมูลผู้ใช้งานทั้งหมด</p>
        <a href="/dashboard/manageUser" className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-md">ไปที่จัดการผู้ใช้</a>
      </div>

      {/* การ์ด เพิ่มวัคซีน */}
      <div className="bg-gray-800 text-white p-4 rounded-md bg-cover bg-center"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <h2 className="font-semibold mb-2">จัดการข้อมูลวัคซีน</h2>
        <p className="text-sm mb-4">เพิ่มข้อมูลวัคซีนใหม่ให้กับระบบ</p>
        <a href="/dashboard/add-vaccine" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md">จัดการข้อมูลวัคซีน</a>
      </div>

      {/* การ์ด เพิ่มพัฒนาการ */}
      <div className="bg-gray-800 text-white p-4 rounded-md bg-cover bg-center"
        style={{ backgroundImage: "url('/BG-Card.png')" }}>
        <h2 className="font-semibold mb-2">จัดการข้อมูลพัฒนาการ</h2>
        <p className="text-sm mb-4">เพิ่มข้อมูลพัฒนาการเด็กใหม่ลงในระบบ</p>
        <a href="/dashboard/add-development" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md">จัดการข้อมูลพัฒนาการ</a>
      </div>
    </div>
  );
};

export default Index;