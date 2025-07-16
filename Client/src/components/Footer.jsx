import React from "react";

const Footer = () => {
  return (
    <footer className="w-full relative z-0 footer footer-horizontal footer-center bg-base-200 text-base-content p-6">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">About us</a>
        <a className="link link-hover">Vaccines</a>
        <a className="link link-hover">Developments</a>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All rights reserved by
          Mimi Care Project
        </p>
      </aside>
    </footer>
  );
};

export default Footer;