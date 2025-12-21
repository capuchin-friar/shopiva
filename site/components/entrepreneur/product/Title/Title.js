import React from 'react'
import './style.css'
export default function Title({
    updateTitle
}) {
  return (
    <>
      <div className="product-title">
        <div className="input-cnt">
            <label htmlFor="">Product title</label>
            <textarea placeholder='Product Title' name="" id="" ></textarea>
            <div className="err-mssg"></div>
        </div>
      </div>
    </>
  )
}
