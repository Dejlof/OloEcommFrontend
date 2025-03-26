import React from 'react'
import MaleFashion from '../assets/GuyFashion.jpg'
import WomenFashion from '../assets/Womenwear.jpeg'
import Cosmetic from '../assets/Cosmetic.jpg'
import Tech from '../assets/Tech.jpg'
import Groceries from '../assets/Groceries.jpg'
import Card from './Card'

const Category = () => {
  return (
    <div className='my-20'>
      <div className='flex flex-row w-[80%] m-auto justify-between'>
        <Card ImgSource={MaleFashion} altname={"malefashion"} Name={"Men's Fashion Deal"} w='w-55' h='h-60' border='rounded-2xl' text='text-center'/>
        <Card ImgSource={WomenFashion} altname={"womenfashion"} Name={"Women's Fashion Deal"} w='w-55' h='h-60' border='rounded-2xl' text='text-center'/>
        <Card ImgSource={Cosmetic} altname={"cosmetic"} Name={"Cosmetic's  Deal"} w='w-55' h='h-60' border='rounded-2xl' text='text-center'/>
        <Card ImgSource={Tech} altname={"tech"} Name={"Tech Deals"} w='w-55' h='h-60' border='rounded-2xl' text='text-center'/>
        <Card ImgSource={Groceries} altname={"groceries"} Name={"Groceries"} w='w-55' h='h-60' border='rounded-2xl' text='text-center'/>
      </div>
    </div>
  )
}

export default Category
