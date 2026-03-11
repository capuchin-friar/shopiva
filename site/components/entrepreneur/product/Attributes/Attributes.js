import React, { useEffect } from 'react'
import './style.css'

export default function Attribute({typeList, sub_categories, category, updateSubCategory, updateType}) {

    useEffect(() => {
        console.log("typeList: ", typeList)
    }, [])
  return (
    <>
        <div className="product-attribute">
            <h6 style={{color: '#727272'}}>Attributes</h6>

            <div className='attribute-input-cnt'>

                <div className="input-cnt">
                    <label htmlFor="">Sub category</label>
                   <select name="" id="" onChange={e => updateSubCategory(e.target.value)} style={{textTransform: "capitalize"}}>
                    <option value="">Select product sub category</option>
                        {
                            sub_categories.map((category, index) => (
                            <option  style={{textTransform: "capitalize"}} key={index} value={category}>{category}</option>
                            ))
                        }
                   </select>
                    <div className="err-mssg"></div>
                </div>
               
                {
                    category === "fashion" &&
                    <div className="input-cnt">
                        <label htmlFor="">Type</label>
                    <select name="" id="" onChange={e => updateType(e.target.value)}  style={{textTransform: "capitalize"}}>
                        <option value="">Select product type</option>
                            {
                                typeList.map((category, index) => (
                                <option key={index} value={category}  style={{textTransform: "capitalize"}}>{category}</option>
                                ))
                            }
                    </select>
                        <div className="err-mssg"></div>
                    </div>
                }

                
            </div>

            {/* <hr style={{width: '95%', margin: '0 auto'}} /> */}

        </div>
    </>
  )
}
