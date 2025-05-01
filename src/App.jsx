import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import { Route, Routes } from 'react-router-dom'
import CategoryPage from './pages/CategoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'




function App() {
  return (
<Routes>
<Route path='/' element={<HomePage/>} />
<Route path='/product' element={<ProductPage/>} />
<Route path='/category' element={<CategoryPage/>} />
<Route path='/login' element={<LoginPage/>} />
<Route path='/register' element={<RegisterPage/>} />

</Routes>
  )
}

export default App
