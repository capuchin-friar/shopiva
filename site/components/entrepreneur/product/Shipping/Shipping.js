'use client'

import React, { useState, useCallback, useEffect } from 'react'
import './style.css'

const locale = typeof navigator !== 'undefined' ? navigator.language : 'en'
const numberFormat = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
})

function parseLocaleNumber(str) {
  if (str === '' || str == null) return null
  const normalized = String(str).trim().replace(/\s/g, '')
  const decimal = new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === 'decimal')?.value || '.'
  const group = new Intl.NumberFormat(locale).formatToParts(1000).find(p => p.type === 'group')?.value || ','
  const cleaned = normalized.replace(new RegExp(`\\${group}`, 'g'), '').replace(decimal, '.')
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : num
}

function formatNumber(value) {
  if (value === null || value === '' || value === undefined) return ''
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isNaN(n) ? '' : numberFormat.format(n)
}

export default function Shipping({updateShipping}) {
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [fragile, setFragile] = useState('')
  const [weightFocused, setWeightFocused] = useState(false)
  const [dimFocused, setDimFocused] = useState({ length: false, width: false, height: false })

  useEffect(() => {
    updateShipping(
      {weight,length,width,height,fragile}
    )
  }, [weight,length,width])

  const handleWeightChange = useCallback((e) => {
    const v = e.target.value
    if (v === '' || /^[\d.,\s]*$/.test(v)) setWeight(v)
  }, [])
  const handleWeightBlur = useCallback(() => {
    setWeightFocused(false)
    const n = parseLocaleNumber(weight)
    setWeight(n != null ? formatNumber(n) : '')
  }, [weight])

  const handleDimChange = useCallback((field) => (e) => {
    const v = e.target.value
    if (v === '' || /^[\d.,\s]*$/.test(v)) {
      if (field === 'length') setLength(v)
      else if (field === 'width') setWidth(v)
      else setHeight(v)
    }
  }, [])
  const handleDimBlur = useCallback((field) => () => {
    setDimFocused((prev) => ({ ...prev, [field]: false }))
    const getter = field === 'length' ? length : field === 'width' ? width : height
    const n = parseLocaleNumber(getter)
    const formatted = n != null ? formatNumber(n) : ''
    if (field === 'length') setLength(formatted)
    else if (field === 'width') setWidth(formatted)
    else setHeight(formatted)
  }, [length, width, height])

  const weightValue = weightFocused ? weight : (weight === '' ? '' : formatNumber(parseLocaleNumber(weight) ?? weight))

  return (
    <>
        <div className="product-shipping">
            <h6 style={{color: '#727272'}}>Shipping (Optional)</h6>

            <hr />

            <div className='shipping-input-cnt' style={{flexDirection: 'column'}}>
                <div className="input-cnt" style={{alignItems: 'center'}}>
                    <input style={{width: '15px', height: '15px', border: '1px solid #727272'}} checked={fragile} onChange={e => setFragile(e.target.checked)} type='checkbox' name="" id=""  />
                    &nbsp;
                    <label style={{margin: '-8px 0 0 0', height: '15px'}} htmlFor=""><small>Fragile (Is this product fragile.)</small></label>
                </div>

                <br />

                <div className="input-cnt" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                    <label style={{color: '#727272'}} htmlFor="shipping-weight"><small>Weight</small></label>
                    <div className="input-with-suffix">
                        <input
                            id="shipping-weight"
                            placeholder="0"
                            type="text"
                            inputMode="decimal"
                            value={weightValue}
                            onChange={handleWeightChange}
                            onFocus={() => setWeightFocused(true)}
                            onBlur={handleWeightBlur}
                            aria-describedby="weight-suffix"
                        />
                        <span id="weight-suffix" className="input-suffix" aria-hidden="true">kg</span>
                    </div>
                </div>

            </div>

            <br />

            <div style={{width: "100%"}}>
                <label htmlFor="" style={{color: '#727272'}}><small>Dimension (Optional)</small></label>
                <div className="input-cnt" style={{display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: "100%"}}>
                    <span className="dimension-field" style={{width: "25%"}}>
                        <label htmlFor="shipping-length" style={{color: '#727272'}}><small>Length</small></label>
                        <div className="input-with-suffix">
                            <input
                                id="shipping-length"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={dimFocused.length ? length : (length === '' ? '' : formatNumber(parseLocaleNumber(length) ?? length))}
                                onChange={handleDimChange('length')}
                                onFocus={() => setDimFocused((p) => ({ ...p, length: true }))}
                                onBlur={handleDimBlur('length')}
                                aria-describedby="length-suffix"
                            />
                            <span id="length-suffix" className="input-suffix">cm</span>
                        </div>
                    </span>
                    <span className="dimension-field" style={{width: "25%"}}>
                        <label htmlFor="shipping-width" style={{color: '#727272'}}><small>Width</small></label>
                        <div className="input-with-suffix">
                            <input
                                id="shipping-width"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={dimFocused.width ? width : (width === '' ? '' : formatNumber(parseLocaleNumber(width) ?? width))}
                                onChange={handleDimChange('width')}
                                onFocus={() => setDimFocused((p) => ({ ...p, width: true }))}
                                onBlur={handleDimBlur('width')}
                                aria-describedby="width-suffix"
                            />
                            <span id="width-suffix" className="input-suffix">cm</span>
                        </div>
                    </span>
                    <span className="dimension-field" style={{width: "25%"}}>
                        <label htmlFor="shipping-height" style={{color: '#727272'}}><small>Height</small></label>
                        <div className="input-with-suffix">
                            <input
                                id="shipping-height"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={dimFocused.height ? height : (height === '' ? '' : formatNumber(parseLocaleNumber(height) ?? height))}
                                onChange={handleDimChange('height')}
                                onFocus={() => setDimFocused((p) => ({ ...p, height: true }))}
                                onBlur={handleDimBlur('height')}
                                aria-describedby="height-suffix"
                            />
                            <span id="height-suffix" className="input-suffix">cm</span>
                        </div>
                    </span>
                </div>
                <div className="err-mssg"></div>
            </div>
        </div>
      
    </>
  )
}
