import React from 'react'
import Card from './Card'


const ProductPreview = ({texthead, ImgSource, altname, ProductName, Price, textalign='text-center', fontSize='text-3xl', width='w-[80%]'}) => {
  return (
    <div className='mt-10'>
        <div>
            <h1 className={`${textalign} ${fontSize} py-5`}>{texthead}</h1>
        </div>
        <div className={`${width} flex flex-row  m-auto justify-between`}>
        <Card ImgSource={ImgSource} altname={altname} Name={ProductName} Price={Price} />
       
      </div>
      
    </div>
  )
}

export default ProductPreview
