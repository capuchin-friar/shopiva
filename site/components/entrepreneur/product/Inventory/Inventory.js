import React, { useEffect, useState } from 'react'
import './style.css'

export default function Inventory({
  updateInventory,
  error,
  useVariantQuantity = false,
  variantQuantity = 0,
  defaultQuantity = "",
  defaultAllowBackorders = false,
}) {
  const [quantity, setQuantity] = useState(defaultQuantity !== "" && defaultQuantity !== undefined ? String(defaultQuantity) : "1");
  const [allow_backorders, set_allow_backorders] = useState(defaultAllowBackorders);

  useEffect(() => {
    if (defaultQuantity !== "" && defaultQuantity !== undefined) {
      setQuantity(String(defaultQuantity));
    }
    if (defaultAllowBackorders !== undefined) set_allow_backorders(Boolean(defaultAllowBackorders));
  }, [defaultQuantity, defaultAllowBackorders]);

  useEffect(() => {
    updateInventory({
      qty: useVariantQuantity ? String(variantQuantity) : quantity,
      allow_backorders,
    });
  }, [quantity, allow_backorders, updateInventory, useVariantQuantity, variantQuantity]);

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
                    value={getDisplayValue(useVariantQuantity ? String(variantQuantity) : quantity)} 
                    type="text" 
                    name="" 
                    id="" 
                    readOnly={useVariantQuantity}
                    disabled={useVariantQuantity}
                    onChange={handleQuantityChange}
                  /></span>
                </div>
                {useVariantQuantity && (
                  <small style={{color: '#727272'}}>
                    Quantity is synced automatically from your variant stock.
                  </small>
                )}
                <div className="err-mssg">{error || ""}</div>

                <br />

                <div className="input-cnt" style={{alignItems: 'center', width: "100%", display: "flex", flexDirection: "row" }}>
                <input
                  style={{ width: '15px', height: '15px', border: '1px solid #727272' }}
                  type="checkbox"
                  checked={allow_backorders}
                  onChange={(e) => set_allow_backorders(e.target.checked)}
                />
                  &nbsp;
                  &nbsp;
                  <label style={{margin: '-8px 0 0 0', height: '15px'}} htmlFor=""><small>Continue selling when out of stock</small></label>
                  {/* <div className="err-mssg"></div> */}
                </div>
            </div>
        </div>
      
    </>
  )
}
