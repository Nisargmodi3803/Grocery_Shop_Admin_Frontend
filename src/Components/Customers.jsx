import React from 'react'
import Sidebar from './Sidebar'
import './Customers.css'

export const Customers = () => {
  return (
    <div className='customers'>
        <Sidebar activeId={7}/>
        <h1>Customers</h1>
    </div>
  )
}
