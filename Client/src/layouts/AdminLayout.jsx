import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserFriends, FaSyringe, FaChild } from 'react-icons/fa';
import { FiLogOut } from "react-icons/fi";
import { AuthContext } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

const AdminLayout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="bg-[#FCEFEF] text-[#5F6F65] w-64 p-6 flex flex-col shadow-lg rounded-r-3xl">
                <div to="/" className="flex flex-col items-center space-y-2 mb-6">
                    <img src="/Mimicare(1).png" alt="Logo" className="h-24" />
                    <span className="badge badge-secondary px-4 py-2 rounded-full bg-pink-200 text-pink-800">
                        Admin
                    </span>
                </div>

                <div className="divider before:bg-pink-300 after:bg-pink-300 text-pink-500">
                    เมนู
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-auto">
                    <Link to="/dashboard" className="hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2">
                        <MdSpaceDashboard size={24} /> <span>หน้าหลัก</span>
                    </Link>
                    <Link to="/dashboard/ManageRights" className="hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2">
                        <FaUserFriends size={20} /> <span>จัดการสิทธิ์ผู้ใช้</span>
                    </Link>
                    <Link to="/dashboard/add-Vaccine" className="hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2">
                        <FaSyringe size={20} /> <span>จัดการข้อมูลวัคซีน</span>
                    </Link>
                    <Link to="/dashboard/add-Development" className="hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2">
                        <FaChild size={20} /> <span>ข้อมูลพัฒนาการ</span>
                    </Link>
                    <Link to="/dashboard/AllUser" className="hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2">
                        <FaUserFriends size={20} /> <span>ผู้ใช้ทั้งหมด</span>
                    </Link>
                </nav>

                <div className="mt-auto">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 text-white py-3 px-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                    >
                        <FiLogOut size={20} /> <span>ออกจากระบบ</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full overflow-auto">
                <div className="w-full bg-white shadow-md px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <Breadcrumbs />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-start p-6">
                    <Outlet />
                </div>
            </div>
        </div> // <-- ปิด div หลักให้ถูกต้อง
    );
};

export default AdminLayout;
