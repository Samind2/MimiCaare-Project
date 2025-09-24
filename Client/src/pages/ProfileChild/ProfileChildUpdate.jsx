import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import childService from "../../service/child.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileChildUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await childService.getChildById(id);
        const child = res.data.children;
        setFirstName(child.firstName);
        setLastName(child.lastName);
        setGender(child.gender);
        setBirthDate(child.birthDate?.split("T")[0]);
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
      setImage(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    if (firstName !== "") updatedData.firstName = firstName;
    if (lastName !== "") updatedData.lastName = lastName;
    if (image !== "") updatedData.image = image;

    try {
       setIsEditing(true);
      await childService.updateChild(id, updatedData);
      toast.success("อัปเดตข้อมูลเด็กสำเร็จ!", {
        autoClose: 1500,
      });
      setTimeout(() => navigate("/profile-child"), 1500);
    } catch (error) {
      setIsEditing(false);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต", {
        autoClose: 1500,
      });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5F6] flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl p-8 animate-fadeIn">
        <h2 className="text-2xl font-semibold text-center text-[#32403B] mb-6">
          แก้ไขข้อมูลเด็ก
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input
              id="PC-01"
              type="text"
              value={firstName}
              data-testid="E_firstName-Child"
              onChange={(e) => setFirstName(e.target.value)}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          {/* นามสกุล */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              id="PC-02"
              type="text"
              value={lastName}
              data-testid="E_lastName-Child"
              onChange={(e) => setLastName(e.target.value)}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          {/* เพศ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              เพศ
            </label>
            <select
              className="select select-bordered w-full rounded-xl bg-gray-100 text-gray-600"
              value={gender}
              disabled
            >
              <option value="">เลือกเพศ</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>

          {/* วันเกิด */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              วันเกิด
            </label>
            <input
              id="PC-03"
              type="date"
              value={birthDate}
              disabled
              className="input input-bordered w-full rounded-xl bg-gray-100 text-gray-600"
            />
          </div>

          {/* รูปภาพ */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              รูปภาพ
            </label>
            <input
              id="PC-04"
              type="file"
              accept="image/*"
              data-testid="E_image-Child"
              className="file-input file-input-bordered w-full rounded-xl"
              onChange={handleImageUpload}
            />
          </div>

          {image && (
            <div className="flex justify-center mt-4">
              <img
                src={image}
                alt="รูปเด็ก"
                className="w-28 h-28 object-cover rounded-full border border-gray-300 shadow"
              />
            </div>
          )}

          {/* ปุ่ม */}
          <button
            id="PC-05"
            type="submit"
            disabled={isEditing}
            data-testid="E_Submit-button"
            className="btn bg-[#84C7AE] hover:bg-[#6EB39D] text-white w-full rounded-xl font-semibold text-base"
          >
            {isEditing ? "กำลังบันทึกการแก้ไข..." : "บันทึกการแก้ไข"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ProfileChildUpdate;
