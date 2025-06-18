import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";


const Signin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ใช้ state เดียวเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    if (!formData.password.trim()) newErrors.password = "กรุณากรอกรหัสผ่าน";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoggingIn(true); // ตั้งค่าสถานะการล็อกอินเป็นกำลังดำเนินการ
      const user = await login(formData);
      console.log("Sign up success reached!");

      toast.success("เข้าสู่ระบบสำเร็จ!", { autoClose: 1500 });

      setTimeout(() => {
        if (user.role === "admin") navigate("/dashboard");
        else navigate("/");
      }, 1600);

    } catch (error) {
      setIsLoggingIn(false); // รีเซ็ตสถานะการล็อกอินเมื่อเกิดข้อผิดพลาด
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      if (msg === "ไม่พบผู้ใช้งาน") setErrors({ email: msg });
      else if (msg === "รหัสผ่านไม่ถูกต้อง") setErrors({ password: msg });
      else toast.error(msg);
    }
  };

    const inputBaseClass =
    "input input-bordered w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[#84C7AE]";
  const errorClass = "border-red-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EE8A8A] overflow-hidden p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md relative z-10">

        {/* ปุ่มปิด */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
          aria-label="ยกเลิก"
        >
          <IoIosCloseCircle />
        </button>

        <h2 className="text-center text-lg font-semibold mb-8 mt-10 text-[#32403B]">
          เข้าสู่ระบบเพื่อเข้าถึงบริการบันทึกวัคซีนและติดตามพัฒนาการของเด็ก
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputBaseClass} ${errors.email ? errorClass : ""}`}
              autoComplete="email"
              placeholder="กรอกอีเมลของคุณ"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4 relative">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`${inputBaseClass} ${errors.password ? errorClass : ""}`}
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่าน"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-9 right-3 text-gray-500"
              tabIndex={-1}
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <p className="text-sm text-gray-500 mb-4 text-right">
            หากลืมรหัสผ่าน?{" "}
            <a href="/Signup" className="text-red-500 underline">
              คลิกที่นี่
            </a>
          </p>

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`${isLoggingIn
              ? "bg-[#FA5453] opacity-50 cursor-not-allowed"
              : "bg-[#FA5453] hover:bg-[#ff8686]"
              } text-white py-2 rounded-lg w-full transition`}
          >
            {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>



        <p className="mt-4 text-center text-sm text-gray-500">
          หากยังไม่มีบัญชีผู้ใช้?{" "}
          <a href="/Signup" className="text-red-500 underline">
            สมัครสมาชิก
          </a>
        </p>

      </div>
    </div>
  );
};

export default Signin;
