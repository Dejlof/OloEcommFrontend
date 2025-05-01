import React from 'react'


const Card = ({ImgSource, altname, Name, Price, w= 'w-40', h ='h-50',border ='rounded-none', text = 'text-left'} ) => {
  return (
    <div className={`${text} ease-in-out duration-1000 hover:-translate-y-2 transition`} >
      <img src ={ImgSource}  alt= {altname} className={`${w} ${h} ${border} bg-gray-200 p-2 hover:bg-orange-100`} />
      <h3 className='pt-2'>{Name}</h3>
      <p className='text-sm font-bold mb-3'>{Price}</p>
    
    </div>
  )
}

export default Card
