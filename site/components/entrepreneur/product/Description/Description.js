import React from 'react'
import './style.css'
import Tools from './Tools'
export default function Description({
    updateDescription
}) {

  return (
    <>
       <div className="product-description">
            <div className="input-cnt">
                <label htmlFor="">Product description</label>
                <div className="editor-cnt">
                  <Tools />

                  
                  <div className="editor" contentEditable>

                  </div>
                </div>
                <div className="err-mssg"></div>
            </div>
        </div>
    </>
  )
}
