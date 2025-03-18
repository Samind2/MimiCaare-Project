import React from 'react';

const InformationRecord = () => {
  return (
    <div className="section-container bg-gradient-to-r from-[#f1f1f1] from-0% to-[#fff6f6]">
      <div className="py-12 flex flex-col justify-center items-center">
        <div className="text-center space-y-7 px-4">
          <h3 className="md:text-3xl text-3xl font-bold md:leading-snug leading-snug">
            เมนูเพื่อบันทึกข้อมูล
            <span className="text-[#E51317]"> วัคซีน </span>
            และ
            <span className="text-[#114965]"> พัฒนาการของเด็ก</span>
          </h3>
          <p className="text-xl text-[#4A4A4A]">
            เมนูนี้จะช่วยให้ผู้ปกครองสามารถบันทึกและติดตามข้อมูลสุขภาพของลูกน้อยได้สะดวก            
            ผู้ใช้สามารถบันทึกประวัติการฉีดวัคซีนและพัฒนาการของเด็ก พร้อมรับการแจ้งเตือนวันนัดหมายสำคัญ            
            ระบบช่วยให้การดูแลสุขภาพเด็กเป็นไปอย่างครบถ้วนและเป็นระบบ
          </p>
        </div>
      </div>
    </div>
  );
};

// <div className="section-container flex justify-center items-center h-auto py-10">
//   <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
//     <div className="md:w-1/2 flex justify-center">
//       <div className="text-center md:w-[80%]">
//         <h3 className="text-3xl md:text-5xl font-bold leading-snug">
//           เมนูเพื่อบันทึกข้อมูล
//           <span className="text-[#E51317]"> วัคซีน </span>
//           และ
//           <span className="text-[#114965]"> พัฒนาการของเด็ก</span>
//         </h3>
//         <p className='text-lg text-[#4a4a4a]'>
//           เมนูนี้ช่วยให้ผู้ปกครองสามารถบันทึกและติดตามข้อมูลสุขภาพของลูกน้อยได้สะดวก  
//           ผู้ใช้สามารถบันทึกประวัติการฉีดวัคซีนและพัฒนาการของเด็ก พร้อมรับการแจ้งเตือนวันนัดหมายสำคัญ  
//           ระบบช่วยให้การดูแลสุขภาพเด็กเป็นไปอย่างครบถ้วนและเป็นระบบ
//         </p>
//       </div>
//     </div>
//   </div>
// </div>
//);
//};

export default InformationRecord;