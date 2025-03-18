import React, { useEffect, useState } from 'react';
import userService from '../service/user.service';

const GetComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // สำหรับสถานะโหลดข้อมูล
  const [error, setError] = useState(null); // สำหรับจัดการข้อผิดพลาด

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userService.getAllUser(); // เรียกใช้ฟังก์ชันจาก userService
        setData(response.data); // แสดงข้อมูลจาก API
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        console.error(err); // แสดงข้อผิดพลาดใน console
      } finally {
        setLoading(false); // เมื่อเสร็จสิ้นการดึงข้อมูลแล้ว
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>กำลังโหลด...</div>; // แสดงข้อความขณะโหลด
  }

  if (error) {
    return <div>{error}</div>; // แสดงข้อผิดพลาด
  }

  return (
    <div>
      <h1>Data from API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* แสดงข้อมูลจาก API */}
    </div>
  );
};

export default GetComponent;
