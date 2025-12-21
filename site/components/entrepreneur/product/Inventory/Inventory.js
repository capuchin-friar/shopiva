import React from 'react'
import './style.css'

export default function Inventory() {
  return (
    <>
        <div className="product-inventory">
            <h6 style={{color: '#727272'}}>Inventory</h6>

            <br />

            <div className='inventory-input-cnt'>
                <div className="input-cnt">
                    <input style={{width: '15px', height: '15px', border: '1px solid #727272'}} placeholder='Product price' type='checkbox' name="" id="" />
                    {/* &nbsp; */}
                    &nbsp;
                    <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>Track quantity</small></label>
                    {/* <div className="err-mssg"></div> */}
                </div>
            </div>

            {/* <br /> */}
            <hr />
            {/* <br /> */}

            <h6 style={{color: '#727272'}}>Quantity</h6>

            <br />

            <div>
                <div className='inventory-input-cnt'>
                    <span style={{color: '#727272'}}><small>Ifite Awka</small></span>
                    <span><input style={{border: '1px solid #727272'}} value={15} type="number" name="" id="" /></span>
                </div>

                <br />

                <div className="input-cnt" style={{alignItems: 'flex-end'}}>
                    <input style={{width: '15px', height: '15px', border: '1px solid #727272'}} placeholder='Product price' type='checkbox' name="" id=""  />
                    {/* &nbsp; */}
                    &nbsp;
                    <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>Continue selling when out of stock</small></label>
                    {/* <div className="err-mssg"></div> */}
                </div>
            </div>
        </div>
      
    </>
  )
}
