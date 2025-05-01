import React from 'react'

import CategoryCard from './CategoryCard';

const ComponentCard = ({width}) => {


  return ( 
 <div>
    <div className={`${width} flex flex-row  m-auto justify-between flex-wrap gap-5`}>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
      <CategoryCard Name={"Nike Sneaker"} Price={"N19000"}/>
    </div>
    
 </div>
    
  )
}

export default ComponentCard
