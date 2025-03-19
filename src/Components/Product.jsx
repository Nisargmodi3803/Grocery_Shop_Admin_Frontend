import React from 'react'
import Sidebar from './Sidebar'
import './Product.css'

export const Product = () => {
  return (
    <div className='product'>
        <Sidebar activeId={5}/>
        <h1>Product</h1>
    </div>
  )
}
