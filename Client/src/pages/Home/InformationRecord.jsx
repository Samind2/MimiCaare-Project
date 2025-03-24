import React from 'react';
import {motion} from 'framer-motion';

const InformationRecord = () => {
  return (
    <div className="section-container bg-gradient-to-r from-[#f1f1f1] from-0% to-[#fff6f6]">
      <div className="py-12 flex flex-col justify-center items-center">
        <div className="text-center space-y-7 px-4">
        <motion.h3 
            className="md:text-3xl text-3xl font-bold md:leading-snug leading-snug"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }} // ให้แสดงแค่ครั้งเดียว
          >
            โรคยอดฮิตในเด็กที่พ่อแม่ควรรู้
          </motion.h3>
          <motion.p 
            className="text-xl text-[#4A4A4A]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }} // ให้แสดงแค่ครั้งเดียว
          >
            เด็กเล็กมักมีภูมิคุ้มกันที่ยังไม่แข็งแรง ทำให้มีโอกาสป่วยง่าย โดยเฉพาะโรคติดเชื้อต่าง ๆ ที่แพร่กระจายได้ง่ายในโรงเรียนหรือสถานที่ที่มีเด็กจำนวนมาก
          </motion.p>
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