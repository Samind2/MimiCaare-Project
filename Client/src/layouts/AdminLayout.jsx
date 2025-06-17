import React from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserFriends, FaSyringe, FaChild } from 'react-icons/fa';
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useContext } from 'react'; // ต้องใช้ useContext
import { AuthContext } from '../context/AuthContext'; // นำเข้า AuthContext
import { useNavigate } from "react-router-dom";



const AdminLayout = () => { // สร้าง AdminLayout
    const { logout } = useContext(AuthContext)
    const isAdmin = true;
    const location = useLocation();
    const navigate = useNavigate();

    // แปลง pathname เป็น breadcrumb
    const breadcrumb = location.pathname
        .split("/")
        .filter((path) => path)
        .map((path, index, array) => {
            const url = `/${array.slice(0, index + 1).join("/")}`;
            return { label: path.replace(/-/g, " "), url };
        });

    // ฟังก์ชัน Logout
    const handleLogout = () => {
        logout(); // เรียกใช้ logout จาก AuthContext
        navigate("/"); // นำทางกลับไปที่หน้า Home
    };

    return (
        <div>
            {isAdmin ? (
                <div className="drawer lg:drawer-open">
                    <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content flex flex-col w-full">
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
                    <div className="drawer-side">
                        <label
                            htmlFor="my-drawer-2"
                            aria-label="close sidebar"
                            className="drawer-overlay"
                        ></label>
                        <ul className="menu bg-[#FCEFEF] text-[#5F6F65] min-h-full w-80 p-4 rounded-r-3xl shadow-lg">
                            <li className="mb-6 text-center">
                                <Link to="/" className="flex flex-col items-center space-y-2">
                                    <img src="/Mimicare(1).png" alt="Logo" className="h-24" />
                                    <span className="badge badge-secondary px-4 py-2 rounded-full bg-pink-200 text-pink-800">
                                        Admin
                                    </span>
                                </Link>
                            </li>

                            <div className="divider before:bg-pink-300 after:bg-pink-300 text-pink-500">เมนู</div>

                            <li>
                                <Link to="/dashboard" className="hover:bg-pink-100 rounded-xl">
                                    <MdSpaceDashboard />
                                    หน้าหลัก
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/ManageRights" className="hover:bg-pink-100 rounded-xl">
                                    <FaUserFriends />
                                    จัดการสิทธิ์ผู้ใช้
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/add-Vaccine" className="hover:bg-pink-100 rounded-xl">
                                    <FaSyringe />
                                    จัดการข้อมูลวัคซีน
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/add-Development" className="hover:bg-pink-100 rounded-xl">
                                    <FaChild />
                                    ข้อมูลพัฒนาการ
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/manageUser" className="hover:bg-pink-100 rounded-xl">
                                    <FaUserFriends />
                                    ผู้ใช้ทั้งหมด
                                </Link>
                            </li>

                            {/* ปุ่ม Logout ที่ปรับให้ดูอบอุ่น */}
                            <div className="mt-8 px-2">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 text-white py-3 px-4 rounded-full font-bold shadow-md hover:scale-105 transition-transform duration-300 ease-in-out flex items-center justify-center gap-2"
                                >
                                    <FiLogOut size={20} />
                                    <span>ออกจากระบบ</span>
                                </button>
                            </div>
                        </ul>
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