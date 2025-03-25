import React from 'react'
import MaleFashion from '../assets/GuyFashion.jpg'
import CategoryCard from './CategoryCard'
import WomenFashion from '../assets/Womenwear.jpeg'
import Cosmetic from '../assets/Cosmetic.jpg'
import Tech from '../assets/Tech.jpg'
import Groceries from '../assets/Groceries.jpg'

const Category = () => {
  return (
    <div className='my-20'>
      <div className='flex flex-row w-[80%] m-auto justify-between'>
        <CategoryCard ImgSource={MaleFashion} altname={"malefashion"} title={"Men's Fashion Deal"}/>
        <CategoryCard ImgSource={WomenFashion} altname={"womenfashion"} title={"Women's Fashion Deal"}/>
        <CategoryCard ImgSource={Cosmetic} altname={"cosmetic"} title={"Cosmetic's  Deal"}/>
        <CategoryCard ImgSource={Tech} altname={"tech"} title={"Tech Deals"}/>
        <CategoryCard ImgSource={Groceries} altname={"groceries"} title={"Groceries"}/>
      </div>
    </div>
  )
}

export default Category
