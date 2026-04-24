"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from "react-redux"
import {
  getProducts,
  getShopsByOwner,
  getInventoryByShop,
  getOrdersByShop,
} from "../../lib/productApi"
import SummaryCard from "../../components/entrepreneur/overview/summary_card"
import OrderSummary from "../../components/entrepreneur/overview/order_summary"
import ProductSummary from "../../components/entrepreneur/overview/product_summary"
import "./styles/xxl.css"
import "./styles/s.css"

function toNum(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(toNum(value))
}

export default function Overview() {
  const entrepreneurId = useSelector((s) => s.entrepreneur_id?.entrepreneur_id)
  const selectedShop = useSelector((s) => s.entrepreneur_shop?.shop)

  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    lowInventoryAlert: 0,
    topProducts: [],
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!entrepreneurId) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const shopsRes = await getShopsByOwner(entrepreneurId)
        if (cancelled) return
        const shops = Array.isArray(shopsRes?.shops) ? shopsRes.shops : []
        const preferredShopId = selectedShop?.id ?? selectedShop?.shop_id
        const activeShop =
          (preferredShopId != null &&
            shops.find((s) => String(s?.id ?? s?.shop_id) === String(preferredShopId))) ||
          shops[0]

        const shopId = activeShop?.id ?? activeShop?.shop_id
        if (!shopId) {
          setSummaryData({
            totalRevenue: 0,
            totalOrders: 0,
            newCustomers: 0,
            lowInventoryAlert: 0,
            topProducts: [],
          })
          setRecentOrders([])
          return
        }

        const [productsRes, inventoryRes, dashboardRes] = await Promise.all([
          getProducts(shopId, entrepreneurId),
          getInventoryByShop(shopId, entrepreneurId).catch(() => ({ inventory: [] })),
          fetch(`/api/shop/dashboard/${shopId}`, { credentials: "include" }).catch(() => null),
        ])
        if (cancelled) return

        const products = Array.isArray(productsRes?.products) ? productsRes.products : []
        const inventory = Array.isArray(inventoryRes?.inventory) ? inventoryRes.inventory : []

        const priceByProduct = new Map()
        for (const row of inventory) {
          const pid = row?.product_id ?? row?.productId
          if (pid == null) continue
          const pr = Number(row?.price)
          if (!Number.isFinite(pr)) continue
          const key = Number(pid)
          const prev = priceByProduct.get(key)
          if (prev == null || pr < prev) priceByProduct.set(key, pr)
        }

        let dash = {}
        if (dashboardRes?.ok) {
          dash = await dashboardRes.json().catch(() => ({}))
        }

        let totalRevenue = toNum(dash.ordersRevenue)
        let totalOrders = toNum(dash.ordersCount)
        let newCustomers = toNum(dash.newCustomersCount)
        let lowInventoryAlert = toNum(dash.lowInventoryCount)
        let recent = Array.isArray(dash.recentOrders) ? dash.recentOrders : []

        if (!dashboardRes?.ok) {
          try {
            const { orders } = await getOrdersByShop(shopId, entrepreneurId)
            const list = Array.isArray(orders) ? orders : []
            totalOrders = list.length
            totalRevenue = list.reduce((sum, o) => sum + toNum(o?.amount), 0)
            const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
            const seen = new Set()
            for (const o of list) {
              const rawDate = o?.date ?? o?.created_at ?? o?.createdAt
              const t = rawDate ? new Date(String(rawDate)).getTime() : NaN
              if (!Number.isFinite(t) || t < cutoff) continue
              const cid = o?.customer_id ?? o?.customerId
              if (cid != null && String(cid).trim() !== "") seen.add(String(cid))
            }
            newCustomers = seen.size
            const orderTime = (o) => {
              const raw = o?.date ?? o?.created_at ?? o?.createdAt
              const t = raw ? new Date(String(raw)).getTime() : 0
              return Number.isFinite(t) ? t : 0
            }
            recent = [...list]
              .sort((a, b) => orderTime(b) - orderTime(a))
              .slice(0, 10)
              .map((o) => ({
                order_id: o?.order_id ?? o?.id,
                customer: o?.customer ?? "—",
                amount: o?.amount,
                status: o?.status ?? "—",
                date: o?.date ?? o?.created_at ?? o?.createdAt ?? null,
              }))
          } catch {
            /* keep zeros */
          }
          lowInventoryAlert = inventory.filter((row) => {
            const q = toNum(row?.quantity_available ?? row?.quantityAvailable)
            const th = toNum(row?.low_stock_threshold ?? row?.lowStockThreshold)
            if (th > 0) return q <= th
            return q <= 0
          }).length
        }

        const sortedProducts = [...products].sort((a, b) => {
          const ta = new Date(a?.updated_at ?? a?.updatedAt ?? 0).getTime()
          const tb = new Date(b?.updated_at ?? b?.updatedAt ?? 0).getTime()
          return tb - ta
        })

        const topProducts = sortedProducts.slice(0, 4).map((p) => {
          let thumb = ""
          const images = p?.images
          if (Array.isArray(images) && typeof images[0] === "string") {
            thumb = images[0]
          }
          const fromPrice = p?.id != null ? priceByProduct.get(Number(p.id)) : null
          return {
            title: p?.name ?? "Untitled product",
            stock: `Status: ${p?.status ?? "draft"}`,
            price: fromPrice != null ? formatNaira(fromPrice) : "—",
            thumbnail: thumb || "/images/img2.jpg",
          }
        })

        setSummaryData({
          totalRevenue,
          totalOrders,
          newCustomers,
          lowInventoryAlert,
          topProducts,
        })
        setRecentOrders(recent)
      } catch {
        if (!cancelled) {
          setSummaryData({
            totalRevenue: 0,
            totalOrders: 0,
            newCustomers: 0,
            lowInventoryAlert: 0,
            topProducts: [],
          })
          setRecentOrders([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [entrepreneurId, selectedShop?.id, selectedShop?.shop_id])

  const summary = useMemo(
    () => [
      {
        title: "Total Revenue",
        icon: "",
        value: formatNaira(summaryData.totalRevenue),
        comment: "Orders sum",
      },
      {
        title: "Total Orders",
        icon: "",
        value: String(summaryData.totalOrders),
        comment: "Order count (shop)",
      },
      {
        title: "New Customers",
        icon: "",
        value: String(summaryData.newCustomers),
        comment: "Distinct buyers (last 30 days)",
      },
      {
        title: "Low Inventory Alert",
        icon: "",
        value: String(summaryData.lowInventoryAlert),
        comment: "SKUs at or below threshold",
      },
    ],
    [summaryData]
  )


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
          {loading ? <small>Loading dashboard...</small> : null}
          {
            summary.map((item, index) => <SummaryCard key={index} summary_icon={item.icon} summary_title={item.title} summary_value={item.value} summary_comment={item.comment} />)
          }
        </div>

        <div className="overview_management">
          <OrderSummary orders={recentOrders} loading={loading} />

          {/* <ProductSummary data={summaryData.topProducts} /> */}
        </div>
      </div>
    </>
  )
}
