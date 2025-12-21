"use client"
import React, { useEffect, useState } from 'react'

import Title from '../../../../components/entrepreneur/product/Title/Title'
import Image from '../../../../components/entrepreneur/product/ImgSample/Image'
import Description from '../../../../components/entrepreneur/product/Description/Description'
import Price from '../../../../components/entrepreneur/product/Price/Price'
import Inventory from '../../../../components/entrepreneur/product/Inventory/Inventory'
import Shipping from '../../../../components/entrepreneur/product/Shipping/Shipping'
import Variant from '../../../../components/entrepreneur/product/Variant/Variant'
import axios from 'axios'
import './styles/xxl.css'

import CategoryFloater from '../../../../components/floaters.js/Category'

export default function CreateProduct() {

  let [product_id, set_product_id] = useState('');
  let [shop_id, set_shop_id] = useState('');
  let [category_active, set_category_active] = useState(false)

  useEffect(() => {
    document.body.style.overflow='hidden'
  }, [])

  function upload_data(data) {
    axios.post('http://localhost:3456/', {
      name: data.name, 
      value: data.value, 
      product_id, 
      shop_id
    })
    .then((result) => {

    })
    .catch((err) => {
      console.log(err)
    })
  }
  

  function updateTitle(data) {
    
  }

  function updateDescription(data) {
    
  }

  function close_floater() {
    set_category_active(!category_active)
  }

  return (
    <>
      {
        category_active
        ?
        <CategoryFloater close_floater={close_floater} />
        :
        ''
      }
      <div className="product-cnt">

        {/* <h3>Add Products</h3> */}

        <section>

        
          <div className='product-details'>
            <h6 style={{color: '#727272'}}>Product details</h6>

            <Title updateTitle={updateTitle} />
            <Description updateDescription={updateDescription} />
            <Image />
            <div className="product-category">
              <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                <label htmlFor="">Category</label>
                <button style={{width: '100%', height: '40px', border: '1px solid #727272', borderRadius: '5px'}} onClick={e=>set_category_active(!category_active)}>{''}</button>
                <div className="err-mssg"></div>
              </div>
            </div>

          </div>

          <br />
          <div className='product-pricing'>
            <Price />
          </div>

          <div className='product-inventory'>
            <Inventory />
          </div>
          <br />

          <div className='product-shipping'>
            <Shipping />
          </div>
          <br />

          <div className='product-variants'>
            <Variant />
          </div>
        </section>

        <section>

        <div className="product-publication">
            <h6 style={{color: '#727272'}}>Product Status</h6>

            {/* <br /> */}

            <div className="input-cnt"  style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}><small>Status</small></label>
              <select name="" id="" style={{padding: '5px', outline: 'none', color: '#727272'}}>
                  {/* <option value="">Active</option> */}
                  <option value="">Draft</option>
              </select>
              <div className="err-mssg"></div>
            </div>
            
          </div>

          <br />

          <div className="product-org-cnt">
            <h6 style={{color: '#727272'}}>Product organization</h6>
            {/* <br /> */}
            

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Brand Name</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div>

            <br />

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Tag</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div>

            <br />

            <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              <label htmlFor="" style={{color: '#727272'}}>
                <small>Vendor</small>
              </label>
              <input  style={{width: '100%', border: '1px solid #727272'}} type="text" name="" id="" />
            </div>

          </div>

          <br />

          <div className="product-publication">
            <h6 style={{color: '#727272'}}>Product Publishing</h6>

            {/* <br /> */}

            <div className="input-cnt" style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
              <input style={{width: '15px', border: '1px solid #727272', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
              &nbsp;
              <label style={{margin: '-4px 0 0 0', height: '15px', color: '#727272'}} htmlFor=""><small>Online store</small></label>
            </div>

            <br />

            <div className="input-cnt" style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
              <input style={{width: '15px', border: '1px solid #727272', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
              &nbsp;
              <label style={{margin: '-4px 0 0 0', height: '15px', color: '#727272'}} htmlFor=""><small>Point Of Sale</small></label>
            </div>
            <br />
            <small style={{color: '#727272', fontSize: 'small'}}>Point of Sale has not been set up. Finish the remaining steps to start selling in person.</small>



          </div>
        </section>

      </div>
    </>
  )
}
