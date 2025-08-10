import React, { useEffect, useState } from 'react';
import NotificationService from '../../service/notification.service';
import { toast } from 'react-toastify';
import { PiBellSimpleRingingFill } from "react-icons/pi";
import { FaChild, FaRegCalendarAlt } from "react-icons/fa";





const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotificationsByUserId();
      console.log(response.data); // ตรวจสอบข้อมูลที่ได้มา
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงการแจ้งเตือน');
    }
  };

  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      fetchNotifications(); // refresh
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
            <li key={notify.id} className="bg-white border shadow rounded p-4">
              <div className="flex items-center gap-2">
                <PiBellSimpleRingingFill className="text-yellow-500" />
                <span>{notify.title || 'ไม่มีหัวข้อ'}</span>
              </div>

              // เตรียมข้อมูลสำหรับแสดงชื่อเด็ก
              {notify.childName && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaChild />
                  ชื่อเด็ก: {notify.childName}
                </p>
              )}

              <div className="mt-1 text-sm text-gray-700">
                {Array.isArray(notify.message) ? (
                  <ul className="list-disc pl-5">
                    {notify.message.map((msg, i) => (
                      <li key={i}>
                        {msg.vaccineName && <span>วัคซีน: {msg.vaccineName}</span>}
                        {msg.category && <span> หมวด: {msg.category}</span>}
                        {msg.detail && <span> | รายละเอียด: {msg.detail}</span>}
                        {msg.note && <span> | หมายเหตุ: {msg.note}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{notify.message || 'ไม่มีข้อความ'}</p>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <FaRegCalendarAlt />
                วันที่: {notify.date ? new Date(notify.date).toLocaleString() : "ไม่มีข้อมูลวันที่"}
              </p>

              {!notify.isRead && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-red-500 font-medium">ยังไม่ได้อ่าน</p>
                  <button
                    className="text-xs text-blue-500 underline"
                    onClick={() => markAsRead(notify.id)}
                  >
                    ทำเครื่องหมายว่าอ่านแล้ว
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

};

export default Notification;
