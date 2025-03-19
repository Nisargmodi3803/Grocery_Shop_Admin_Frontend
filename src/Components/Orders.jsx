import React from 'react'
import './Orders.css'
import Sidebar from './Sidebar'

export const Orders = () => {
  return (
    <div className='orders'>
        <Sidebar activeId={1}/>
        <h1>Orders</h1>
    </div>
  )
}
