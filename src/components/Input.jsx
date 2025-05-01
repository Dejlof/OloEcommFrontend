import React from 'react'

const Input = ({name, value,type, onChange, placeholder, w='w-90',wmd ='lg:w-100', pad ='pl-2', required ,checked}) => {
    return (
      <div>
    <input 
      type={type} 
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      name={name}
      className={`${w} p-2 ${pad} ${wmd} border text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 `}
      required ={required}
      checked={type === 'checkbox' ? checked : undefined}
    />

  </div>
     
    );
  };
  
  export default Input;