import React from 'react'
import './style.css'

export default function Shipping() {
  return (
    <>
        <div className="product-shipping">
            <h6 style={{color: '#727272'}}>Shipping</h6>

            <br />

            <div className='shipping-input-cnt' style={{flexDirection: 'column'}}>
                <div className="input-cnt">
                    <input style={{width: '15px', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
                    &nbsp;
                    <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>This is a physical product</small></label>
                </div>

                <br />

                <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>

                    <label style={{color: '#727272'}} htmlFor=""><small>Weight</small></label>

                    <input placeholder='Weight' type='text' name="" id="" />
                    {/* &nbsp; */}
                    &nbsp;
                </div>
            </div>

            {/* <br /> */}
            <hr />
            {/* <br /> */}

            <div>
                <div className="input-cnt"  style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                    <label htmlFor="" style={{color: '#727272'}}><small>Country/Region of origin</small></label>
                    <select name="" id="">
                        <option value=""></option>
                    </select>
                    <div className="err-mssg"></div>
                </div>
            </div>
        </div>
      
    </>
  )
}
