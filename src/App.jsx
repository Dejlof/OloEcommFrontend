import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Category from './components/Category'



function App() {
  return (
    <>
     <Navbar />
     <Hero />
     <Category/>
     
    </>
  )
}

export default App
