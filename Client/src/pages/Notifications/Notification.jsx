import React, { useEffect, useState, useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { toast } from 'react-toastify';
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { FaChild } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const { notifications, fetchNotifications, markAsRead } = useContext(NotificationContext);
  const [selectedChild, setSelectedChild] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงข้อมูลแจ้งเตือนเมื่อ component โหลด
    fetchNotifications();
  }, []);

  useEffect(() => {
    // ตั้งค่า default tab เป็นเด็กคนแรกที่มีแจ้งเตือน
    const firstChildWithNotification = notifications.find(notification => notification.childName)?.childName;
    if (firstChildWithNotification) {
      setSelectedChild(firstChildWithNotification);
    }
  }, [notifications]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id); // ทำเครื่องหมายว่าอ่านแล้ว
        fetchNotifications(); // รีเฟรชข้อมูล
      }

      switch (notification.type) {
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

  // จัดกลุ่มแจ้งเตือนตามชื่อเด็ก
  const notificationsGroupedByChild = notifications.reduce((groupedNotifications, notification) => {
    if (!notification.childName) return groupedNotifications;

    if (!groupedNotifications[notification.childName]) {
      groupedNotifications[notification.childName] = [];
    }

    groupedNotifications[notification.childName].push(notification);

    return groupedNotifications;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">รายการแจ้งเตือน</h2>

      {Object.keys(notificationsGroupedByChild).length === 0 ? (
        <p>ไม่มีการแจ้งเตือน</p>
      ) : (
        <>
          {/* แสดงแท็บชื่อเด็ก */}
          <div role="tablist" className="tabs tabs-lift mb-4">
            {Object.keys(notificationsGroupedByChild).map((childName) => (
              <a
                key={childName}
                role="tab"
                className={`tab ${selectedChild === childName ? "tab-active" : ""}`}
                onClick={() => setSelectedChild(childName)}
              >
                {childName}
              </a>
            ))}
          </div>

          {/* แสดงรายการแจ้งเตือนของเด็กที่เลือก */}
          <ul className="space-y-3">
            {notificationsGroupedByChild[selectedChild]?.map((notification) => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`border shadow rounded p-4 cursor-pointer hover:bg-gray-50 ${notification.isRead ? "bg-white" : "bg-red-50 border-red-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <PiBellSimpleRingingFill className="text-yellow-500" />
                  <span>{notification.title || 'ไม่มีหัวข้อ'}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaChild />
                  ชื่อเด็ก: {notification.childName}
                </p>

                {notification.ageRange != null && (
                  <p className="text-sm mt-1">ช่วงอายุ: {notification.ageRange} เดือน</p>
                )}

                {notification.type && (
                  <p className="text-sm mt-1">ประเภท: {notification.type}</p>
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
