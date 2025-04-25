import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import childService from '../../service/child.service.js';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddChild = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    image: '', // base64 string
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  
    const cleanedData = {
      ...formData,
      birthDate: new Date(formData.birthDate).toISOString(),
      image: formData.image, // ไม่ต้อง strip base64 prefix
    };
  
    try {
      const res = await childService.addChild(cleanedData);
  
      // แสดง success toast
      toast.success("อัปเดตข้อมูลเด็กสำเร็จ!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  
      setMessage(res.data.message);
      setFormData({
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        image: '',
      });
      setPreviewImage(null);
  
      // รอ 1.5 วินาทีแล้วนำทางไปที่ "/profile-child"
      setTimeout(() => navigate("/profile-child"), 1500);
    } catch (err) {
      // แสดง error toast
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      console.error(err);
      setMessage(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">เพิ่มข้อมูลเด็ก</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="ชื่อ"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="นามสกุล"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">เลือกเพศ</option>
          <option value="ชาย">ชาย</option>
          <option value="หญิง">หญิง</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full"
        />
        {previewImage && (
          <img src={previewImage} alt="preview" className="w-32 h-32 object-cover rounded mx-auto" />
        )}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          บันทึกข้อมูล
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddChild;
