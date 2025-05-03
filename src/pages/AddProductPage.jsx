import {React, useState} from 'react'
import MainLayout from '../Layouts/MainLayout'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Label from '../components/Label'
import Header from '../components/Header'
import Button from '../components/Button'
import { Trash2 } from 'lucide-react'

const AddProductPage = () => {
   
  


  return (
    <MainLayout>
    <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-200 text-sm pt-30'>
               <Header title={"Add Your Product"} word={"Kindly add your product"}/>
            <div className='pt-4'>
               <div >
               <Label label={"Name"}/>
               <Input name={"name"} placeholder={"Name of Product"} type={"text"} wmd='w-150'/>
               </div>
               <div className='pt-4' >
               <Label label={"Description"}/>
               <textarea
               id='description'
                name='description'
                placeholder='Description of Product'
                rows={7}
                className='border py-2 lg:pl-3 lg:pr-5 pl-5 pr-5 w-90 md:w-150 text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
               >
               </textarea>
               </div>
               <div className='pt-4' >
               <Label label={"Quantity"}/>
               <Input name={"quantityInStock"} placeholder={"Quantity"} type={"number"} wmd='w-150'/>
               </div>
               <div className='pt-4' >
               <Label label={"Price"}/>
               <Input name={"price"} placeholder={"Product Price"} type={"number"} wmd='w-150'/>
               </div>
               <div className='pt-4' >
               <Label label={"Discount Price"}/>
               <Input name={"discountPrice"} placeholder={"Product Discount Price"} type={"number"} wmd='w-150'/>
               </div>
               <div className='pt-4' > 
                   <Label label="Category" />
               <select
                 className="border py-2 lg:pl-3 lg:pr-10 pl-10 pr-10  w-100 md:w-150 text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 name="category"
               >
                 <option value="">---</option>
                 <option value="buyer">Buyer</option>
                 <option value="vendor">Vendor</option>
               </select>
   
               </div>
               
        
       <div className='text-center pt-8'>
     <Button type={"submit"} >
           Add Product
           </Button>
     </div>
            </div>
   
           </div>
      </MainLayout>
  )
}

export default AddProductPage
