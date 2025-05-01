import React from 'react'
import MainLayout from '../Layouts/MainLayout'
import Header from '../components/Header'
import Label from '../components/Label'
import Input from '../components/Input'
import Button from '../components/Button'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  return (
   <MainLayout>
    <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-100 text-sm pt-30'>
    <Header title={"Forgot Password"} word={"No worries, we’ll send you reset instructions."}/>
        <div className='mt-5 mb-10'>
        <Label label={"Email"}/>
        <div className="relative">
          <Input
           type={"text"}
           placeholder={"Enter your email"}
           name={"email"}
           required={true}
          />
        </div>
        </div>

           <Button >
            Reset Password
            </Button>
        <p className='p-4 text-green-900'> <i class="fa-solid fa-arrow-left"></i> Back to <Link className='text-orange-500 ' to="/">log in</Link></p>
    </div>
   </MainLayout>
  )
}

export default ForgotPassword
