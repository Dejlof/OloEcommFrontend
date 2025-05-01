import React from 'react'
import MainLayout from '../Layouts/MainLayout'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Label from '../components/Label'
import Header from '../components/Header'
import Button from '../components/Button'

const RegisterPage = () => {
  return (
   <MainLayout>
 <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-160 text-sm pt-30'>
            <Header title={"Sign Up"} word={"Welcome to Oloja!!! Please fill in your credentials"}/>
         <div className='pt-4'>
            <div >
            <Label label={"First Name"}/>
            <Input name={"firstname"} placeholder={"Your First Name"} type={"text"}/>
            </div>
            <div className='pt-4' >
            <Label label={"Last Name"}/>
            <Input name={"lastname"} placeholder={"Your Last Name"} type={"text"}/>
            </div>
            <div className='pt-4' >
            <Label label={"Email"}/>
            <Input name={"email"} placeholder={"Your Email"} type={"text"}/>
            </div>
            <div className='pt-4' >
            <Label label={"Phone"}/>
            <Input name={"phoneNumber"} placeholder={"Your Phone"} type={"phone"}/>
            </div>
            <div className='pt-4' > 
                <Label label="Role" />
            <select
              className="border py-2 lg:pl-3 lg:pr-10 pl-10 pr-10  w-100 text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="role"
            >
              <option value="">---</option>
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor</option>
            </select>

            </div>
            <div className='pt-4' >
            <Label label={"Password"}/>
            <div className='relative'>
            <Input name={"password"} placeholder={"Password"} type={"Password"}/>
            <button type="button"className="absolute right-5 top-3 text-gray-400" onClick={()=>{setShowPassword(!showPassword)}}>
       <i class="fa-regular fa-eye"></i>
         </button>
            </div>
        </div>
        <div className='pt-4' >
            <Label label={"Confirm Password"}/>
            <div className='relative'>
            <Input name={"confirmPassword"} placeholder={"Confirm Password"} type={"Password"}/>
            <button type="button"className="absolute right-5 top-3 text-gray-400" onClick={()=>{setShowPassword(!showPassword)}}>
       <i class="fa-regular fa-eye"></i>
         </button>
            </div>
            </div>  
    <div className='text-center pt-8'>
  <Button type={"submit"} >
        Sign Up
        </Button>
  </div>
         </div>

        </div>
   </MainLayout>
  )
}

export default RegisterPage
