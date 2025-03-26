import React from 'react'
import FooterCard from './FooterCard'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
  <footer className='mt-40 bg-gray-200 p-10 text-green-900'>
     <div className='flex flex-row w-[90%] m-auto'>
        <FooterCard HeadLink={"Explore"} sublinkone={"Our story"} sublinktwo={"Careers"} sublinkthree={"Locations"} sublinkfour={"Corporate Gifting"}/>
        <FooterCard HeadLink={"Resources"} sublinkone={"Sell on Oloja"} sublinktwo={"Become a sale consultant"} sublinkthree={"Blog"} sublinkfour={"Corporate and bulk purchases"}/>
        <FooterCard HeadLink={"Customer Service"} sublinkone={"FAQ"} sublinktwo={"Shipping & Handling"} sublinkthree={"30-Day Guarantee"} sublinkfour={"Contact Us"}/>
        <div>
            <ul>
                <li><Link>
                <h3>New to Oloja MarketPlace Store?</h3>
                </Link></li>
                <li className='text-[13px] pt-3'>
                    Get tips, exclusive offers & event invites straight to your inbox. No spam ever.
                </li>
                <li className='relative text-[13px]'>
                    <form>
                        <input className='border-b border-black w-full my-2' type="email"  name="email" placeholder="Email"/> <br/>
                        <input  type='checkbox' id='checkbox' name='checkbox'/>
                        <label for="checkbox">I agree with the privacy policy</label>
                        <input className='absolute right-2 bottom-0 bg-orange-200 px-2 rounded-sm' type="button" id="submit" name="submit" value="Submit"></input>
                    </form>
                </li>
            </ul>
        </div>
     </div>
  </footer>
  )
}

export default Footer
