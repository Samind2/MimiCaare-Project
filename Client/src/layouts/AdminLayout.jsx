import React from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { MdSpaceDashboard } from "react-icons/md";
import { FaCartArrowDown } from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa";
import { MdOutlineDashboardCustomize } from "react-icons/md";
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
                        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                            {/* Sidebar content */}
                            <li>
                                <Link
                                    to="/"
                                    className="flex items-center space-x-2 mb-3"
                                >
                                    <img
                                        src="/Mimicare(1).png"
                                        alt="Logo"
                                        className="h-25 lg:h-28 mx-auto"
                                    />
                                    <div className="badge badge-primary">Admin</div>
                                </Link>
                            </li>
                            <div className="relative flex py-8 items-center">
                                <div className="flex-grow border-t border-gray-400"></div>
                                <div className="flex-shrink mx-4 text-gray-400">Menu</div>
                                <div className="flex-grow border-t border-gray-400"></div>
                            </div>
                            <li>
                                <Link to="/dashboard">
                                    <MdSpaceDashboard />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/add-Vaccine">
                                    <FaCartArrowDown />
                                    Manage Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/add-Development">
                                    <FaCartPlus />
                                    Add Product
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/manageItems">
                                    <MdOutlineDashboardCustomize />
                                    Manage Item
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/manageUser">
                                    <FaUser />
                                    All User
                                </Link>
                            </li>
                            <div className="relative flex py-8 items-center">
                                <div className="flex-grow border-t border-gray-400"></div>
                                <div className="flex-shrink mx-4 text-gray-400">Menu</div>
                                <div className="flex-grow border-t border-gray-400"></div>
                            </div>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/products">Products</Link>
                            </li>
                            <li>
                                <Link to="/order-tracking">Order Tracking</Link>
                            </li>
                            <li>
                                <Link to="/customer-support">Customer Support</Link>
                            </li>
                            {/* ปุ่ม Logout */}
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleLogout} // เรียกฟังก์ชัน handleLogout
                                    className="w-full bg-red text-white p-3 rounded-lg font-bold hover:bg-secondary transition-all ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <FiLogOut size={24} />
                                    <span>LOGOUT</span>
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