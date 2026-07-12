import React, { useEffect, useState } from 'react'
import './style.css'

export default function Home() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/home')
        const json = await res.json()
        if (mounted && json.metrics) setMetrics(json.metrics)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMetrics()
    return () => { mounted = false }
  }, [])

  return (
    <section className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of users, products, orders, and store performance.</p>
        </div>
        <div className="dashboard-actions">
          <button type="button">Add Product</button>
          <button type="button">View Reports</button>
        </div>
      </div>

      <div className="metric-grid">
        {metrics ? (
          [
            { label: 'Total Users', value: metrics.totalUsers },
            { label: 'Active Users', value: metrics.activeUsers },
            { label: 'Admin Users', value: metrics.adminUsers },
          ].map((m) => (
            <article key={m.label} className="metric-card">
              <span>{m.label}</span>
              <strong>{m.value}</strong>
            </article>
          ))
        ) : (
          <div>Loading metrics…</div>
        )}
      </div>

      <div className="summary-panels">
        <section className="panel panel-summary">
          <h2>Store Summary</h2>
          <p>Everything is running smoothly. Review the latest store activity and inventory status.</p>
          <ul>
            <li>Active stores: 18</li>
            <li>Pending approvals: 4</li>
            <li>Unresolved disputes: 2</li>
          </ul>
        </section>

        <section className="panel panel-recent">
          <h2>Recent Activity</h2>
          <ul>
            <li>
              <strong>New order received</strong>
              <span>Order #1247 from Aiden</span>
              <small>2 mins ago</small>
            </li>
            <li>
              <strong>Product stock low</strong>
              <span>Shampoo - 8 units left</span>
              <small>35 mins ago</small>
            </li>
            <li>
              <strong>Return requested</strong>
              <span>Order #1239 from Chloe</span>
              <small>1 hr ago</small>
            </li>
          </ul>
        </section>
      </div>
    </section>
  )
}
