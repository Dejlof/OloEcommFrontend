import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faStar as faStarEmpty } from '@fortawesome/free-solid-svg-icons';

const CategoryCard = ({ImgSource, altname, Name, Price, w= 'w-40', h ='h-50',border ='rounded-none', text = 'text-left'} ) => {
 let rating;
 rating =5;
 const totalRatings = 20;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-500 text-sm" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="text-yellow-500 text-sm" />);
    } else {
      stars.push(<FontAwesomeIcon key={i} icon={faStarEmpty} className="text-gray-300 text-sm" />);
    }
  }




    return (
      <div className={`${text} ease-in-out duration-1000 hover:-translate-y-2 transition`} >
        <img src ={ImgSource}  alt= {altname} className={`${w} ${h} ${border} bg-gray-200 p-2 hover:bg-orange-100`} />
        <h3 className='pt-2'>{Name}</h3>
        <p className='text-sm font-bold'>{Price}</p>
        <div className='text-sm my-1'>{stars}({totalRatings})</div>
    <div>
    <button className='px-3 py-1 border border-orange-400 bg-white text-orange-400 hover:bg-orange-400 hover:text-white text-sm'><a href="">Add to cart</a></button>
    </div>
      </div>
    )
  }

export default CategoryCard
