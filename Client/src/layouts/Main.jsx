import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import Footer from "../components/Footer";
import "./Main.css";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((path) => path); //ดึง pathname ปัจจุบัน 

  return (
    <nav className="bg-white shadow-md rounded-lg p-3 mb-4">
      <ol className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
        <li>
          <Link
            to="/"
            className="flex items-center text-[#E51317] hover:text-[#b01013] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4H9v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9z" />
            </svg>
            หน้าแรก
          </Link>
        </li>

        {paths.map((path, index) => { // แสดง breadcrumb สำหรับแต่ละหน้า
          const to = `/${paths.slice(0, index + 1).join("/")}`; // URL สำหรับ breadcrumb
          const isLast = index === paths.length - 1; // ตรวจสอบว่า breadcrumb สุดท้ายหรือไม่
          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="text-gray-400 h-4 w-4 mx-2" />  
              <Link //สร้างลิงก์ ไปยังแต่ละหน้า
                to={to}
                className="text-[#114965] hover:text-[#0d3a4d] transition-colors capitalize"
              >
                {decodeURIComponent(path)} 
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const Main = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto p-4">
        <Breadcrumbs />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Main;
