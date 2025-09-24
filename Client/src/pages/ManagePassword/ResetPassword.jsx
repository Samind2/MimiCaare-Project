import React, { useState } from "react";
import { useNavigate } from 'react-router';
import mailService from "../../service/resendmail.service";
import { toast } from "react-toastify";
import { FaKey } from "react-icons/fa";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
        if (!email.trim()) newErrors.email = "กรุณากรอกอีเมล";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await mailService.sendPasswordToMail({ email, firstName });
            toast.success("ส่งรหัสผ่านใหม่สำเร็จ");
            navigate("/Signin");
        } catch (error) {
            toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
        } finally {
            setLoading(false);
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
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                setErrors({...errors, firstName: ""}); // ล้าง error เมื่อกรอก
                            }}
                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1">อีเมล</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({...errors, email: ""}); // ล้าง error เมื่อกรอก
                            }}
                            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-full text-white font-semibold text-base rounded-full transition-all duration-300 bg-blue-500 hover:bg-blue-600"
                    >
                        {loading ? "กำลังส่ง..." : "ส่งรหัสผ่านใหม่ไปที่อีเมล"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
