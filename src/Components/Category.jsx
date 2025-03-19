import React from 'react'
import Sidebar from './Sidebar'
import './Category.css'

export const Category = () => {
  return (
    <div className='category'>
        <Sidebar activeId={3}/>
        <h1>Category</h1>
    </div>
  )
}
