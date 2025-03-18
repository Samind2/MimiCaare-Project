import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [selectedMenu, setSelectedMenu] = useState();
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทาง

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu); // ตั้งค่า selectedMenu เมื่อคลิกที่เมนู
    navigate(menu); // นำทางไปที่ URL ตามชื่อเมนู
  };
  

  return (
    <div className="relative flex items-center justify-between bg-white py-4 px-8 shadow-md">
      {/* เมนูด้านซ้าย */}
      <div className="flex gap-6">
        {/* เมนู หน้าหลัก */}
        <a
          onClick={() => handleMenuClick("/")}
          className={`cursor-pointer transition-colors duration-300 ${
            selectedMenu === "/" 
              ? "font-bold border-b-2 border-black" 
              : "text-gray-600 hover:text-black"
          }`}
        >
          หน้าหลัก
        </a>

        {/* เมนู ข้อมูลเด็ก */}
        <a
          onClick={() => handleMenuClick("/ChildInformation")}
          className={`cursor-pointer transition-colors duration-300 ${
            selectedMenu === "/ChildInformation" 
              ? "font-bold border-b-2 border-black" 
              : "text-gray-600 hover:text-black"
          }`}
        >
          ข้อมูลเด็ก
        </a>

        {/* เมนู วัคซีน */}
        <a
          onClick={() => handleMenuClick("/Vaccine")}
          className={`cursor-pointer transition-colors duration-300 ${
            selectedMenu === "/Vaccine" 
              ? "font-bold border-b-2 border-black" 
              : "text-gray-600 hover:text-black"
          }`}
        >
          วัคซีน
        </a>

        {/* เมนู พัฒนาการ */}
        <a
          onClick={() => handleMenuClick("/Development")}
          className={`cursor-pointer transition-colors duration-300 ${
            selectedMenu === "/Development" 
              ? "font-bold border-b-2 border-black" 
              : "text-gray-600 hover:text-black"
          }`}
        >
          พัฒนาการ
        </a>
      </div>

      {/* โลโก้ตรงกลาง */}
<div className="absolute left-1/2 transform -translate-x-1/2">
  <a href="/" >
    <img
      src="/Mimicare(1).png"
      alt="Logo"
      className="h-25 lg:h-28 mx-auto"
    />
  </a>
</div>


      {/* เมนูด้านขวา */}
      <div className="flex gap-6 items-center">
        {/* ไอคอนแจ้งเตือน */}
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        {/* Dropdown โปรไฟล์ */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Profile"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;