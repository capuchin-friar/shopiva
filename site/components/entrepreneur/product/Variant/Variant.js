import React from 'react'
import './style.css'
import ui_image from '../../../../svgs/add-circle-svgrepo-com (3).svg'

export default function Variant() {
  return (
    <>
        <div className="product-variant">
            <h6 style={{color: '#727272'}}>Variant</h6>

            <br />

           <button className='variant-btn' style={{color: '#727272', background: '#fff', padding: '5px', height: 'auto', fontSize: 'small', borderRadius: '5px'}}>
                <span>
                    <img src={ui_image.src}  style={{height: '20px', width: '20px', borderRadius: '10px'}} alt="" />

                </span>
                &nbsp;
                &nbsp;
                <span><>Add options like color, size or style.</></span>
           </button>
        </div>
      
    </>
  )
}
