import React from 'react'
import Macbook from '../assets/M4Macbook.png'

const MessageAd = () => {
  return (
    <div className='mt-10 bg-orange-100 py-5'>
      <div className='flex flex-row w-[70%] m-auto'>
        <div className=' basis-1/2 pl-20 pt-6'>
            <img src={Macbook} alt="macbookm4" className='w-100 h-80' />
        </div>
<div className='text-left p-10 text-green-900 basis-1/2 '>
    <h1 className='text-3xl pb-2 font-bold'>Oloja's Week</h1>
    <div className='pb-3'>
    <p>Get Exclusive deals</p>
    <p>Between 16-June to 28-June</p>
    </div>
    <h2 className='text-xl font-bold'>Macbook Air M4</h2>
    <p> featuring the blazing-fast performance of the M4 chip, up to 18 hours of battery life,1 a new 12MP Center Stage camera, and a lower starting price. It also offers support for up to two external displays in addition to the built-in display,</p>
    <p className='pt-2 text-xl font-bold'>At just N1870000</p>
</div>
      </div>
    </div>
  )
}

export default MessageAd
