import React from 'react'
import Shopper from '../assets/Shopper.png'
import GirlShop from '../assets/girlshop.png'

const Hero = () => {
  return (
    <div className='bg-orange-200 pb-4 px-6 justify-between border border-red-800 '>
     <div className='flex flex-row  w-[90%] m-auto'>
        <div className='basis-1/2  pt-40 pl-20 text-green-900'>
            <h1 className='font-bold text-xl'>Oloja Marketplace – Your Ultimate Shopping Destination! </h1>
            <p className='pb-2'>Buy & sell with ease on Oloja Marketplace! 
             </p>
             <button className='px-3 py-1 bg-green-900 text-white'><a href="">Explore</a></button>
        </div>
        <div className='basis-1/2 text-left py-5'>
            <img src={GirlShop} alt="ShopperImage" className='h-100' />
        </div>
        
    </div>
    </div>
  )
}

export default Hero
