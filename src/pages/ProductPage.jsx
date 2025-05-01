import React from 'react'
import MainLayout from '../Layouts/MainLayout'
import ProductTab from '../components/ProductTab';
import ProductSpecification from '../components/ProductSpecification';
import OtherProductImages from '../components/OtherProductImages';
import OtherProductsLike from '../components/OtherProductsLike';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faStar as faStarEmpty } from '@fortawesome/free-solid-svg-icons';
import RatingSummary from '../components/RatingSummary';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';


const ProductPage = ({}) => {
 let rating;
 rating =5;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-500" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="text-yellow-500" />);
    } else {
      stars.push(<FontAwesomeIcon key={i} icon={faStarEmpty} className="text-gray-300" />);
    }
  }

  const ratingData = {
    averageRating: 4.3,
    totalRatings: 469,
    ratingDistribution: [
      { rating: 5, count: 303 },
      { rating: 4, count: 90 },
      { rating: 3, count: 26 },
      { rating: 2, count: 21 },
      { rating: 1, count: 29 }
    ]
  };

  
  return (
    <MainLayout>
    <div className= 'w-[75%] m-auto'>
       <ProductTab/>
       <ProductSpecification/>
     <OtherProductImages/>
     <OtherProductsLike/>
     <div className='mt-15'>
      <div className='flex flex-row justify-between pb-4'>
        <h3 className='pl-10 text-left text-xl font-bold'>Verified Customer Review</h3>
        <p className='pr-10 text-right text-sm text-orange-400'>See All <FontAwesomeIcon icon={faArrowRight}/></p>
      </div>
      <div className='flex flex-row'>
         <div className=' basis-1/3'>
          <RatingSummary {...ratingData} />
         </div>   
         <div className='basis-2/3'>
         <p>COMMENTS FROM VERIFIED PURCHASES</p>
         <div className='text-sm border-b-1 py-4 border-gray-200'>
          <div className='flex gap-1 py-2'>{stars}</div>
          <p className='pb-2'>It blended well and smooth. I haven’t used the dry grinder jar. But i know it will work fine too. You should buy it. </p>
          <p className='text-gray-500'>27-03-25 by Deji Amos</p>
         </div>
         <div className='text-sm border-b-1 py-4 border-gray-200'>
          <div className='flex gap-1 py-2'>{stars}</div>
          <p className='pb-2'>It blended well and smooth. I haven’t used the dry grinder jar. But i know it will work fine too. You should buy it. </p>
          <p className='text-gray-500'>27-03-25 by Deji Amos</p>
         </div>
         </div>

      </div>
     </div>
    </div>
  </MainLayout>
  )
}

export default ProductPage
