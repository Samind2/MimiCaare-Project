import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import childService from '../../service/child.service';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileChildUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await childService.getChildById(id);
        const child = res.data.children; // ใช้ data.children แทน
        setFirstName(child.firstName);
        setLastName(child.lastName);
        setGender(child.gender);
        setBirthDate(child.birthDate?.split('T')[0]); // เฉพาะวันที่
        setImage(child.image);
      } catch (err) {
        toast.error("ไม่สามารถโหลดข้อมูลเด็กได้");
        console.error(err);
      }
    };
  
    fetchChild();
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setImage(reader.result); // อัปเดตรูปภาพเป็น Base64
    };
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        firstName,
        lastName,
        gender,
        birthDate,
        image,  // ส่งรูปภาพเป็น Base64
      };

      // ส่งข้อมูลอัปเดต
      await childService.updateChild(id, updatedData);
      
      toast.success("อัปเดตข้อมูลเด็กสำเร็จ!");
      setTimeout(() => navigate("/profile-child"), 1500);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-96 bg-white shadow-lg">
        <div className="card-body">
          <h3 className="text-lg font-bold text-center">อัปเดตข้อมูลเด็ก</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">ชื่อ</label>
              <input type="text" className="input input-bordered" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

              <label className="label">นามสกุล</label>
              <input type="text" className="input input-bordered" value={lastName} onChange={(e) => setLastName(e.target.value)} />

              <label className="label">เพศ</label>
              <select className="select select-bordered" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">เลือกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>

              <label className="label">วันเกิด</label>
              <input type="date" className="input input-bordered" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>

            <div className="form-control">
              <label className="label">อัปโหลดรูปภาพ</label>
              <input type="file" accept="image/*" className="file-input w-full" onChange={handleImageUpload} />
            </div>

            {image && (
              <div className="text-center">
                <img src={image} alt="เด็ก" className="w-24 h-24 rounded-full object-cover mx-auto" />
              </div>
            )}

            <div className="form-control mt-4">
              <button type="submit" className="btn btn-primary w-full">อัปเดต</button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProfileChildUpdate;
