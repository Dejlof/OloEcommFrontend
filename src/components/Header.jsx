import React from 'react'

const Header = ({title, word}) => {
    return (
      <div>
        <div className="name-header text-center pb-1 text-green-900">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>{word}</p>
    </div>
      </div>
    )
  }

export default Header
