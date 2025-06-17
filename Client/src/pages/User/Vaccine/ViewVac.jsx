import React, { useEffect, useState } from "react";
import vaccineService from "../../../service/standardVaccine.service";
import childService from "../../../service/child.service";

const ViewVac = () => {
  const [vaccines, setVaccines] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);


  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccineService.getvaccine();
        setVaccines(res.data.vaccines || []); // <-- ตรงนี้ปรับตามโครงสร้าง API จริง
      } catch (err) {
        console.error("Error fetching vaccines", err);
        setVaccines([]);
      }
    };

    fetchVaccines();
  }, []);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childService.getChildren(); // ใช้ getChildren จาก service
        const data = res.data.children || res.data || []; // ปรับตามโครงสร้าง response จริง
        setChildren(data);
        if (data.length > 0) {
          setSelectedChild(data[0]); // ตั้งค่าคนแรกเป็น default
        }
      } catch (err) {
        console.error("Error fetching children", err);
      }
    };

    fetchChildren();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">วัคซีน</h1>

        <div className="flex space-x-4">
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn m-1">
              ตามมาตรฐาน
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>เพิ่มเติม</a></li>
            </ul>
          </div>
          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 w-40 overflow-hidden whitespace-nowrap text-ellipsis px-3 text-left"
              title={
                selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : "เลือกเด็ก"
              }
            >
              <span className="truncate block w-full">
                {selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : "เลือกเด็ก"}
              </span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {children.map((child) => (
                <li key={child._id}>
                  <a onClick={() => setSelectedChild(child)}>
                    {child.firstName} {child.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-gray-200 text-gray-700 text-sm">
            <tr>
              <th>อายุ</th>
              <th>วัคซีน</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map((item, index) =>
              item.vaccines.map((vaccine, i) => (
                <tr key={`${index}-${i}`}>
                  <td>{item.ageRange >= 12 ? `${item.ageRange / 12} ปี` : `${item.ageRange} เดือน`}</td>
                  <td>{vaccine.vaccineName}</td>
                  <td>
                    <span className="bg-red-600 text-white px-2 py-1 text-xs rounded-full">
                      ยังไม่ได้รับ
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">บันทึกรับวัคซีน</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewVac;
