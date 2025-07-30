import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import childService from '../../service/child.service.js';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddChild = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    image: '',
  });
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!formData.birthDate.trim()) newErrors.birthDate = "กรุณาเลือกวันเกิด";
    if (!formData.gender.trim()) newErrors.gender = "กรุณาเลือกเพศ";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    let existingChildren = [];
    try {
      const res = await childService.getChildren();
      existingChildren = res.data.children || res.data || [];
    } catch (err) {
      console.warn("ไม่มีข้อมูลเด็ก หรือไม่สามารถโหลดได้", err);
    }

    const isDuplicate = existingChildren.some(child =>
      child.lastName.trim().toLowerCase() === formData.lastName.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("ชื่อนี้ถูกเพิ่มแล้วในระบบ");
      return;
    }

    const cleanedData = {
      ...formData,
      birthDate: new Date(formData.birthDate).toISOString(),
    };

    try {
      setIsAddingChild(true);
      await childService.addChild(cleanedData);
      toast.success("เพิ่มข้อมูลเด็กสำเร็จ!", {
        autoClose: 1500,
      });

      setTimeout(() => navigate("/profile-child"), 1500);
    } catch (err) {
      setIsAddingChild(false);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล", {
        autoClose: 1500,
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5F6] flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl p-8 animate-fadeIn">
        <h2 className="text-2xl font-semibold text-center text-[#32403B] mb-6">
          เพิ่มข้อมูลเด็ก
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="firstName-Child"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="กรอกชื่อ"
              className={`input input-bordered w-full rounded-xl pr-10 ${errors.firstName ? "input-error" : ""}`}
            // required
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* นามสกุล */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="lastName-Child"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="กรอกนามสกุล"
              className={`input input-bordered w-full rounded-xl ${errors.lastName ? "input-error" : ""}`}
            // required
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* วันเกิด */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              วันเกิด <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="birthDate-Child"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`input input-bordered w-full rounded-xl ${errors.birthDate ? "input-error" : ""}`}
            // required
            />
            {errors.birthDate && (
              <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
            )}

          </div>

          {/* เพศ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              เพศ <span className="text-red-500">*</span>
            </label>
            <select
              data-testid="gender-Child"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`select select-bordered w-full rounded-xl bg-gray-50 ${errors.gender ? "select-error" : ""}`}
            // required
            >
              <option value="">เลือกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          {/* รูปภาพ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              รูปภาพเด็ก
            </label>
            <input
              data-testid="image-Child"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input file-input-bordered w-full rounded-xl"
            />
          </div>

          {/* แสดงภาพตัวอย่าง */}
          {previewImage && (
            <div className="flex justify-center mt-4">
              <img
                src={previewImage}
                alt="preview"
                className="w-28 h-28 object-cover rounded-full border border-gray-300 shadow"
              />
            </div>
          )}

          {/* ปุ่มบันทึก */}
          <button
            data-testid="submit-button"
            type="submit"
            disabled={isAddingChild}
            className="btn bg-[#84C7AE] hover:bg-[#6EB39D] text-white w-full rounded-xl font-semibold text-base"
          >
            {isAddingChild ? "กำลังเพิ่มข้อมูล..." : "บันทึกข้อมูล"}

          </button>
        </form>

      </div>
    </div>
  );
};

export default AddChild;
