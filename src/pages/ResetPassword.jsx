import React from 'react'

import { Link } from 'react-router-dom'
import MainLayout from '../Layouts/MainLayout'
import Input from '../components/Input'
import Label from '../components/Label'
import Header from '../components/Header'
import Button from '../components/Button'

const ResetPassword = () => {
    const [showPassword, setShowPassword] = React.useState(false);


  return (
    <MainLayout>
        <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-100 text-sm pt-30'>
            <Header title={"Set new password"} word={"Must be atleast 8 characters"}/>
         <div className='pt-4'>
            <div >
            <Label label={"Token"}/>
            <Input name={"token"} placeholder={"Enter Token Sent"} type={"text"}/>
            </div>
            <div className='pt-4' >
            <Label label={"New Password"}/>
            <div className='relative'>
            <Input 
            name={"newPassword"} 
            placeholder={"New Password"}
            type={showPassword ? "text":"password"}
             />
            <button type="button"className="absolute right-5 top-3 text-gray-400" onClick={()=>{setShowPassword(!showPassword)}}>
       <i class="fa-regular fa-eye"></i>
         </button>
            </div>   
         </div>
          <div className='pt-4' >
            <Label label={"Confirm Password"}/>
            <div className='relative'>
            <Input name={"confirmPassword"} placeholder={"Confirm Password"} type={showPassword ? "text":"password"}/>
            <button type="button"className="absolute right-5 top-3 text-gray-400" onClick={()=>{setShowPassword(!showPassword)}}>
       <i class="fa-regular fa-eye"></i>
         </button>
            </div>   
        </div>
    <div className='text-center pt-5'>
  <Button type={"submit"} >
        Reset Password
        </Button>
  </div>
         </div>
         <p className='p-5 text-green-900 font-light'> Didn't receive any token <Link className='text-orange-300 font-bold underline '>Click to resend</Link></p>
         <p className='  text-green-900  font-light'> <i class="fa-solid fa-arrow-left"></i> Back to <Link className='text-orange-300 ' to="/">log in</Link></p>
        </div>
    </MainLayout>
  )
}

export default ResetPassword
