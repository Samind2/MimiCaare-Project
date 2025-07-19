import React, { useEffect, useState } from 'react';
import NotificationService from '../../service/notification.service';
import { toast } from 'react-toastify';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('fetchNotifications เรียกครั้ง');

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotificationsByUserId();
      setNotifications(response.data); // สมมติว่า response.data เป็น array
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงการแจ้งเตือน', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">รายการแจ้งเตือน</h2>
      {notifications.length === 0 ? (
        <p>ไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notify, index) => (
            <li key={index} className="bg-white shadow p-3 rounded border">
              <p><strong>เรื่อง:</strong> {notify.title || 'ไม่มีชื่อเรื่อง'}</p>
              <p><strong>ข้อความ:</strong> {notify.message || 'ไม่มีข้อความ'}</p>
              <p className="text-sm text-gray-500">วันที่: {new Date(notify.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notification;
