import React from 'react'
import Card from './Card';
import Macbook2 from '../assets/1MacBookAirM4.jpeg'
import Macbook3 from '../assets/3MacbookAirM4.jpeg'
import Macbook4 from '../assets/4MacbookAirM4.jpg'


const OtherProductImages = () => {
  return (
    <div>
        <div className='flex flex-row pt-20'>
        <div className='basis-2/5'>
        <div className='pb-4'>
            <Card ImgSource={Macbook3} w='w-105' h='h-60'/>
        </div>
        <div>
        <Card ImgSource={Macbook4} w='w-105' h='h-60'/>
        </div>
        </div>
        <div className='basis-3/5'>
          <Card ImgSource={Macbook2} w='w-155' h='h-124'/>
        </div>
       </div>
    </div>
  )
}

export default OtherProductImages
