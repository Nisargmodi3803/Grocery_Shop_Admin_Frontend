import React from 'react'
import Sidebar from './Sidebar'
import './Subcategory.css'

export const Subcategory = () => {
  return (
    <div className='subcategory'>
        <Sidebar activeId={4}/>
        <h1>Subcategory</h1>
    </div>
  )
}
