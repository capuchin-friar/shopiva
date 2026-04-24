"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

function formatAmount(n) {
  const num = Number(n)
  if (Number.isNaN(num)) return "—"
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(num)
}

function jsAgo(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

export default function OrderSummary({ orders = [], loading = false }) {
  const router = useRouter()
  const rows = Array.isArray(orders) ? orders.slice(0, 8) : []

  return (
    <div className="order_summary_cnt">
      <div className="order_summary_head">
        <span className="order_summary_title">
          <h6>Recent orders</h6>
        </span>
        <span className="order_summary_btn">
          <button type="button" onClick={() => router.push("/entrepreneur/orders")}>
            View all
          </button>
        </span>
      </div>
      <div className="order_summary_table">
        <table className="order_summary_grid">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="order_summary_empty">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="order_summary_empty">
                  No orders yet.{" "}
                  <Link href="/entrepreneur/orders" className="order_summary_inline_link">
                    Open orders
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((o, idx) => {
                const id = o?.order_id ?? o?.id
                const href = id != null && String(id) !== "" ? `/entrepreneur/orders/${id}` : "/entrepreneur/orders"
                return (
                  <tr key={id != null && String(id) !== "" ? String(id) : `order-row-${idx}`}>
                    <td>
                      <Link href={href} className="order_summary_order_link">
                        #{id ?? "—"}
                      </Link>
                    </td>
                    <td>{o?.customer ?? "—"}</td>
                    <td>{formatAmount(o?.amount)}</td>
                    <td>
                      <span className="order_summary_status">{o?.status ?? "—"}</span>
                    </td>
                    <td className="order_summary_muted">{jsAgo(o?.date)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
