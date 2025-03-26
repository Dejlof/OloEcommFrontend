import React from 'react'
import ProductPreview from './ProductPreview'
import MenFashion from '../assets/GuyFashion.jpg'

const BestSeller = () => {
  return (
    <div>
      <ProductPreview ImgSource={MenFashion} altname={"menfashion"} ProductName={"Men Fashion"} texthead={"Our Best Sellers"} Price={"N200,000"}/>
    </div>
  )
}

export default BestSeller
