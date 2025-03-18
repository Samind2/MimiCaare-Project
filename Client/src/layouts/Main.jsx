import React from 'react'
import { Outlet } from 'react-router'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import "./Main.css"

const Main = () => {
 return (
  <div>
   <NavBar />
   <Outlet />
   <Footer />

  </div>
 )
}

export default Main