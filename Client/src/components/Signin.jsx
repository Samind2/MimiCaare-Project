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
      const user = await login(formData); // login จาก context
      toast.success("เข้าสู่ระบบสำเร็จ!", { autoClose: 1500 });
      setTimeout(() => {
        navigate(user.role === "admin" ? "/dashboard" : "/");
      }, 1600);
    } catch (error) {
      setIsLoggingIn(false);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";

      if (msg === "ไม่พบผู้ใช้งาน") {
        setErrors({ email: msg, password: "" });
      } else if (msg === "รหัสผ่านไม่ถูกต้อง") {
        setErrors({ email: "", password: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#FFE3E3] via-[#FFF0F5] to-[#E5F5EF] px-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row ">

        {/* ฟอร์มด้านซ้าย */}
        <div className="w-full md:w-1/2 p-10 relative bg-gradient-to-b from-pink-50 to-pink-100">
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl transition-all duration-200"
          >
            <IoIosCloseCircle />
          </button>

          <h2 className="text-3xl font-extrabold text-pink-600 mb-2 text-center md:text-left animate-fadeIn">
            เข้าสู่ระบบ
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center md:text-left animate-fadeIn delay-200">
            ระบบติดตามพัฒนาการและวัคซีนเด็ก MimiCare
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="form-control">
              <label htmlFor="email" className="label text-sm font-medium text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                id="SI-01"
                type="email"
                name="email"
                placeholder="กรอกอีเมล"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered rounded-xl w-full px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-pink-300 ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-control relative">
              <label htmlFor="password" className="label text-sm font-medium text-gray-700">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="SI-02"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input input-bordered w-full rounded-xl pr-12 px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-pink-300 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-pink-500 transition-all duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 ${isLoggingIn ? "bg-pink-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 shadow-lg transform hover:-translate-y-1"}`}
            >
              {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{" "}
            <a href="/Signup" className="text-pink-500 underline font-medium hover:text-pink-700">
              สมัครสมาชิก
            </a>
          </p>

          <p className="mt-2 text-center text-sm text-gray-500">
            หากลืมรหัสผ่าน {" "}
            <a href="/reset-password" className="text-pink-500 underline font-medium hover:text-pink-700">
              รีเซ็ตรหัสผ่าน
            </a>
          </p>
        </div>

        {/* ด้านขวา */}
        <div className="hidden md:flex md:w-1/2 bg-pink-50 items-center justify-center p-10 animate-fadeIn">
          <div className="text-center">
            <img
              src="/Mimicare(1).png"
              alt="เด็กน่ารัก"
              className="w-72 mx-auto mb-4 animate-bounce"
            />
            <h3 className="text-2xl font-bold text-pink-600 mb-2">ยินดีต้อนรับสู่ MimiCare</h3>
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
