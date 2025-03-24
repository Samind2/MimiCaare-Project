import React from 'react';
import { motion } from 'framer-motion';

const diseases = [
  {
    title: 'โรคอุจจาระร่วงและอาหารเป็นพิษ',
    description: 'โรคอุจจาระร่วงและอาหารเป็นพิษเป็นโรค ที่เกิดจากการระบาดของเชื้อโรคในอาหารที่ไม่สะอาด หรืออาหารที่ปนเปื้อนเชื้อโรค',
    prevention: 'เลือกกินอาหารที่ปรุงสุกใหม่ เครื่องดื่มสะอาด และดูแลสุขอนามัย เช่น ล้างมือบ่อย ๆ',
    image: '/images/Info/Info1.png',
  },
  {
    title: 'โรคลมร้อน (Heat Stroke)',
    description: 'โรคลมร้อนเป็นโรคที่เกิดจากการเสียสม หรือการเสียน้ำ ทำให้ร่างกายเกิดอาการร้อนและเสียน้ำ',
    prevention: 'ดื่มน้ำบ่อย ๆ ไม่ดื่มน้ำหวาน น้ำอัดลม หลีกเลี่ยงกิจกรรมกลางแจ้ง',
    image: '/images/Info/Info2.png',
  },
  {
    title: 'โรคไข้หวัดใหญ่',
    description: 'โรคไข้หวัดใหญ่เป็นโรคที่เกิดจากเชื้อไวรัส ทำให้เด็กมีอาการ ไข้ น้ำมูก ไอ และเจ็บคอ',
    prevention: 'ดูแลร่างกายให้แข็งแรง หลีกเลี่ยงสถานที่แออัด',
    image: '/images/Info/Info3.png',
  },
  {
    title: 'โรคผดร้อน',
    description: 'โรคผดร้อนเป็นโรคที่เกิดจากการเสียสมหร ือการเสียน้ำ ทำให้ร่างกายเกิดอาการร้อนและเสียน้ำ',
    prevention: 'อาบน้ำบ่อย ๆ อยู่ในที่อากาศถ่ายเทดี',
    image: '/images/Info/Info4.png',
  },
];

const Diseases = () => {
  return (
    <div className="container mx-auto p-8 text-center">
      <motion.h3 
            className="md:text-3xl text-3xl font-bold md:leading-snug leading-snug"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }} // ให้แสดงแค่ครั้งเดียว
          >
            โรคยอดฮิตในเด็กที่พ่อแม่ควรรู้
          </motion.h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {diseases.map((disease, index) => (
          <motion.div key={index} 
          className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center"initial={{ opacity: 0, y: 30 }}  // เริ่มต้นที่โปร่งใสและเลื่อนขึ้น
          whileInView={{ opacity: 1, y: 0 }}  // เมื่อมองเห็นให้ปรากฏและเลื่อนกลับ
          transition={{ duration: 0.6 }}  // ระยะเวลาแอนิเมชัน
          viewport={{ once: false }}  // ให้แอนิเมชันแสดงครั้งเดียว
        >
            <img src={disease.image} alt={disease.title} className="w-40 h-40 object-cover rounded-lg mb-4" />
            <h2 className="text-xl font-bold text-gray-700">{disease.title}</h2>
            <p className="text-gray-600 mt-2"><strong>อาการของโรค:</strong> {disease.description}</p>
            <p className="text-gray-600 mt-2"><strong>การป้องกัน:</strong> {disease.prevention}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Diseases;
