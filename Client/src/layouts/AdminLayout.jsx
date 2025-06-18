import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserFriends, FaSyringe, FaChild } from 'react-icons/fa';
import { FiLogOut } from "react-icons/fi";
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useContext(AuthContext)
    const isAdmin = true;
    const location = useLocation();
    const navigate = useNavigate();

    // ใช้ useState เพื่อจัดการสถานะการขยายของ Sidebar
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); 

    // สร้าง breadcrumb จาก path ของ location
    const breadcrumb = location.pathname 
        .split("/")
        .filter((path) => path)
        .map((path, index, array) => {
            const url = `/${array.slice(0, index + 1).join("/")}`;
            return { label: path.replace(/-/g, " "), url };
        });

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // ฟังก์ชันสำหรับตรวจสอบเมนู active แบบ startsWith
    const isActive = (path) => location.pathname.startsWith(path); 

    return (
        <div>
            {isAdmin ? (
                <div className="flex">
                    {/* Sidebar */}
                    <div
                        onMouseEnter={() => setIsSidebarExpanded(true)}
                        onMouseLeave={() => setIsSidebarExpanded(false)}
                        className={`
                            bg-[#FCEFEF] text-[#5F6F65] min-h-screen
                            shadow-lg rounded-r-3xl
                            flex flex-col
                            transition-width duration-300 ease-in-out
                            ${isSidebarExpanded ? "w-64 p-6" : "w-20 p-2"}
                            overflow-hidden
                        `}
                    >
                        <Link to="/" className="flex flex-col items-center space-y-2 mb-6">
                            <img src="/Mimicare(1).png" alt="Logo" className={`h-24 transition-all duration-300 ${isSidebarExpanded ? "" : "w-12 h-12"}`} />
                            {isSidebarExpanded && (
                                <span className="badge badge-secondary px-4 py-2 rounded-full bg-pink-200 text-pink-800">
                                    Admin
                                </span>
                            )}
                        </Link>

                        <div className={`divider before:bg-pink-300 after:bg-pink-300 text-pink-500 ${isSidebarExpanded ? "" : "hidden"}`}>
                            เมนู
                        </div>

                        <nav className="flex flex-col gap-2">
                            <Link
                                to="/dashboard"
                                className={`hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2 ${
                                    isActive("/dashboard") && !isActive("/dashboard/") ? "border-2 border-pink-500 bg-pink-50" : ""
                                }`}
                            >
                                <MdSpaceDashboard size={24} />
                                {isSidebarExpanded && <span>หน้าหลัก</span>}
                            </Link>

                            <Link
                                to="/dashboard/ManageRights"
                                className={`hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2 ${
                                    isActive("/dashboard/ManageRights") ? "border-2 border-pink-500 bg-pink-50" : ""
                                }`}
                            >
                                <FaUserFriends size={20} />
                                {isSidebarExpanded && <span>จัดการสิทธิ์ผู้ใช้</span>}
                            </Link>

                            <Link
                                to="/dashboard/add-Vaccine"
                                className={`hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2 ${
                                    isActive("/dashboard/add-Vaccine") ? "border-2 border-pink-500 bg-pink-50" : ""
                                }`}
                            >
                                <FaSyringe size={20} />
                                {isSidebarExpanded && <span>จัดการข้อมูลวัคซีน</span>}
                            </Link>

                            <Link
                                to="/dashboard/add-Development"
                                className={`hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2 ${
                                    isActive("/dashboard/add-Development") ? "border-2 border-pink-500 bg-pink-50" : ""
                                }`}
                            >
                                <FaChild size={20} />
                                {isSidebarExpanded && <span>ข้อมูลพัฒนาการ</span>}
                            </Link>

                            <Link
                                to="/dashboard/AllUser"
                                className={`hover:bg-pink-100 rounded-xl flex items-center gap-2 p-2 ${
                                    isActive("/dashboard/AllUser") ? "border-2 border-pink-500 bg-pink-50" : ""
                                }`}
                            >
                                <FaUserFriends size={20} />
                                {isSidebarExpanded && <span>ผู้ใช้ทั้งหมด</span>}
                            </Link>
                        </nav>

                        <div className="mt-auto">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 text-white py-3 px-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center justify-center gap-2"
                            >
                                <FiLogOut size={20} />
                                {isSidebarExpanded && <span>ออกจากระบบ</span>}
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col w-full">
                        {/* Breadcrumb Navigation */}
                        <div className="p-4 bg-gray-100 border-b text-gray-700">
                            <nav className="text-sm breadcrumbs">
                                <ul className="flex space-x-2">
                                    {breadcrumb.map((item, index) => (
                                        <li key={index} className="flex items-center">
                                            <span className="mx-2">/</span>
                                            {index === breadcrumb.length - 1 ? (
                                                <span className="text-gray-500">{item.label}</span>
                                            ) : (
                                                <Link
                                                    to={item.url}
                                                    className="text-red hover:underline"
                                                >
                                                    {item.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>

                        {/* Page content here */}
                        <div className="flex flex-col items-center justify-center p-6">
                            <Outlet />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 text-center text-red-500 font-bold">
                    You are not an Admin!{" "}
                    <Link to="/" className="underline">
                        Back to Home
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
