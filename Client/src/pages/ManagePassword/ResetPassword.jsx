import React, { useState } from "react";
import { useNavigate } from "react-router";
import mailService from "../../service/resendmail.service";
import { toast } from "react-toastify";
import { FaKey } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

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
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#D0E8FF] via-[#E0F3FF] to-[#FFFFFF] px-4">
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden relative p-10">

                {/* ปุ่มปิด */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl transition-all duration-200"
                >
                    <IoIosCloseCircle />
                </button>

                <h2 className="text-3xl font-extrabold text-blue-600 mb-2 text-center animate-fadeIn">
                    <FaKey className="inline-block mr-2" /> ลืมรหัสผ่าน
                </h2>
                <p className="text-sm text-gray-600 mb-6 text-center animate-fadeIn delay-200">
                    กรอกชื่อและอีเมลของคุณเพื่อรับรหัสผ่านใหม่
                </p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                    {/* ชื่อ */}
                    <div className="form-control">
                        <label className="label text-sm font-medium text-gray-700">
                            ชื่อ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="กรอกชื่อของคุณ"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                setErrors({ ...errors, firstName: "" });
                            }}
                            className={`input input-bordered w-full rounded-xl px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-blue-300 ${errors.firstName ? "input-error" : ""
                                }`}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                    </div>

                    {/* อีเมล */}
                    <div className="form-control">
                        <label className="label text-sm font-medium text-gray-700">
                            อีเมล <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({ ...errors, email: "" });
                            }}
                            className={`input input-bordered w-full rounded-xl px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-blue-300 ${errors.email ? "input-error" : ""
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* ปุ่มส่ง */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 ${loading
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:-translate-y-1"
                            }`}
                    >
                        {loading ? "กำลังส่ง..." : "ส่งรหัสผ่านใหม่ไปที่อีเมล"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    <a
                        href="/Signin"
                        className="text-blue-600 underline font-medium hover:text-blue-800"
                    >
                        กลับไปหน้าเข้าสู่ระบบ
                    </a>
                </p>
            </div>
        </div>

    );
};

export default ResetPassword;
