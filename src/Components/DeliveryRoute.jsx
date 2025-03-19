import React from 'react'
import Sidebar from './Sidebar'
import './DeliveryRoute.css'

export const DeliveryRoute = () => {
  return (
    <div className='delivery'>
        <Sidebar activeId={13}/>
        <h1>Delivery Route</h1>
    </div>
  )
}
