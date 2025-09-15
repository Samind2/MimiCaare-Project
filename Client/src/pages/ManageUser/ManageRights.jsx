import React, { useEffect, useState } from "react";
import userService from "../../service/user.service";
import { toast } from "react-toastify";
import { FaUserGroup } from "react-icons/fa6";


const ManageRights = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่สามารถโหลดผู้ใช้ได้");
    }
  };

  const handleChangeRole = async (targetId, newRole) => {
    try {
      await userService.updateRole({ targetId, role: newRole });
      toast.success("อัปเดตบทบาทสำเร็จ");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "อัปเดตบทบาทล้มเหลว");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-full max-w-5xl bg-pink-50 rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-pink-700"><FaUserGroup className="inline-block mr-2" /> จัดการสิทธิ์ผู้ใช้</h1>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-pink-100 text-pink-800">
              <th className="border px-4 py-2 rounded-tl-xl text-center align-middle">ชื่อ</th>
              <th className="border px-4 py-2 text-center align-middle">อีเมล</th>
              <th className="border px-4 py-2 text-center align-middle">บทบาท</th>
              <th className="border px-4 py-2 rounded-tr-xl text-center align-middle">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-pink-50 transition-colors">
                <td className="border px-4 py-2 text-center align-middle">
                  {u.firstName} {u.lastName}
                </td>
                <td className="border px-4 py-2 text-center align-middle">
                  {u.email}
                </td>
                <td className="border px-4 py-2 text-center align-middle">
                  {u.role}
                </td>
                <td className="border px-4 py-2 text-center align-middle">
                  <div className="flex justify-center items-center">
                    <div className="relative bg-pink-500 rounded-full w-28 h-8 flex items-center">
                      <div
                        className={`absolute top-1 left-1 w-12 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${u.role === "admin" ? "translate-x-14" : "translate-x-0"
                          }`}
                      ></div>

                      {/* ปุ่มเลือก */}
                      <button
                        onClick={() => handleChangeRole(u.id, "user")}
                        className={`flex-1 text-sm font-medium z-10 transition-colors ${u.role === "user" ? "text-pink-600" : "text-white"
                          }`}
                      >
                        User
                      </button>
                      <button
                        onClick={() => handleChangeRole(u.id, "admin")}
                        className={`flex-1 text-sm font-medium z-10 transition-colors ${u.role === "admin" ? "text-pink-600" : "text-white"
                          }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ManageRights;
