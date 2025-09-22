import React, { useEffect, useState } from "react";
import developDataService from "../../service/dataDev.service";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const DevData = () => {
  const [devMeta, setDevMeta] = useState([]);
  const [ageRange, setAgeRange] = useState("");
  const [developments, setDevelopments] = useState([
    { category: "", detail: "", image: "", note: "" },
  ]);

  // โหลดข้อมูล metadata
  const fetchDevMeta = async () => {
    try {
      const res = await developDataService.getAllDevelop();
      setDevMeta(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    }
  };

  useEffect(() => {
    fetchDevMeta();
  }, []);

  // เพิ่ม/ลบ field
  const addDevelopmentField = () => {
    setDevelopments([
      ...developments,
      { category: "", detail: "", image: "", note: "" },
    ]);
  };

  const removeDevelopmentField = (index) => {
    const updated = [...developments];
    updated.splice(index, 1);
    setDevelopments(updated);
  };

  const handleDevChange = (index, field, value) => {
    const updated = [...developments];
    updated[index][field] = value;
    setDevelopments(updated);
  };

  // อ่านไฟล์เป็น Base64
  const handleFileChange = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleDevChange(index, "image", reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  // บันทึก metadata (ส่งทีละ development)
  const handleAdd = async () => {
    if (!ageRange) {
      toast.warning("กรุณากรอกช่วงอายุ");
      return;
    }

    try {
      for (let dev of developments) {
        if (!dev.category || !dev.detail || !dev.image) {
          toast.warning("กรุณากรอกข้อมูลให้ครบและอัปโหลดรูปภาพ");
          return;
        }

        await developDataService.addNewDevelop({
          ageRange: Number(ageRange),
          category: dev.category,
          detail: dev.detail,
          image: dev.image,
          note: dev.note,
        });
      }

      toast.success("เพิ่ม metadata สำเร็จ");
      setAgeRange("");
      setDevelopments([{ category: "", detail: "", image: "", note: "" }]);
      fetchDevMeta();
    } catch (err) {
      console.error(err);
      toast.error("เพิ่ม metadata ไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    try {
      await developDataService.deleteDevelopById(id);
      toast.success("ลบข้อมูลสำเร็จ");
      fetchDevMeta();
    } catch {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">พัฒนาการตามช่วงอายุ</h1>

      {/* Form เพิ่มข้อมูล */}
      <div className="border p-4 rounded-lg mb-6 space-y-3">
        <input
          type="number"
          placeholder="ช่วงอายุ (เดือน)"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        {developments.map((dev, index) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <input
              type="text"
              placeholder="หมวดหมู่ (category)"
              value={dev.category}
              onChange={(e) => handleDevChange(index, "category", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="รายละเอียด (detail)"
              value={dev.detail}
              onChange={(e) => handleDevChange(index, "detail", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
              className="w-full"
            />
            {dev.image && (
              <img
                src={dev.image}
                alt="preview"
                className="w-20 h-20 object-cover rounded mt-1"
              />
            )}
            <input
              type="text"
              placeholder="หมายเหตุ (note)"
              value={dev.note}
              onChange={(e) => handleDevChange(index, "note", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            {developments.length > 1 && (
              <button
                onClick={() => removeDevelopmentField(index)}
                className="flex items-center text-red-500 text-sm"
              >
                <FaTrash /> ลบ
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addDevelopmentField}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
        >
          + เพิ่มพัฒนาการ
        </button>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            บันทึก
          </button>
        </div>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">ช่วงอายุ (เดือน)</th>
              <th className="px-6 py-3 text-left">พัฒนาการ</th>
              <th className="px-6 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devMeta.length > 0 ? (
              devMeta.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-3">{item.ageRange}</td>
                  <td className="px-6 py-3">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <div className="flex items-start gap-3">
                          <div>
                            <strong>หมวดหมู่:</strong> {item.category} <br />
                            <strong>รายละเอียด:</strong> {item.detail} <br />
                            {item.note && (
                              <span className="text-gray-400 text-sm">{item.note}</span>
                            )}
                          </div>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.category}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </li>
                    </ul>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-400">
                  -- ไม่มีข้อมูล --
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DevData;
