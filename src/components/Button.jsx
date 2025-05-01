import React from 'react'

const Button = ({children, type, onClick,  disabled, className = '', ...rest}) => {
  return (
    <div>
    <button className={`px-4 py-2 bg-orange-300 text-green-900 rounded-2xl md:w-100 w-60 text-center cursor-pointer ${className}` }
    {...rest}
    disabled={disabled}
    type={type} 
    onClick={onClick}>
  {children}
</button>
    </div>
  )
}

export default Button