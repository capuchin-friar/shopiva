import React, { useState } from 'react'
import './style.css'

export default function Inventory() {
  const [quantity, setQuantity] = useState("15");

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

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    let value = e.target.value;
    // Remove commas for processing
    value = value.replace(/,/g, '');
    // Allow empty or numbers only (no decimals for quantity)
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  // Format display value with commas
  const getDisplayValue = (value) => {
    if (!value) return '';
    return formatNumber(value);
  };

  return (
    <>
        <div className="product-inventory">
            <h6 style={{color: '#727272'}}>Inventory</h6>

            {/* <br /> */}

            {/* <div className='inventory-input-cnt'>
                <div className="input-cnt">
                    <input style={{width: '15px', height: '15px', border: '1px solid #727272'}} placeholder='Product price' type='checkbox' name="" id="" />
                    &nbsp;
                    <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>Track quantity</small></label>
                </div>
            </div> */}

            {/* <br /> */}
            <hr />
            {/* <br /> */}

            <h6 style={{color: '#727272'}}>Quantity</h6>

            <br />

            <div>
                <div className='inventory-input-cnt'>
                    <span style={{color: '#727272'}}><small>Ifite Awka</small></span>
                    <span><input 
                      style={{border: '1px solid #727272'}} 
                      value={getDisplayValue(quantity)} 
                      type="text" 
                      name="" 
                      id="" 
                      onChange={handleQuantityChange}
                    /></span>
                </div>

                <br />

                <div className="input-cnt" style={{alignItems: 'center'}}>
                    <input style={{width: '15px', height: '15px', border: '1px solid #727272'}} placeholder='Product price' type='checkbox' name="" id=""  />
                    {/* &nbsp; */}
                    &nbsp;
                    <label style={{margin: '-8px 0 0 0', height: '15px'}} htmlFor=""><small>Continue selling when out of stock</small></label>
                    {/* <div className="err-mssg"></div> */}
                </div>
            </div>
        </div>
      
    </>
  )
}
