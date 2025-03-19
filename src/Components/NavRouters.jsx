import React from 'react'
import { Routes, Route, BrowserRouter, Navigate  } from 'react-router-dom';
import { Welcome } from './Welcome';
import Sidebar from './Sidebar';
import { Orders } from './Orders';
import { Brands } from './Brands';
import { Category } from './Category';
import { Subcategory } from './Subcategory';
import { Product } from './Product';
import { City } from './City';
import { Customers } from './Customers';
import { CouponCode } from './CouponCode';
import { Blog } from './Blog';
import { PriceChange } from './PriceChange';
import { Banner } from './Banner';
import { Contact } from './Contact';
import { ProductInquiry } from './ProductInquiry';
import { DeliveryRoute } from './DeliveryRoute';
import { TimeSlot } from './TimeSlot';
import { UpdateBrand } from './UpdateBrand';
import { AddBrand } from './AddBrand';
import { UpdateCategory } from './UpdateCategory';
import { AddCategory } from './AddCategory';
import { UpdateSubcategory } from './UpdateSubcategory';
import { AddSubcategory } from './AddSubcategory';

export const NavRouters = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path='/admin' element={<Welcome />} />
                <Route path='/admin/orders' element={<Orders />} />
                <Route path='/admin/brands' element={<Brands />} />
                <Route path='/admin/category' element={<Category />} />
                <Route path='/admin/subcategory' element={<Subcategory />} />
                <Route path='/admin/product' element={<Product />} />
                <Route path='/admin/city' element={<City />} />
                <Route path='/admin/customers' element={<Customers/>}/>
                <Route path='/admin/coupon' element={<CouponCode />}/>
                <Route path='/admin/blogs' element={<Blog/>}/>
                <Route path='/admin/bulk-price' element={<PriceChange/>}/>
                <Route path='/admin/offer-banner' element={<Banner/>}/>
                <Route path='/admin/contact' element={<Contact/>}/>
                <Route path='/admin/product-inquiry' element={<ProductInquiry/>}/>
                <Route path='/admin/delivery-route' element={<DeliveryRoute/>}/>
                <Route path='/admin/time-slot' element={<TimeSlot/>}/>
                <Route path='/admin/brands/add-brand' element={<AddBrand/>} />
                <Route path='/admin/category/update-brand/:brandId' element={<UpdateBrand/>}/>
                <Route path='/admin/Category/update-category/:categoryId' element={<UpdateCategory/>}/>
                <Route path='/admin/category/add-category' element={<AddCategory/>} />
                <Route path='/admin/subcategory/update-subcategory/:subcategoryId' element={<UpdateSubcategory/>}/>
                <Route path='/admin/subcategory/add-subcategory' element={<AddSubcategory/>}/>
                
            </Routes>
        </>
    )
}
