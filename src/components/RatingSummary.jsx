import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';

const RatingSummary = ({ averageRating, totalRatings, ratingDistribution }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (averageRating >= i) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-500 text-lg" />);
      } else if (averageRating >= i - 0.5) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="text-yellow-500 text-lg" />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-gray-300 text-lg" />);
      }
    }
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md w-[300px] mx-auto">
    <h3 className="text-gray-600 font-bold text-lg text-center">VERIFIED RATINGS ({totalRatings})</h3>
    
    <div className="flex flex-col items-center mt-3">
      <p className="text-3xl font-bold text-gray-800">{averageRating}/5</p>
      <div className="flex space-x-1">{stars}</div>
      <p className="text-gray-500 mt-1">{totalRatings} verified ratings</p>
    </div>

    <div className="mt-4">
      {ratingDistribution.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-sm mr-2" />
          <p className="text-gray-600 text-sm w-4">{item.rating}</p>
          <div className="w-full bg-gray-300 h-2 rounded-lg ml-2">
            <div
              className="bg-yellow-500 h-2 rounded-lg"
              style={{ width: `${(item.count / totalRatings) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm ml-2">({item.count})</p>
        </div>
      ))}
    </div>
  </div>
  )
}

export default RatingSummary
