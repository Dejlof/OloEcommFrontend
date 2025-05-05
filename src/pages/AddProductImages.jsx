import React from 'react'
import Header from '../components/Header'
import MainLayout from '../Layouts/MainLayout'
import { Trash2 } from 'lucide-react'
import Button from '../components/Button'


const AddProductImages = () => {
    const [images, setImages] = React.useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            alert("You can only upload a maximum of 4 images.");
            return;
          }
        const newImages = files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
      };
    
      if(images.length > 4) {
        alert("You can only upload a maximum of 4 images.");
        return;
      }
      const handleDelete = (preview) => {
        setImages((prev) => prev.filter((img) => img.preview !== preview));
        URL.revokeObjectURL(preview); 
      };

      
  return (
   <MainLayout>
     <div className=' flex flex-col justify-center items-center w-[75%] m-auto h-100 text-sm pt-30'>
     <Header title={"Insert Product Images"} word={"Kindly add your product images"}/>
     <div className="p-4">
      <input 
      className="border mb-4 py-2 lg:pl-3 lg:pr-5 pl-5 pr-5 w-90 md:w-150 text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
       
      />

      <div className="flex flex-wrap gap-4 m-auto">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-32 h-32 border rounded overflow-hidden shadow-sm">
            <img
              src={img.preview}
              alt={`Preview ${idx}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDelete(img.preview)}
              className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1 hover:bg-red-100"
              title="Delete"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
      <div>
        <Button type={"submit"} >
             Add Images
             </Button>
      </div>
        </div>  
   </MainLayout>
  )
}

export default AddProductImages
