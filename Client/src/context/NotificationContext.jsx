import React, { createContext, useState, useEffect } from "react";
import NotificationService from "../service/notification.service";

// สร้าง Context
export const NotificationContext = createContext();

// Provider
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    // ดึงข้อมูลแจ้งเตือนจาก backend
    const fetchNotifications = async () => {
        try {
            const response = await NotificationService.getNotificationsByUserId();
            const notiData = response.data.notifications || [];
            setNotifications(notiData);
            setHasUnread(notiData.some(n => !n.isRead));
        } catch (error) {
            console.error("ไม่สามารถดึงข้อมูลแจ้งเตือน", error);
        }
    };

    // อัปเดตสถานะอ่านแล้วของ notification
    const markAsRead = async (id) => {
        try {
            await NotificationService.markAsRead(id);

            // อัปเดต UI ทันที
            setNotifications(prev => {
                const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
                setHasUnread(updated.some(n => !n.isRead));
                return updated;
            });
        } catch (error) {
            console.error("ไม่สามารถอัปเดตสถานะได้", error);
            throw error; // ให้ component แสดง toast
        }
    };

    // อัปเดตสถานะอ่านแล้วทั้งหมด
    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();

            setNotifications(prev => {
                const updated = prev.map(n => ({ ...n, isRead: true }));
                setHasUnread(false);
                return updated;
            });
        } catch (error) {
            console.error("ไม่สามารถอัปเดตสถานะทั้งหมดได้", error);
            throw error;
        }
    };

    // โหลด notification
    useEffect(() => {
        fetchNotifications();
    }, []);

    const NotiInfo = {
        notifications,
        hasUnread,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    }

    return (
        <NotificationContext.Provider value={NotiInfo}>
            {children}
        </NotificationContext.Provider>
    );
};

