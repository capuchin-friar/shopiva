"use client"
import React, { useState } from 'react'
import SummaryCard from "../../../components/entrepreneur/overview/summary_card"
import OrderSummary from "../../../components/entrepreneur/overview/order_summary"
import ProductSummary from "../../../components/entrepreneur/overview/product_summary"
import "./styles/xxl.css"
export default function Overview() {
  const [summary, set_summary] = useState([
    {
      title: "Total Revenue",
      icon: "",
      value: " ₦98,000",
      comment: "12.5% this-month"
    },
    {
      title: "Total Orders",
      icon: "",
      value: "67",
      comment: "0% change"
    },
    {
      title: "New Customers",
      icon: "",
      value: "30",
      comment: "3.1% increase"
    },
    {
      title: "Low Inventory Alert",
      icon: "",
      value: "8",
      comment: "critical: 3"
    },
  ]);


  return (
    <>
      <div className="overview_cnt">
        <div className='overview_head'>
          <span>
            <h5>Sales Performance Overview</h5>
          </span>
          <span className='add_btn'>
            <button onClick={e => window.location.href = "/entrepreneur/product/create-product"}>
              + Add Product
            </button>
          </span>
        </div>
        <div className="overview_summary_cnt">
          {
            summary.map((item, index) => <SummaryCard summary_icon={item.icon} summary_title={item.title} summary_value={item.value} summary_comment={item.comment} />)
          }
        </div>

        <div className="overview_management">
          <OrderSummary />

          <ProductSummary data={[]} />
        </div>
      </div>
    </>
  )
}
