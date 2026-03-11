import React, { useState } from 'react'
import './style.css'

export default function Price() {
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");

  // Format number with thousands separator
  const formatNumber = (value) => {
    if (!value) return '';
    
    // Remove all commas first
    const numericValue = value.toString().replace(/,/g, '');
    
    // Split by decimal point
    const parts = numericValue.split('.');
    
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Join back with decimal point if there was one
    return parts.length > 1 ? parts.join('.') : parts[0];
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remove commas for processing
    value = value.replace(/,/g, '');
    // Allow empty, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  // Handle compare-at price input change
  const handleCompareAtPriceChange = (e) => {
    let value = e.target.value;
    // Remove commas for processing
    value = value.replace(/,/g, '');
    // Allow empty, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCompareAtPrice(value);
    }
  };

  // Format display value with commas
  const getDisplayValue = (value) => {
    if (!value) return '';
    return formatNumber(value);
  };

  return (
    <>
        <div className="product-price">
            <h6 style={{color: '#727272'}}>Pricing</h6>

            <br />

            <div className='price-input-cnt'>
                <div className="input-cnt">
                    <label htmlFor="">Price</label>
                    <input 
                      placeholder='Product price' 
                      type='text' 
                      name="" 
                      id="" 
                      value={getDisplayValue(price)}
                      onChange={handlePriceChange}
                    />
                    <div className="err-mssg"></div>
                </div>
                <div className="input-cnt">
                    <label htmlFor="">Compare-at price</label>
                    <input 
                      placeholder='Product price' 
                      type='text' 
                      name="" 
                      id="" 
                      value={getDisplayValue(compareAtPrice)}
                      onChange={handleCompareAtPriceChange}
                    />
                    <div className="err-mssg"></div>
                </div>
            </div>

            {/* <br /> */}

            {/* <hr style={{width: '95%', margin: '0 auto'}} /> */}

            {/* <br />

            <section>
                <div className="input-cnt" style={{alignItems: 'flex-end'}}>
                    <input style={{width: '15px', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" /> */}
                    {/* &nbsp; */}
                    &nbsp;
                    {/* <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>Charge tax on this product</small></label> */}
                    {/* <div className="err-mssg"></div> */}
                {/* </div>
            </section> */}
        </div>
    </>
  )
}
