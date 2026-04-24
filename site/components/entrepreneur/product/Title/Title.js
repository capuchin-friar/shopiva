import React from 'react'
import './style.css'
export default function Title({
    updateTitle,
    error,
    editValue
}) {
  return (
    <>
      <div className="product-title" style={{borderRadius: "5px"}}>
        <div className="input-cnt">
            <label htmlFor="">Product title</label>
            <textarea onInput={e => updateTitle(e.target.value)} placeholder='Product Title' name="" id="" value={editValue} ></textarea>
            <div className="err-mssg">{error || ""}</div>
        </div>
      </div>
    </>
  )
}
