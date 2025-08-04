import React, { useEffect, useState } from 'react';
import NotificationService from '../../service/notification.service';
import { toast } from 'react-toastify';

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
      <h2 className="text-lg font-bold mb-4">📌 รายการแจ้งเตือน</h2>
      {notifications.length === 0 ? (
        <p>ไม่มีการแจ้งเตือน</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notify) => (
  <li key={notify._id} className="bg-white border shadow rounded p-4">
              <p className="font-semibold">🔔 {notify.title || 'ไม่มีหัวข้อ'}</p>

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

              <p className="text-xs text-gray-500 mt-2">
                📅 วันที่: {new Date(notify.date).toLocaleString()}
              </p>

              {!notify.isRead && (
                <p className="text-xs text-red-500 font-medium">ยังไม่ได้อ่าน</p>
              )}
            </li>
          ))}

        </ul>
      )}
    </div>
  );

};

export default Notification;
