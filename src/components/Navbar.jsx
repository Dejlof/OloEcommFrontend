import React from 'react'

const Navbar = () => {
  return (
    <div className='flex flex-row justify-around p-6 bg-orange-300'>
      <div className='pt-3' >   
        <h1 className='text-xl text-green-900 text-bold'>Oloja <span>MarketPlace</span></h1>
      </div>
      <div>
        <ul className='list-none p-0 m-0 flex flex-row text-green-900'>
            <li className='p-2'><a href="">Home</a></li>
            <li className='p-2'><a href="">Products</a></li>
            <li className='p-2'><a href="">About</a></li>
            <li className='p-2'><a href="">Contact Us</a></li>
            <li className='p-2'><a href="">Become a Vendor</a></li>
        </ul>
      </div>
      <div>
      <ul className='list-none p-0 m-0 flex flex-row text-green-900' >
         <li className='p-2'><a href="# "><i class="fa fa-magnifying-glass "></i></a></li>
         <li className='p-2'><a href="# "><i class="fa-regular fa-user"></i></a></li>
         <li className='p-2'><a href="# "><i class="fa-solid fa-cart-shopping "></i></a></li>
         </ul>
      </div>
    </div>
  )
}

export default Navbar
