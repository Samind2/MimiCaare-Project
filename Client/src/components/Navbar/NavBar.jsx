import React, { useContext } from "react";
import { ImHome3 } from "react-icons/im";
import { MdOutlineVaccines, MdNotifications } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { AuthContext } from "../../context/AuthContext";
import { FaChild } from "react-icons/fa";
import { RiInfoCardFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import { NotificationContext } from "../../context/NotificationContext";

import "./Navbar.css";

const NavBar = () => {
  const { user } = useContext(AuthContext);
  const { hasUnread } = useContext(NotificationContext);
  const navigate = useNavigate();



  return (
    <div className="relative bg-white shadow-md px-4 py-2">
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
            <img
              src="/Mimicare(1).png"
              alt="Logo"
              className="h-24 md:h-28 object-contain mx-auto "
            />
          </a>
        </div>

        {/* เมนูขวา */}
        <div className="nav-right hidden md:flex gap-6 items-center justify-end flex-1">
          {user && (
            <button className="btn btn-ghost btn-circle relative">
              <a href="/Notification" className="indicator" data-testid="notification-button">
                <MdNotifications className={`h-7 w-7 ${hasUnread ? 'shake' : ''}`} />
                {hasUnread && (
                  <span className="badge badge-xs badge-primary indicator-item"></span>
                )}
              </a>
            </button>
          )}
          {!user ? (
            <button 
              data-testid="signin-button"
              className="btn bg-[#E51317] text-white px-4 py-2 font-semibold rounded-full"   
              onClick={() => navigate("/Signin")}
            >
              เข้าสู่ระบบ
            </button>
          ) : (
            <Profile />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;


