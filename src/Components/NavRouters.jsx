import React, { useEffect, useState } from 'react'
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
import { UpdateCity } from './UpdateCity';
import { AddCity } from './AddCity';
import { AddBlog } from './AddBlog';
import { UpdateBlog } from './UpdateBlog';
import { UpdateTimeSlot } from './UpdateTimeSlot';
import { AddTimeSlot } from './AddTimeSlot';
import { ProductReview } from './ProductReview';
import { NewAdmin } from './NewAdmin';
import { UpdatePasswordAdmin } from './UpdatePasswordAdmin';
import { Login } from './Login';
import { UpdateDeliveryRoute } from './UpdateDeliveryRoute';
import { AddDeliveryRoute } from './AddDeliveryRoute';
import { UpdateCouponCode } from './UpdateCouponCode';
import { AddCouponCode } from './AddCouponCode';
import { UpdateProduct } from './UpdateProduct';
import { AddProduct } from './AddProduct';
import { DuplicateProduct } from './DuplicateProduct';
import { PointTransaction } from './PointTransaction';
import { Dashboard } from './Dashboard';
import { OrderDetails } from './OrderDetails';

export const NavRouters = () => {

    return (
        <>
            <Routes>

                <Route path="/" element={<Navigate to="/admin/login" replace />} />
                <Route path='/admin/login' element={<Login/>} />
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
                <Route path='/admin/point-transaction' element={<PointTransaction/>}/>
                <Route path='/admin/contact' element={<Contact/>}/>
                <Route path='/admin/dashboard' element={<Dashboard/>}/>
                <Route path='/admin/product-inquiry' element={<ProductInquiry/>}/>
                <Route path='/admin/delivery-boy' element={<DeliveryRoute/>}/>
                <Route path='/admin/time-slot' element={<TimeSlot/>}/>
                <Route path='/admin/product-review' element={<ProductReview/>}/>
                <Route path='/admin/new-admin' element={<NewAdmin/>}/>
                <Route path='/admin/update-password' element={<UpdatePasswordAdmin/>}/>
                <Route path='/admin/brands/update-brand/:brandId' element={<UpdateBrand/>} />
                <Route path='/admin/brands/add-brand' element={<AddBrand/>} />
                <Route path='/admin/category/update-brand/:brandId' element={<UpdateBrand/>}/>
                <Route path='/admin/Category/update-category/:categoryId' element={<UpdateCategory/>}/>
                <Route path='/admin/category/add-category' element={<AddCategory/>} />
                <Route path='/admin/subcategory/update-subcategory/:subcategoryId' element={<UpdateSubcategory/>}/>
                <Route path='/admin/subcategory/add-subcategory' element={<AddSubcategory/>}/>
                <Route path='/admin/city/update-city/:cityId' element={<UpdateCity/>}/>
                <Route path='/admin/city/add-city' element={<AddCity/>}/>
                <Route path='/admin/blogs/add-blog' element={<AddBlog/>}/>
                <Route path='/admin/blogs/update-blog/:blogId' element={<UpdateBlog />}/>
                <Route path='/admin/time-slot/update-slot/:slotId' element={<UpdateTimeSlot/>}/>
                <Route path='/admin/time-slot/add-slot' element={<AddTimeSlot/>}/>
                <Route path='/admin/delivery-boy/update-delivery-boy/:deliveryBoyId' element={<UpdateDeliveryRoute/>}/>
                <Route path='/admin/delivery-boy/add-delivery-boy' element={<AddDeliveryRoute/>}/>
                <Route path='/admin/coupon/update-coupon/:couponId' element={<UpdateCouponCode />}/>
                <Route path='/admin/coupon/add-coupon' element={<AddCouponCode />}/>
                <Route path='/admin/product/update-product/:productId' element={<UpdateProduct />} />
                <Route path='/admin/product/duplicate-product/:productId' element={<DuplicateProduct />} />
                <Route path='/admin/product/add-product' element={<AddProduct />} />
                <Route path='/admin/orders/order-details/:invoiceNum' element={<OrderDetails />} />
            </Routes>
        </>
    )
}