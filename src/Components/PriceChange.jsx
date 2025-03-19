import React from 'react'
import Sidebar from './Sidebar'
import './PriceChange.css'

export const PriceChange = () => {
  return (
    <div className='price'>
        <Sidebar activeId={10}/>
        <h1>Price Change</h1>
    </div>
  )
}
