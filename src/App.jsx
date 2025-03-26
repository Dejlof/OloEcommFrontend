import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Category from './components/Category'
import BestSeller from './components/BestSeller'
import MessageAd from './components/MessageAd'
import LatestProduct from './components/LatestProduct'
import Footer from './components/Footer'



function App() {
  return (
    <>
     <Navbar />
     <Hero />
     <Category/>
     <BestSeller/>
     <MessageAd/>
    <LatestProduct/>
    <Footer/>
    </>
  )
}

export default App
