import React, { useEffect } from 'react'
import './style.css'
import Tools from './Tools'

export default function Description({ updateDescription, editValue }) {

  useEffect(() => {
    document.querySelector(".editor").innerHTML = editValue;
  }, [editValue])
  return (
    <div className="product-description">
      <div className="input-cnt">
        <label htmlFor="">Product description</label>
        <div className="editor-cnt">
          <Tools />

          <div
            className="editor"
            contentEditable
            
            onInput={(e) => updateDescription(e.currentTarget.innerHTML)}
          />
        </div>
        <div className="err-mssg"></div>
      </div>
    </div>
  )
}