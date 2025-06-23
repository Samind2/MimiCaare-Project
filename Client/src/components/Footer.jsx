import React from "react";

const Footer = () => {
  return (
    <footer className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
  <nav className="grid grid-flow-col gap-4">
    <a className="link link-hover">About us</a>
    <a className="link link-hover">Vaccines</a>
    <a className="link link-hover">Developments</a>
  </nav>
  {/* <nav>
    <div className="grid grid-flow-col gap-4">
      <a>
      <img src="/Mimicare(1).png" alt="Logo" className="h-6 lg:f-12 pr-a max-auto" />
      </a>
    </div>
  </nav> */}
  <aside>
    <p>Copyright © {new Date().getFullYear()} - All right reserved by Mimi Care Project</p>
  </aside>
</footer>
  );
};

export default Footer;