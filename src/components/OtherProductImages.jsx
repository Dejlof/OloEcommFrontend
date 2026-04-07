import React from 'react'
import Macbook2 from '../assets/1MacBookAirM4.jpeg'
import Macbook3 from '../assets/3MacbookAirM4.jpeg'
import Macbook4 from '../assets/4MacbookAirM4.jpg'

const OtherProductImages = () => {
  return (
    <div>
      <div className='flex flex-col sm:flex-row pt-10 sm:pt-20 gap-3'>
        <div className='flex flex-row sm:flex-col sm:basis-2/5 gap-3'>
          <div className='flex-1'>
            <img src={Macbook3} alt="" className='w-full h-40 sm:h-48 object-cover rounded-lg' />
          </div>
          <div className='flex-1'>
            <img src={Macbook4} alt="" className='w-full h-40 sm:h-48 object-cover rounded-lg' />
          </div>
        </div>
        <div className='sm:basis-3/5'>
          <img src={Macbook2} alt="" className='w-full h-64 sm:h-full object-cover rounded-lg' />
        </div>
      </div>
    </div>
  )
}

export default OtherProductImages
