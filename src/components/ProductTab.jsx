import React, { useState } from 'react'
import Macbook from '../assets/M4Macbook.png'
import Card from './Card'

const ProductTab = () => {
  const [count, setCount] = useState(1);

  return (
    <div className='my-10 sm:my-15'>
      <h2>Go Back</h2>
      <div className='flex flex-col sm:flex-row py-6 sm:py-10 gap-6'>
        <div className='sm:basis-1/2'>
          <img src={Macbook} alt="Macbook" className='w-full h-64 sm:h-96 object-contain' />
        </div>
        <div className='sm:basis-1/2 sm:pt-15'>
          <div className='w-full sm:w-[70%]'>
            <h2 className='text-xl sm:text-2xl pb-4'>APPLE MACBOOK AIR M4</h2>
            <p className='pb-4 text-sm text-gray-500'>
              featuring the blazing-fast performance of the M4 chip, up to 18 hours of battery life,
              a new 12MP Center Stage camera, and a lower starting price. It also offers support for
              up to two external displays in addition to the built-in display,
            </p>
            <h4 className='text-xl pb-5'>N1,870,000</h4>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center py-2 px-4 bg-gray-100 text-sm'>
              <button className='hover:cursor-pointer' onClick={() => setCount(prev => Math.max(1, prev - 1))}>-</button>
              <p className='px-4'>{count}</p>
              <button className='hover:cursor-pointer' onClick={() => setCount(count + 1)}>+</button>
            </div>
            <button className='px-4 py-2 bg-orange-300 hover:cursor-pointer text-sm text-green-900 rounded'>
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTab
