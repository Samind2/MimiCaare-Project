import React, { useContext, useState, useEffect } from "react";
import { ImHome3 } from "react-icons/im";
import { MdOutlineVaccines, MdNotifications } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { AuthContext } from "../../context/AuthContext";
import { FaChild } from "react-icons/fa";
import { RiInfoCardFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import NotificationService from "../../service/notification.service";
import "./Navbar.css";

const NavBar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);


  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotificationsByUserId();
      const notifications = response.data.notifications || [];
      const unreadExists = notifications.some(n => !n.isRead); // เช็คว่ามีแจ้งเตือนที่ยังไม่อ่านไหม
      setHasUnread(unreadExists);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลแจ้งเตือน", error);
    }
  };

  return (
    <div className="relative bg-white shadow-md px-4 py-4">
      <div className="flex items-center justify-between w-full">
        {/* เมนูซ้าย */}
        <div className="nav-left hidden md:flex gap-6 items-center flex-1">
          {/* เมนูไอคอน */}
          <a href="/" className="flex flex-col items-center menu-item"
          data-testid="home-Page">
            <ImHome3 className="w-6 h-6" />
            <span>หน้าหลัก</span>
          </a>
          <a href="/profile-child" className="flex flex-col items-center menu-item"
          data-testid="Child-Page"
          >
            <RiInfoCardFill className="w-6 h-6" />
            <span>ข้อมูลเด็ก</span>
          </a>
          <a href="/ViewVaccine" className="flex flex-col items-center menu-item"
          data-testid="Vaccine-Page">
            <MdOutlineVaccines className="w-6 h-6" />
            <span>วัคซีน</span>
          </a>
          <a href="/ViewDevelopment" className="flex flex-col items-center menu-item"
          data-testid="Develoment-page">
            <FaChild className="w-6 h-6" />
            <span>พัฒนาการ</span>
          </a>
        </div>

        {/* เมนูตรงกลางโลโก้ */}
        <div className="flex justify-center flex-1">
          <a href="/">
            <img src="/Mimicare(1).png" alt="Logo" className="h-16 md:h-20" />
          </a>
        </div>

        {/* เมนูขวา */}
        <div className="nav-right hidden md:flex gap-6 items-center justify-end flex-1">
          {user && (
            <button className="btn btn-ghost btn-circle relative">
              <a href="/Notification" className="indicator">
                <MdNotifications className="h-5 w-5" />
                {hasUnread && ( // ✅ แสดงจุดแดงถ้ามีแจ้งเตือนที่ยังไม่อ่าน
                  <span className="badge badge-xs badge-primary indicator-item"></span>
                )}
              </a>
            </button>
          )}
          {!user ? (
            <button
              className="btn bg-[#E51317] text-white px-4 py-2 font-semibold rounded-full"
              onClick={() => navigate("/Signin")}
            >
              เข้าสู่ระบบ
            </button>
          ) : (
            <Profile />
          )}
        </div>

        {/* Hamburger (mobile) แต่ละ <div> แทนจำนวนขีดของ hamburger menu */}
        <GiHamburgerMenu
          className="text-2xl cursor-pointer md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu mt-4 md:hidden">
          <a href="/" className="block py-2 menu-item">หน้าหลัก</a>
          <a href="/profile-child" className="block py-2 menu-item">ข้อมูลเด็ก</a>
          <a href="/ViewVaccine" className="block py-2 menu-item">วัคซีน</a>
          <a href="/ViewDevelopment" className="block py-2 menu-item">พัฒนาการ</a>
          {!user ? (
            <button className="btn w-full mt-2" onClick={() => navigate("/Signin")}>
              เข้าสู่ระบบ
            </button>
          ) : (
            <a href="/profile-parent" className="block py-2 menu-item">โปรไฟล์</a>
          )}
        </div>
      )}
    </div>
  );
};

export default NavBar;


