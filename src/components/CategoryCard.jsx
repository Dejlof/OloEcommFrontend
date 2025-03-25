import React from 'react'

const CategoryCard = ({ImgSource, altname, link, title}) => {
  return (
    <div className='text-center rounded-2xl '>
      <img src ={ImgSource}  alt= {altname} className='w-55 h-60 rounded-2xl bg-gray-100' />
      <a href={link}>{title}</a>
    </div>
  )
}

export default CategoryCard
