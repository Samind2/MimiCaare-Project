import React, { useEffect, useState } from "react";
import vaccineService from "../../../service/standardVaccine.service";

const ViewVac = () => {
  const [vaccines, setVaccines] = useState([]);

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
            <label tabIndex={0} className="btn m-1">
              มนทกานต์ คงดี
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>อาทิตยา คงดี</a></li>
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
