import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";

const SignUp = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล";
    else if (!validateEmail(formData.email)) newErrors.email = "อีเมลไม่ถูกต้อง";
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSigningUp(true);
      await signup(formData);
      toast.success("ลงทะเบียนสำเร็จ!", { autoClose: 1500 });
      setTimeout(() => navigate("/"), 1600);
    } catch (error) {
      setIsSigningUp(false);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      if (msg === "อีเมลนี้ถูกใช้งานแล้ว") setErrors((prev) => ({ ...prev, email: msg }));
      else toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F5] via-[#E3FBE5] to-[#D0F0ED] px-4 py-10">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">

        {/* ฟอร์มด้านซ้าย */}
        <div className="w-full md:w-1/2 p-10 relative bg-gradient-to-b from-green-50 to-green-100">
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl transition-all duration-200"
          >
            <IoIosCloseCircle />
          </button>

          <h2 className="text-3xl font-extrabold text-green-700 mb-2 text-center md:text-left animate-fadeIn">
            สร้างบัญชี
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center md:text-left animate-fadeIn delay-200">
            สำหรับระบบบันทึกวัคซีนและติดตามพัฒนาการเด็ก
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ชื่อ-นามสกุล */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label text-sm text-gray-700">ชื่อ <span className="text-red-500">*</span> </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อ"
                  className={`input input-bordered w-full rounded-xl px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-green-300 ${errors.firstName ? "input-error" : ""}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div className="flex-1">
                <label className="label text-sm text-gray-700">นามสกุล <span className="text-red-500">*</span> </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                  className={`input input-bordered w-full rounded-xl px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-green-300 ${errors.lastName ? "input-error" : ""}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* อีเมล */}
            <div>
              <label className="label text-sm text-gray-700">อีเมล <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`input input-bordered w-full rounded-xl px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-green-300 ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* รหัสผ่าน */}
            <div className="relative">
              <label className="label text-sm text-gray-700">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input input-bordered w-full rounded-xl pr-12 px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-green-300 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-600 transition-all duration-200"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div className="relative">
              <label className="label text-sm text-gray-700">
                ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input input-bordered w-full rounded-xl pr-12 px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-green-300 ${errors.confirmPassword ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-600 transition-all duration-200"
                >
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* ปุ่มสมัคร */}
            <button
              type="submit"
              disabled={isSigningUp}
              className={`w-full py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 ${isSigningUp ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-lg transform hover:-translate-y-1"}`}
            >
              {isSigningUp ? "กำลังสมัคร..." : "สร้างบัญชี"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            มีบัญชีแล้ว?{" "}
            <a href="/Signin" className="text-pink-500 underline font-medium hover:text-pink-700">
              เข้าสู่ระบบ
            </a>
          </p>
        </div>

        {/* ด้านขวา */}
        <div className="hidden md:flex md:w-1/2 bg-green-50 items-center justify-center p-10 animate-fadeIn">
          <div className="text-center">
            <img
              src="/Mimicare(1).png"
              alt="เด็กน่ารัก"
              className="w-72 mx-auto mb-4 animate-bounce"
            />
            <h3 className="text-2xl font-bold text-green-700 mb-2">MimiCare ยินดีต้อนรับ</h3>
            <p className="text-gray-600 mt-2 text-sm">
              สร้างบัญชีเพื่อเริ่มต้นการดูแลพัฒนาการของลูกน้อย
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
