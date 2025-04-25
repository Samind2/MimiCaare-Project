import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ChildCard = ({ child }) => {
  const { firstName, lastName, gender, birthDate, image } = child;
  const navigate = useNavigate();


  return (
    <div className="card shadow-xl relative mr-5 md:my-5 w-80">
      <figure>
        <img
          src={image}
          alt={`${firstName} ${lastName}`}
          className="hover:scale-105 transition-all duration-300 h-60 w-full object-cover"
          onError={(e) =>
            (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")
          }
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg font-semibold">
          {firstName} {lastName}
        </h2>
        <p>เพศ: {gender}</p>
        <p>วันเกิด: {new Date(birthDate).toLocaleDateString("th-TH")}</p>
        <div className="card-actions justify-end mt-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/profile-child-update/${child.id}`)}
          >
            แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildCard;
