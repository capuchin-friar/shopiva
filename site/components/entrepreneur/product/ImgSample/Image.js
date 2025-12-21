import React from 'react'
import './style.css'
export default function Image({
    imgList,
    updateImgList
}) {
  return (
    <>
        <div className="product-img-sample">
            <div className="input-cnt">
                <label htmlFor="">Media</label>
                
                {
                    imgList?.length > 0
                    ?
                        <></>
                    :
                        <>
                            <div className='empty-media-cnt'>
                                <div style={{margin: '0', height: 'auto', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <span style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <button style={{color: '#fff', background: '#000', padding: '5px', height: 'auto', fontSize: 'x-small', borderRadius: '5px'}}><b>Upload new</b></button>
                                        &nbsp;
                                        &nbsp;
                                        &nbsp;
                                        <small style={{fontWeight: '500', color: '#727272'}}>Select existing</small>
                                    </span>
                                </div>

                                <div style={{margin: '0', height: 'auto', textAlign: 'center'}}>
                                    <span><small style={{fontWeight: '500', color: '#727272'}}>Accepts video, and Images</small></span>
                                </div>
                            </div> 
                        </>
                }
            </div>
        </div>
    </>
  )
}
