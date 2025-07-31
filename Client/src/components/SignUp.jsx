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
      setTimeout(() => {
        navigate("/");
      }, 1600);
    } catch (error) {
      setIsSigningUp(false);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      if (msg === "อีเมลนี้ถูกใช้งานแล้ว") {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9D5E5] via-[#E3FBE5] to-[#A7D7C5] px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col md:flex-row">

        {/* ซ้าย: ฟอร์มสมัครสมาชิก */}
        <div className="w-full md:w-1/2 p-8 relative">
          {/* ปุ่มปิด */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-3xl"
          >
            <IoIosCloseCircle />
          </button>

          <h2 className="text-2xl font-bold text-[#4A5B50] mb-2 text-center md:text-left">
            สร้างบัญชี
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
            สำหรับระบบบันทึกวัคซีนและติดตามพัฒนาการเด็ก
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ชื่อ-นามสกุล */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label text-sm text-gray-700">ชื่อ <span className="text-red-500">*</span> </label>
                <input
                  id="SU-01"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ชื่อ"
                  className={`input input-bordered w-full rounded-xl ${errors.firstName ? "input-error" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="label text-sm text-gray-700">นามสกุล <span className="text-red-500">*</span> </label>
                <input
                  id="SU-02"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="นามสกุล"
                  className={`input input-bordered w-full rounded-xl ${errors.lastName ? "input-error" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* อีเมล */}
            <div>
              <label className="label text-sm text-gray-700">อีเมล <span className="text-red-500">*</span></label>
              <input
                id="SU-03"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`input input-bordered w-full rounded-xl ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* รหัสผ่าน */}
            <div className="relative">
              <label className="label text-sm text-gray-700">รหัสผ่าน <span className="text-red-500">*</span> </label>
              <input
                id="SU-04"
                name="password"
                type={showPass ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full rounded-xl pr-10 ${errors.password ? "input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[44px] text-gray-500"
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div className="relative">
              <label className="label text-sm text-gray-700">ยืนยันรหัสผ่าน <span className="text-red-500">*</span> </label>
              <input
                id="SU-05"
                name="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full rounded-xl pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-[44px] text-gray-500"
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* ปุ่มสมัคร */}
            <button
              type="submit"
              disabled={isSigningUp}
              className={`btn w-full text-white font-semibold text-base rounded-full ${isSigningUp ? "bg-green-300 cursor-not-allowed" : "bg-[#47b18a] hover:bg-[#5fc2a0]"
                }`}
            >
              {isSigningUp ? "กำลังสมัคร..." : "สร้างบัญชี"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            มีบัญชีแล้ว?{" "}
            <a href="/Signin" className="text-pink-500 underline font-medium">
              เข้าสู่ระบบ
            </a>
          </p>
        </div>

        {/* ขวา: ใส่ข้อความและรูปภาพ */}
        <div className="hidden md:flex md:w-1/2 bg-[#E3FBE5] items-center justify-center p-8">
          <div className="text-center">
            <img
              src="/Mimicare(1).png"
              alt="ภาพเด็กน่ารัก"
              className="w-72 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-[#47b18a]">MimiCare ยินดีต้อนรับ</h3>
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
