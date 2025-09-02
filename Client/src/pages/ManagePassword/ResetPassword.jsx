import React, { useState } from "react";
import { useNavigate } from 'react-router';
import mailService from "../../service/resendmail.service";
import { toast } from "react-toastify";
import { FaKey } from "react-icons/fa";


const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await mailService.sendPasswordToMail({
                email,
                firstName,
            });

            toast.success("ส่งรหัสผ่านใหม่สำเร็จ");
            navigate("/signin");
        } catch (error) {
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
                        className={`btn w-full text-white font-semibold text-base rounded-full transition-all duration-300`}
                    >
                        {loading ? "กำลังส่ง..." : "ส่งรหัสผ่านใหม่ไปที่อีเมล"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
