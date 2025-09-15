import React, { useEffect, useState, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { toast } from 'react-toastify';
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { FaChild } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const { notifications, fetchNotifications, markAsRead } = useContext(NotificationContext);
  const [activeChild, setActiveChild] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // ตั้งค่า default tab เป็นเด็กคนแรก
    const firstChild = notifications.find(n => n.childName)?.childName;
    if (firstChild) {
      setActiveChild(firstChild);
    }
  }, [notifications]);

  const handleNotificationClick = async (notify) => {
    try {
      if (!notify.isRead) {
        await markAsRead(notify.id); // เรียกจาก context แทน service
        fetchNotifications();
      }

      switch (notify.type) {
        case 'vaccine':
          navigate('/ViewVaccine');
          break;
        case 'development':
          navigate('/ViewDevelopment');
          break;
        default:
          console.log("ไม่มีเส้นทางสำหรับประเภทนี้");
      }
    } catch {
      toast.error("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  // จัดกลุ่มตาม ชื่อเด็ก
  const groupedNotifications = notifications.reduce((childrenGroups, notify) => {
    if (!notify.childName) return childrenGroups; 
    if (!childrenGroups[notify.childName]) childrenGroups[notify.childName] = [];
    childrenGroups[notify.childName].push(notify);
    return childrenGroups;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">รายการแจ้งเตือน</h2>

      {Object.keys(groupedNotifications).length === 0 ? (
        <p>ไม่มีการแจ้งเตือน</p>
      ) : (
        <>
          {/* Tabsแสดงชื่อเด็ก */}
          <div role="tablist" className="tabs tabs-lift mb-4">
            {Object.keys(groupedNotifications).map((child) => (
              <a
                key={child}
                role="tab"
                className={`tab ${activeChild === child ? "tab-active" : ""}`}
                onClick={() => setActiveChild(child)}
              >
                {child}
              </a>
            ))}
          </div>

          {/* แสดงการแจ้งเตือนของเด็กที่เลือก */}
          <ul className="space-y-3">
            {groupedNotifications[activeChild]?.map((notify) => (
              <li
                key={notify.id}
                onClick={() => handleNotificationClick(notify)}
                className={`border shadow rounded p-4 cursor-pointer hover:bg-gray-50 ${
                  notify.isRead ? "bg-white" : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <PiBellSimpleRingingFill className="text-yellow-500" />
                  <span>{notify.title || 'ไม่มีหัวข้อ'}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaChild />
                  ชื่อเด็ก: {notify.childName}
                </p>

                {notify.ageRange && (
                  <p className="text-sm mt-1">ช่วงอายุ: {notify.ageRange} เดือน</p>
                )}

                {notify.type && (
                  <p className="text-sm mt-1">ประเภท: {notify.type}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Notification;
