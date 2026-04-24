import React from 'react'

export default function ProductSummary({data}) {
  return (
    <>
        <div className="product_summary_cnt">
            <div className="product_summary_head">
                <h6>Top products</h6>
            </div>
            <div className="product_summary_list">
                {
                    data.map((product, ind) => <ProductCard key={ind} index={ind} product_price={product.price} product_thumbnail={product.thumbnail} product_title={product.title} product_stock={product.stock} />)
                }
            </div>
        </div>
    </>
  )
}



function ProductCard({product_thumbnail, product_title, product_stock, product_price, ind}) {
  return (
    <>
        <div className="product_card" key={ind}>
            <div className="product_card_left">
                <img src={product_thumbnail} alt="" />
            </div>
            <div className="product_card_right">
                <span className='product_card_title_cnt'>
                    <h4>{product_title}</h4>
                    <h6>{product_stock}</h6>
                </span>
                <span className='product_card_price_cnt'>
                    <h4>{product_price}</h4>
                </span>
            </div>
        </div>
    </>
  )
}
