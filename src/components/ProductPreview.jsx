import React from 'react'
import Card from './Card'


const ProductPreview = ({texthead, ImgSource, altname, ProductName, Price}) => {
  return (
    <div className='mt-10'>
        <div>
            <h1 className='text-center text-3xl py-5'>{texthead}</h1>
        </div>
        <div className='flex flex-row w-[80%] m-auto justify-between'>
        <Card ImgSource={ImgSource} altname={altname} Name={ProductName} Price={Price} />
       
      </div>
      
    </div>
  )
}

export default ProductPreview
