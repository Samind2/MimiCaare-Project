import React, { useState } from "react";
import mailService from "../../service/resendmail.service";
import { toast } from "react-toastify";
import { FaKey } from "react-icons/fa";


const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await mailService.sendPasswordToMail({
                email,
                firstName,
            });

            if (res.status === 200) {
                toast.success(res.data.message || "ส่งรหัสผ่านใหม่สำเร็จ");
            } else {
                toast.error(res.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            setLoading(false);
            toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-6">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    <FaKey className="inline-block mr-2" /> ลืมรหัสผ่าน
                </h1>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-1">ชื่อ</label>
                        <input
                            type="text"
                            placeholder="กรอกชื่อของคุณ"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1">อีเมล</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-300 ${loading
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {loading ? "กำลังส่ง..." : "ส่งรหัสผ่านใหม่ไปที่อีเมล"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
