import React from 'react'
import MainLayout from '../Layouts/MainLayout'
import Hero from '../components/Hero'
import BestSeller from '../components/BestSeller'
import MessageAd from '../components/MessageAd'
import LatestProduct from '../components/LatestProduct'

const HomePage = () => {
  return (
   <>
   <MainLayout>
    <Hero/>
    <BestSeller/>
    <MessageAd/>
    <LatestProduct/>
   </MainLayout>
   </>
  )
}

export default HomePage
