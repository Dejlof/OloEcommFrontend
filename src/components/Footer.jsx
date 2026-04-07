import React from 'react'
import FooterCard from './FooterCard'


const Footer = () => {
  return (
  <footer className='bg-gray-200 py-10 px-6 text-green-900'>
     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-[90%] m-auto'>
        <FooterCard HeadLink={"Explore"} sublinkone={"Our story"} sublinktwo={"Careers"} sublinkthree={"Locations"} sublinkfour={"Corporate Gifting"}/>
        <FooterCard HeadLink={"Resources"} sublinkone={"Sell on Oloja"} sublinktwo={"Become a sale consultant"} sublinkthree={"Blog"} sublinkfour={"Corporate and bulk purchases"}/>
        <FooterCard HeadLink={"Customer Service"} sublinkone={"FAQ"} sublinktwo={"Shipping & Handling"} sublinkthree={"30-Day Guarantee"} sublinkfour={"Contact Us"}/>
        <div>
            <ul>
                <li>
                  <h3 className="font-semibold text-sm">New to Oloja MarketPlace Store?</h3>
                </li>
                <li className='text-[13px] pt-3'>
                    Get tips, exclusive offers & event invites straight to your inbox. No spam ever.
                </li>
                <li className='relative text-[13px] pb-8'>
                    <form>
                        <input className='border-b border-black w-full my-2' type="email" name="email" placeholder="Email"/><br/>
                        <input type='checkbox' id='checkbox' name='checkbox'/>
                        <label htmlFor="checkbox"> I agree with the privacy policy</label>
                        <input className='absolute right-2 bottom-0 bg-orange-200 px-2 rounded-sm' type="button" id="submit" name="submit" value="Submit"/>
                    </form>
                </li>
            </ul>
        </div>
     </div>
  </footer>
  )
}

export default Footer
