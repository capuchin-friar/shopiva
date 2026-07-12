"use client";

import { useState, useEffect } from "react";
import Aside from "../components/Aside/Aside";
import Home from "../components/Home/Home";
import Users from "../components/Users/Users";
import "./styles/style.css";

const pages = {
  Products: {
    title: "Products",
    description: "Review product catalog, shop pairing, and publish status.",
    endpoint: "products",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "name", header: "Name" },
      { accessor: "shopId", header: "Shop ID" },
      { accessor: "status", header: "Status" },
      { accessor: "isPublished", header: "Published" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
  Inventory: {
    title: "Inventory",
    description: "Track stock levels and inventory status across products.",
    endpoint: "inventory",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "sku", header: "SKU" },
      { accessor: "productId", header: "Product ID" },
      { accessor: "quantity", header: "Quantity" },
      { accessor: "reservedQuantity", header: "Reserved" },
      { accessor: "price", header: "Price" },
      { accessor: "trackInventory", header: "Track" },
      { accessor: "updatedAt", header: "Updated" },
    ],
  },
  Shops: {
    title: "Shops",
    description: "Manage storefronts, approval status, and shop performance.",
    endpoint: "shops",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "name", header: "Name" },
      { accessor: "ownerId", header: "Owner" },
      { accessor: "status", header: "Status" },
      { accessor: "isActive", header: "Active" },
      { accessor: "category", header: "Category" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
  "Shop KYC": {
    title: "Shop KYC",
    description: "Review shop verification details and uploaded KYC documents.",
    endpoint: "shop-kyc",
    filters: [
      {
        name: "isVerified",
        label: "Verified",
        type: "select",
        options: ["All", "true", "false"],
      },
      {
        name: "query",
        label: "Search",
        type: "text",
        placeholder: "Search by shop name or owner email/phone",
      },
    ],
    columns: [
      { accessor: "id", header: "Shop ID" },
      { accessor: "name", header: "Shop" },
      { accessor: "ownerName", header: "Owner Name" },
      { accessor: "ownerEmail", header: "Owner Email" },
      { accessor: "ownerPhone", header: "Owner Phone" },
      { accessor: "isVerified", header: "Verified" },
      { accessor: "businessLicenseVerified", header: "Business License Verified" },
      { accessor: "businessLicenseUrl", header: "Business License File", render: (row) => (row.businessLicenseUrl ? <a href={row.businessLicenseUrl} target="_blank" rel="noreferrer">View</a> : 'None') },
      { accessor: "taxIdVerified", header: "Tax ID Verified" },
      { accessor: "taxIdUrl", header: "Tax ID File", render: (row) => (row.taxIdUrl ? <a href={row.taxIdUrl} target="_blank" rel="noreferrer">View</a> : 'None') },
      { accessor: "identityProofVerified", header: "ID Proof Verified" },
      { accessor: "identityProofUrl", header: "ID Proof File", render: (row) => (row.identityProofUrl ? <a href={row.identityProofUrl} target="_blank" rel="noreferrer">View</a> : 'None') },
      { accessor: "createdAt", header: "Created" },
    ],
    rowActions: (row) => [
      {
        label: "Review KYC",
        handler: () => {
          window.location.href = `/shop-kyc/${row.id}`;
        },
      },
    ],
  },
  Orders: {
    title: "Orders",
    description: "Monitor recent orders, payment status, and fulfillment flow.",
    endpoint: "orders",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "orderId", header: "Order Ref" },
      { accessor: "customerId", header: "Customer" },
      { accessor: "shopId", header: "Shop" },
      { accessor: "totalPaid", header: "Total" },
      { accessor: "paymentStatus", header: "Payment" },
      { accessor: "fulfillmentStatus", header: "Fulfillment" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
  Returns: {
    title: "Returns",
    description: "Review return requests and shipment status.",
    endpoint: "returns",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "orderId", header: "Order Ref" },
      { accessor: "customerId", header: "Customer" },
      { accessor: "shopId", header: "Shop" },
      { accessor: "status", header: "Status" },
      { accessor: "estimatedDeliveryDate", header: "ETA" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
  Disputes: {
    title: "Disputes",
    description: "Track dispute cases, filter by status, and contact the customer or vendor.",
    endpoint: "disputes",
    filters: [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["All", "open", "escalated", "closed", "resolved", "pending"],
      },
      {
        name: "source",
        label: "Source",
        type: "select",
        options: ["All", "customer", "vendor"],
      },
      {
        name: "query",
        label: "Search",
        type: "text",
        placeholder: "Search by dispute ref, customer, or order",
      },
    ],
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "disputeRef", header: "Ref" },
      { accessor: "customerId", header: "Customer" },
      { accessor: "orderId", header: "Order" },
      { accessor: "status", header: "Status" },
      { accessor: "source", header: "Source" },
      { accessor: "createdAt", header: "Created" },
    ],
    rowActions: (row) => [
      {
        label: "Customer phone",
        handler: () => {
          const phone = row.customerPhone;
          if (!phone) {
            window.alert('Customer phone number not available');
            return;
          }
          window.alert(`Customer phone: ${phone}`);
        },
      },
      {
        label: "Vendor phone",
        handler: () => {
          const phone = row.vendorPhone;
          if (!phone) {
            window.alert('Vendor phone number not available');
            return;
          }
          window.alert(`Vendor phone: ${phone}`);
        },
      },
    ],
  },
  Cart: {
    title: "Cart Items",
    description: "View active cart items and quantity reservations.",
    endpoint: "cart",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "userId", header: "User" },
      { accessor: "inventoryId", header: "Inventory" },
      { accessor: "quantity", header: "Quantity" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
  Transactions: {
    title: "Transactions",
    description: "Audit payment events and transaction status from Paystack.",
    endpoint: "transactions",
    columns: [
      { accessor: "id", header: "ID" },
      { accessor: "reference", header: "Reference" },
      { accessor: "event", header: "Event" },
      { accessor: "amount", header: "Amount" },
      { accessor: "currency", header: "Currency" },
      { accessor: "status", header: "Status" },
      { accessor: "customerEmail", header: "Customer" },
      { accessor: "createdAt", header: "Created" },
    ],
  },
};

export default function Dashboard() {
  const [activePage, setActivePage] = useState("Home");

  const pageComponents = {
    Home: <Home />,
    Users: <Users />,
    Products: <ResourcePage {...pages.Products} />,
    Inventory: <ResourcePage {...pages.Inventory} />,
    Shops: <ResourcePage {...pages.Shops} />,
    Orders: <ResourcePage {...pages.Orders} />,
    Returns: <ResourcePage {...pages.Returns} />,
    Disputes: <ResourcePage {...pages.Disputes} />,
    "Shop KYC": <ResourcePage {...pages['Shop KYC']} />,
    Cart: <ResourcePage {...pages.Cart} />,
    Transactions: <ResourcePage {...pages.Transactions} />,
  };

  return (
    <div className="shadow-sm admin-shell">
      <header>
        <h4>Admin</h4>
        <span className="active-page-label">{activePage}</span>
      </header>
      <main className="shadow-sm">
        <div className="aside-cnt">
          <Aside activePage={activePage} onSelect={setActivePage} />
        </div>
        <div className="content-cnt">{pageComponents[activePage]}</div>
      </main>
    </div>
  );
}

function ResourcePage({ title, description, endpoint, columns, filters, rowActions }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState(
    filters?.reduce((acc, filter) => {
      acc[filter.name] = filter.type === 'select' ? 'All' : '';
      return acc;
    }, {}) ?? {},
  );

  useEffect(() => {
    let mounted = true;

    const fetchRows = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (filters) {
          filters.forEach((filter) => {
            const value = filterValues[filter.name];
            if (typeof value === 'string' && value.length > 0 && value !== 'All') {
              searchParams.set(filter.name, value);
            }
          });
        }

        const url = `/api/${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!mounted) return;
        if (!res.ok) {
          throw new Error(json?.error || 'Failed to load resource');
        }

        setRows(json[endpoint] ?? []);
      } catch (err) {
        if (!mounted) return;
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRows();
    const intervalId = setInterval(fetchRows, 20000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [endpoint, filters, filterValues]);

  return (
    <section className="resource-page">
      <div className="resource-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="resource-summary">
          <strong>{loading ? 'Loading...' : `${rows.length} records`}</strong>
        </div>
      </div>

      {filters && (
        <div className="resource-filters">
          {filters.map((filter) => (
            <div className="resource-filter" key={filter.name}>
              <label htmlFor={`filter-${filter.name}`}>{filter.label}</label>
              {filter.type === 'select' ? (
                <select
                  id={`filter-${filter.name}`}
                  value={filterValues[filter.name] ?? ''}
                  onChange={(event) =>
                    setFilterValues((prev) => ({ ...prev, [filter.name]: event.target.value }))
                  }
                >
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`filter-${filter.name}`}
                  type="text"
                  placeholder={filter.placeholder}
                  value={filterValues[filter.name] ?? ''}
                  onChange={(event) =>
                    setFilterValues((prev) => ({ ...prev, [filter.name]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="resource-alert">{error}</div>}

      <div className="resource-table-card">
        <table className="resource-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.accessor}>{column.header}</th>
              ))}
              {rowActions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id ?? JSON.stringify(row)}>
                {columns.map((column) => (
                  <td key={column.accessor}>
                    {column.render ? column.render(row) : String(row[column.accessor] ?? '')}
                  </td>
                ))}
                {rowActions ? (
                  <td className="action-cell">
                    {rowActions(row).map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        className="resource-action-button"
                        onClick={action.handler}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                ) : null}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="empty-row">
                  No records available for {title.toLowerCase()}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
