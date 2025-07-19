import React from "react";
import { useNavigate } from "react-router-dom";


const ChildCard = ({ child, onDelete }) => {
  const { firstName, lastName, gender, birthDate, image, id } = child;
  const navigate = useNavigate();

  return (
    <div className="card shadow-lg rounded-xl overflow-hidden bg-white w-full flex flex-col">
      <figure className="overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={`${firstName} ${lastName}`}
          className="hover:scale-105 transition-transform duration-300 h-60 w-full object-cover rounded-t-xl"
          onError={(e) =>
            (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")
          }
        />
      </figure>
      <div className="card-body flex flex-col flex-grow p-6">
        <h2 className="card-title text-lg font-semibold mb-2">
          {firstName} {lastName}
        </h2>
        <p className="text-gray-600 mb-1">เพศ: {gender}</p>
        <p className="text-gray-600 mb-4">
          วันเกิด: {birthDate ? new Date(birthDate).toLocaleDateString("th-TH") : "-"}
        </p>
        <div className="card-actions justify-end mt-auto">
          <button
            className="btn-edit btn-outline btn-sm"
            onClick={() => navigate(`/profile-child-update/${id}`)}
          >
            แก้ไขข้อมูล
          </button>
          <button
            className="btn-delete btn-outline btn-sm"
            onClick={() => onDelete(id)}
          >
            ลบข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};


export default ChildCard;
