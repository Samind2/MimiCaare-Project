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
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    if (!formData.password.trim()) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoggingIn(true);
      const user = await login(formData);
      toast.success("เข้าสู่ระบบสำเร็จ!", { autoClose: 1500 });
      setTimeout(() => {
        navigate(user.role === "admin" ? "/dashboard" : "/");
      }, 1600);
    } catch (error) {
      setIsLoggingIn(false);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      if (msg === "ไม่พบผู้ใช้งาน") setErrors({ email: msg });
      else if (msg === "รหัสผ่านไม่ถูกต้อง") setErrors({ password: msg });
      else toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEE9E1] via-[#F9E8F1] to-[#E5F5EF] px-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col md:flex-row">

        {/* ซ้าย: ฟอร์ม */}
        <div className="w-full md:w-1/2 p-8 relative">
          {/* ปุ่มปิด */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-3xl"
          >
            <IoIosCloseCircle />
          </button>

          <h2 className="text-2xl font-bold text-pink-600 mb-2 text-center md:text-left">เข้าสู่ระบบ</h2>
          <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
            ระบบติดตามพัฒนาการและวัคซีนเด็ก MimiCare
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label htmlFor="email" className="label text-sm font-medium text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                data-testid="email-Login"
                id="SI-01"
                type="email"
                name="email"
                placeholder="กรอกอีเมล"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered rounded-xl w-full ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-control relative">
              <label htmlFor="password" className="label text-sm font-medium text-gray-700">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                data-testid="password-Login"
                id="SI-02"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="กรอกรหัสผ่าน"
                value={formData.password}
                onChange={handleChange}
                className={`input input-bordered pr-10 rounded-xl w-full ${errors.password ? "input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[44px] text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              data-testid="submit-Login"
              type="submit"
              disabled={isLoggingIn}
              className={`btn w-full text-white font-semibold text-base rounded-full transition-all duration-300 ${isLoggingIn ? "bg-pink-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"}`}
            >
              {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{" "}
            <a href="/Signup" className="text-pink-500 underline font-medium">
              สมัครสมาชิก
            </a>
          </p>
        </div>

        {/* ขวา: ข้อความ/รูปภาพ */}
        <div className="hidden md:flex md:w-1/2 bg-[#F8E8EE] items-center justify-center p-8">
          <div className="text-center">
            <img
              src="/Mimicare(1).png"
              alt="เด็กน่ารัก"
              className="w-72 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-pink-600">ยินดีต้อนรับสู่ MimiCare</h3>
            <p className="text-gray-600 mt-2 text-sm">
              ช่วยให้คุณติดตามพัฒนาการและการฉีดวัคซีนของบุตรหลานได้ง่ายขึ้น
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Signin;
