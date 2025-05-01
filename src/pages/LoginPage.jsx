import React from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../Layouts/MainLayout'
import Input from '../components/Input'
import Label from '../components/Label'
import Header from '../components/Header'
import Button from '../components/Button'


const LoginPage = () => {
  return (
    <MainLayout>
        <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-100 text-sm pt-30'>
            <Header title={"Log In"} word={"Welcome to Oloja!!! Please fill in your credentials"}/>
         <div className='pt-4'>
            <div >
            <Label label={"Email or Phone"}/>
            <Input name={"login"} placeholder={"Email or Phone"} type={"text"}/>
            </div>
            <div className='pt-4' >
            <Label label={"Password"}/>
            <div className='relative'>
            <Input name={"password"} placeholder={"Password"} type={"Password"}/>
            <button type="button"className="absolute right-5 top-3 text-gray-400" onClick={()=>{setShowPassword(!showPassword)}}>
       <i class="fa-regular fa-eye"></i>
         </button>
            </div>
            <div className="flex w-90 md:w-100 pt-5 pb-5">
         <div className='flex flex-row basis-1/2'>
        <Input
       type={"checkbox"}
       wmd='lg:w-5'
       w='w-5'
       pad='pl-2'
       name="rememberMe"
      />
      <p className='p-0'>Remember me</p>  
    </div>
    <Link to="/" className="basis-1/2 text-end underline">Forgot Password?</Link>
     </div>
    </div>
    <div className='text-center'>
  <Button type={"submit"} >
        Log In
        </Button>
  </div>
         </div>

        </div>
    </MainLayout>
  )
}

export default LoginPage
