import React from 'react'

const Button = ({children, type, onClick,  disabled, className = '', ...rest}) => {
  return (
    <div>
    <button className={`px-6 py-2 bg-orange-300 text-green-900 rounded-2xl w-full sm:w-auto text-center cursor-pointer ${className}` }
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