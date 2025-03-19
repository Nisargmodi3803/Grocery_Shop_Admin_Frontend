import React from 'react'
import Sidebar from './Sidebar'
import './ProductInquiry.css'

export const ProductInquiry = () => {
  return (
    <div className='product-inquiry'>
        <Sidebar activeId={15}/>
        <h1>Product Inquiry</h1>
    </div>
  )
}
