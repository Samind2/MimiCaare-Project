import React, { useEffect, useState } from "react";
import userService from "../../service/user.service";
import { toast } from "react-toastify";
import { FaUserGroup } from "react-icons/fa6";


const AllUser = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-5xl bg-pink-50 rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-pink-700">
        <FaUserGroup className="inline-block mr-2" />
         ผู้ใช้ทั้งหมด</h1>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-pink-100 text-pink-800">
              <th className="border px-4 py-2 rounded-tl-xl">ชื่อ</th>
              <th className="border px-4 py-2">อีเมล</th>
              <th className="border px-4 py-2 rounded-tr-xl">บทบาท</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-pink-50 transition-colors">
                <td className="border px-4 py-2">{u.firstName} {u.lastName}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUser;
