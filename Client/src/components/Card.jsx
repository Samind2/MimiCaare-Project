import React from "react";
import { useNavigate } from "react-router-dom";

const ChildCard = ({ child, onDelete }) => {
  const { firstName, lastName, gender, birthDate, image, id } = child;
  const navigate = useNavigate();
``
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <figure className="overflow-hidden rounded-t-2xl">
        <img
          src={image || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={`${firstName} ${lastName}`}
          className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300"
        />
      </figure>

      <div className="flex flex-col flex-grow p-5 space-y-2">
        <h2 className="text-xl font-bold text-pink-600">{firstName} {lastName}</h2>
        <p className="text-gray-700">เพศ: <span className="font-medium">{gender}</span></p>
        <p className="text-gray-700">
          วันเกิด: <span className="font-medium">{birthDate ? new Date(birthDate).toLocaleDateString("th-TH") : "-"}</span>
        </p>

        <div className="mt-auto flex justify-between gap-2">
          <button
            onClick={() => navigate(`/profile-child-update/${id}`)}
            className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm"
          >
            แก้ไข
          </button>
          <button
            onClick={() => onDelete(id)}
            className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildCard;
