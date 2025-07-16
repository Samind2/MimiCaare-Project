import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import childService from "../service/child.service"; // 👈 import service

const Breadcrumbs = ({ shouldHide = false }) => {
  const location = useLocation();
  const [childName, setChildName] = useState("");

  if (shouldHide) return null;

  const pathNameMap = {
    "profile-child": "ข้อมูลเด็ก",
    "profile-child-update": "แก้ไขข้อมูลเด็ก",
    "profile-parent": "ข้อมูลผู้ปกครอง",
    "profile-update": "แก้ไขโปรไฟล์",
    "notification": "การแจ้งเตือน",
    "addchild": "เพิ่มข้อมูลเด็ก",
    "viewvaccine": "ประวัติการรับวัคซีน",
    "viewdevelopment": "พัฒนาการเด็ก",
    "signup": "สมัครสมาชิก",
    "signin": "เข้าสู่ระบบ",
    "add-vaccine": "เพิ่มข้อมูลวัคซีน",
    "add-development": "เพิ่มข้อมูลพัฒนาการ",
    "managerights": "จัดการสิทธิ์ผู้ใช้",
    "alluser": "จัดการผู้ใช้",
    "dashboard": "แดชบอร์ด"
  };

  const paths = location.pathname.split("/").filter((path) => path);

  // ✅ ดึงชื่อเด็กเมื่อพบว่า path เป็น profile-child-update/:id
  useEffect(() => {
    const fetchChildName = async () => {
      if (paths[0] === "profile-child-update" && paths[1]) {
        try {
          const res = await childService.getChildById(paths[1]);
          const child = res.data.children;
          if (child?.firstName && child?.lastName) {
            setChildName(`${child.firstName} ${child.lastName}`);
          }
        } catch (err) {
          console.error("ไม่สามารถโหลดชื่อเด็กได้", err);
        }
      }
    };

    fetchChildName();
  }, [location.pathname]);

  return (
    <div className="breadcrumbs text-sm py-4">
      <ul>
        <li>
          <Link to="/" className="inline-flex items-center gap-1 text-[#E51317] hover:text-[#b01013] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            หน้าแรก
          </Link>
        </li>

        {paths.map((path, index) => {
          const to = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          let displayName = pathNameMap[path.toLowerCase()] || decodeURIComponent(path);

          // ปลี่ยนจาก profile-child-update/:id เปลี่ยนเป็นชื่อเด็ก
          if (paths[0] === "profile-child-update" && index === 1 && childName) {
            displayName = ` ${childName}`;
          }

          return (
            <li key={to}>
              {isLast ? (
                <span className="inline-flex items-center gap-2 text-gray-500">
                  {displayName}
                </span>
              ) : (
                <Link to={to} className="inline-flex items-center gap-1 text-[#114965] hover:text-[#0d3a4d] transition-colors">
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
