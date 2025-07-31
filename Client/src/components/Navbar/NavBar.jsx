import React, { useContext } from "react";
import { ImHome3 } from "react-icons/im";
import { MdOutlineVaccines } from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";
import { FaChild } from "react-icons/fa";
import { RiInfoCardFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import "./Navbar.css";

const NavBar = () => {
  const { user } = useContext(AuthContext); // ดึงข้อมูล user จาก context
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between bg-white py-4 px-8 shadow-md">
      {/* เมนูด้านซ้าย */}
      <div className="flex gap-6">
        {/* เมนู หน้าหลัก */}
        <a href="/" className="flex flex-col items-center gap-1 menu-item"
          data-testid="home-Page">
          <ImHome3 className="w-6 h-6" />
          <span>หน้าหลัก</span>
        </a>

        {/* เมนู ข้อมูลเด็ก */}
        <a
          href="/profile-child"
          className="flex flex-col items-center gap-1 menu-item"
          data-testid="Child-Page"
        >
          <RiInfoCardFill className="w-6 h-6" />
          <span>ข้อมูลเด็ก</span>
        </a>

        {/* เมนู วัคซีน */}
        <a
          href="/ViewVaccine"
          className="flex flex-col items-center gap-1 menu-item"
          data-testid="Vaccine-Page"
        >
          <MdOutlineVaccines className="w-6 h-6" />
          <span>วัคซีน</span>
        </a>

        {/* เมนู พัฒนาการ */}
        <a
          href="/ViewDevelopment"
          data-testid="Develoment-page"
          className="flex flex-col items-center gap-1 menu-item"
          datatestid="Development-Page"
        >
          <FaChild className="w-6 h-6" />
          <span>พัฒนาการ</span>
        </a>
      </div>

      {/* โลโก้ตรงกลาง */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <a href="/">
          <img
            src="/Mimicare(1).png"
            alt="Logo"
            className="h-25 lg:h-28 mx-auto"
          />
        </a>
      </div>

      {/* เมนูด้านขวา */}
      <div className="flex gap-6 items-center">
        {user && (
          <button data-testid="notification-button" className="btn btn-ghost btn-circle">
            <a href='/Notification' className="indicator">
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
            </a>
          </button>
        )}
        {/* แสดงปุ่ม "เข้าสู่ระบบ" ถ้ายังไม่ได้ล็อกอิน */}
        {!user ? (
          <button
            className="btn bg-[#E51317] text-white px-8 py-3 font-semibold rounded-full"
            onClick={() => navigate("/Signin")}
          >
            เข้าสู่ระบบ
          </button>
        ) : (
          // ใช้ Profile component โดยตรงเพื่อให้แน่ใจว่าสามารถคลิกได้
          <div className="relative">
            <Profile />
          </div>
        )}
        <div className="dropdown dropdown-end">
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a href='/profile-parent'>
                Profile
                <span className="badge">New</span>
              </a>
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
