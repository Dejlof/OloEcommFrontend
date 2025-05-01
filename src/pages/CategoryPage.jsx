import React from 'react'
import MainLayout from '../Layouts/MainLayout'
import ComponentCard from '../components/ComponentCard'

const CategoryPage = () => {
  return (
   <>
   <MainLayout>
    <div className=' bg-gray-300 w-[75%] m-auto'>
    <div className='my-10'>
        <div className=' bg-white'>
        <div className=' flex flex-row justify-between pb-5'>
        <div>
        <h2 className='text-2xl'>Clothes <span className= 'text-sm'>(8469 products found)</span></h2>
        </div>
           <div className='flex flex-row'>
             <p className='pr-2 pt-1'>Sort by:</p>
             <select className='border-2 border-gray-300 rounded-md  text-sm '>
               <option value="default">Default</option>
               <option value="low">Price: Low to High</option>
               <option value="high">Price: High to Low</option>
               <option value="newest">Newest Arrivals</option>
              </select>
           </div>
        </div>
        <div>
          <ComponentCard/>
        </div>
           
          </div>
         

    </div>

    </div>
   </MainLayout>
   </>
  )
}

export default CategoryPage
