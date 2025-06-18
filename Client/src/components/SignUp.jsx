import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";


const SignUp = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน"; // เพิ่มการตรวจสอบกรณีไม่กรอกยืนยันรหัสผ่าน
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน"; // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกัน

    if (Object.keys(newErrors).length) { 
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoggingIn(true);
      await signup(formData);
      toast.success("ลงทะเบียนสำเร็จ!", { autoClose: 1500 });
      setTimeout(() => {
        navigate("/");
      }, 1600);
    } catch (error) {
      setIsLoggingIn(false);
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาด";
      if (msg === "อีเมลนี้ถูกใช้งานแล้ว") {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else {
        toast.error(msg);
      }
    }
  };

  const inputBaseClass =
    "input input-bordered w-full mt-1 focus:outline-none focus:ring-2 focus:ring-[#84C7AE]";
  const errorClass = "border-red-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#A7D7C5] p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md relative z-10">
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
          สร้างบัญชีเพื่อบันทึกวัคซีนและติดตามพัฒนาการของเด็ก
        </h2>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label>
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="ชื่อ"
                className={`${inputBaseClass} ${errors.firstName ? errorClass : ""
                  }`}
                aria-invalid={!!errors.firstName}
                aria-describedby="firstName-error"
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-red-500 text-xs mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label>
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="นามสกุล"
                className={`${inputBaseClass} ${errors.lastName ? errorClass : ""
                  }`}
                aria-invalid={!!errors.lastName}
                aria-describedby="lastName-error"
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-red-500 text-xs mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label>
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={`${inputBaseClass} ${errors.email ? errorClass : ""}`}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label>
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBaseClass} ${errors.password ? errorClass : ""
                  }`}
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label>
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBaseClass} ${errors.confirmPassword ? errorClass : ""
                  }`}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirmPassword-error"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showConfirmPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-red-500 text-xs mt-1"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`${isLoggingIn
              ? "bg-[#47b18a] opacity-50 cursor-not-allowed"
              : "bg-[#47b18a] hover:bg-[#9fe0c8]"
              } text-white py-2 rounded-lg w-full transition`}
          >
            {isLoggingIn ? " กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500">
          มีบัญชีแล้ว?{" "}
          <a href="/Signin" className="text-red-500">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
