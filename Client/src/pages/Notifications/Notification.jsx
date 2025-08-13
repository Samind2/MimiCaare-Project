import React, { useEffect, useState } from 'react';
import NotificationService from '../../service/notification.service';
import { toast } from 'react-toastify';
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { FaChild } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
// import { FaRegCalendarAlt } from "react-icons/fa"; // ปฏิทิน

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ดึงข้อมูลการแจ้งเตือน
  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotificationsByUserId();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.log('เกิดข้อผิดพลาดในการดึงการแจ้งเตือน');
    }
  };

  // เมื่อกดที่แจ้งเตือน
  const handleNotificationClick = async (notify) => {
    try {
      if (!notify.isRead) { //เช็คว่าแจ้งเตือนยังไม่ได้อ่าน
        await NotificationService.markAsRead(notify.id); // เมื่อกดแล้วจะเปลี่ยนสถานะว่าอ่านแล้ว
        fetchNotifications(); 
      }

      // เช็คประเภทแล้วเปลี่ยนหน้าไปที่หน้าประเมินพัฒนาการกับบันทึกการรับวัคซีน
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

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">รายการแจ้งเตือน</h2>
      {notifications.length === 0 ? (
        <p>ไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notify) => (
            <li
              key={notify.id}
              onClick={() => handleNotificationClick(notify)} //คลิกทั้งรายการ
              className={`border shadow rounded p-4 cursor-pointer hover:bg-gray-50 ${
                notify.isRead
                  ? "bg-white"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <PiBellSimpleRingingFill className="text-yellow-500" />
                <span>{notify.title || 'ไม่มีหัวข้อ'}</span>
              </div>

              {notify.childName && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaChild />
                  ชื่อเด็ก: {notify.childName}
                </p>
              )}

              {notify.ageRange && (
                <p className="text-sm mt-1">ช่วงอายุ: {notify.ageRange} เดือน</p>
              )}

              {notify.type && (
                <p className="text-sm mt-1">ประเภท: {notify.type}</p>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
