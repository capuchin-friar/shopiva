import React from 'react'
import './style.css'

export default function Price() {
  return (
    <>
        <div className="product-price">
            <h6 style={{color: '#727272'}}>Pricing</h6>

            <br />

            <div className='price-input-cnt'>
                <div className="input-cnt">
                    <label htmlFor="">Price</label>
                    <input placeholder='Product price' type='number' name="" id="" />
                    <div className="err-mssg"></div>
                </div>
                <div className="input-cnt">
                    <label htmlFor="">Compare-at price</label>
                    <input placeholder='Product price' type='number' name="" id="" />
                    <div className="err-mssg"></div>
                </div>
            </div>

            <br />

            {/* <hr style={{width: '95%', margin: '0 auto'}} /> */}

            <br />

            <section>
                <div className="input-cnt" style={{alignItems: 'flex-end'}}>
                    <input style={{width: '15px', height: '15px'}} placeholder='Product price' type='checkbox' name="" id="" />
                    {/* &nbsp; */}
                    &nbsp;
                    <label style={{margin: '-4px 0 0 0', height: '15px'}} htmlFor=""><small>Charge tax on this product</small></label>
                    {/* <div className="err-mssg"></div> */}
                </div>
            </section>
        </div>
    </>
  )
}
