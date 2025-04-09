import React from 'react'

const ProductSpecification = () => {
  return (
    <div className='flex flex-row' >
    <div className='basis-2/3'>
       <h1 className='text-xl pb-3 font-semibold'>Product Details</h1>
       <p className='text-sm w-[75%] text-gray-400'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum distinctio nesciunt velit esse! Culpa laboriosam odit ullam debitis praesentium unde molestiae, eligendi veniam numquam nihil! Officia voluptatum doloribus sed esse nisi commodi autem natus, unde aperiam deserunt reprehenderit vitae totam repellat voluptate eaque eum. Aut rem optio, dolore commodi labore dolorum voluptatibus deleniti quas quis accusamus. Dicta facilis tempora, quibusdam aut doloribus nostrum mollitia voluptas quaerat ipsam incidunt. Nulla, libero. Illum voluptatem autem eius hic mollitia pariatur porro, nobis aspernatur similique et ipsam at suscipit labore distinctio deserunt, corporis quam omnis repudiandae fugiat earum vitae cum! Reiciendis suscipit harum totam.
       </p>
    </div>
    <div className='basis-1/3'>
        <h1 className='text-xl pb-3 font-semibold '>Specification</h1>
        <ul className='text-sm text-gray-400 pl-2'>
           <li>M4 chip</li>
           <li>18 hours of battery life</li>
           <li> 12MP Center Stage camera </li>
           <li>Support for up to two external displays </li>
        </ul>
    </div>
      </div>
  )
}

export default ProductSpecification
