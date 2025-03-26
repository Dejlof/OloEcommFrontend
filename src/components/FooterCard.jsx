import React from 'react'
import { Link } from 'react-router-dom'


const FooterCard = ({HeadLink, sublinkone, sublinktwo, sublinkthree, sublinkfour}) => {
  return (
    <div className='basis-1/4'>
       <ul>
                <li>
                    <Link to='/'>
                        <h3>{HeadLink}</h3>
                    </Link>
                </li>
                <li className='text-[13px] pt-3'>
                    <Link to='/'>{sublinkone}</Link>
                </li>
                <li className='text-[13px]'>
                    <Link to='/'>{sublinktwo}</Link>
                </li>
                <li className='text-[13px]'>
                    <Link to='/'>{sublinkthree}</Link>
                </li>
                <li className='text-[13px]'>
                    <Link to='/'>{sublinkfour}</Link>
                </li>
            </ul>
    </div>
  )
}

export default FooterCard
