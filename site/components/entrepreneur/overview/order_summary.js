import { useReactTable } from '@tanstack/react-table'
import React from 'react'

export default function OrderSummary() {

    const table = useReactTable({

    })
  return (
    <>
      <div className="order_summary_cnt">
        <div className="order_summary_head">
            <span className='order_summary_title'><h6>Recent orders</h6></span>
            <span className='order_summary_btn'>
                <button>View all</button>
            </span>
        </div>
        <div className="order_summary_table">

        </div>
      </div>
    </>
  )
}
