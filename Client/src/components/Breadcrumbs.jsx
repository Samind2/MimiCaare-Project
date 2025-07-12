// src/components/Breadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = ({ shouldHide = false }) => {
  const location = useLocation();
  if (shouldHide) return null;

  const pathNameMap = {
  "profile-child": "ข้อมูลเด็ก",
  "profile-child-update": "แก้ไขข้อมูลเด็ก",
  "profile-parent": "ข้อมูลผู้ปกครอง",
  "profile-update": "แก้ไขโปรไฟล์",
  "notification": "การแจ้งเตือน",
  "addChild": "เพิ่มข้อมูลเด็ก",
  "ViewVaccine": "ประวัติการรับวัคซีน",
  "ViewDevelopment": "พัฒนาการเด็ก",
  "signup": "สมัครสมาชิก",
  "signin": "เข้าสู่ระบบ",
};

  const paths = location.pathname.split("/").filter((path) => path);

  return (
    <div className="breadcrumbs text-sm py-4">
      <ul>
        <li>
          <Link to="/" className="inline-flex items-center gap-1 text-[#E51317] hover:text-[#b01013] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-4 w-4 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            หน้าแรก
          </Link>
        </li>

        {paths.map((path, index) => {
          const to = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const displayName = pathNameMap[path] || decodeURIComponent(path);

          return (
            <li key={to}>
              {isLast ? (
                <span className="inline-flex items-center gap-2 text-gray-500">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={to}
                  className="inline-flex items-center gap-1 text-[#114965] hover:text-[#0d3a4d] transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
