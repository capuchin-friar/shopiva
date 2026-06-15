"use client";

import { useState } from "react";
import Aside from "../components/Aside/Aside";
import Home from "../components/Home/Home";
import Users from "../components/Users/Users";
import "./styles/style.css";
export default function Dashboard() {
  const [activePage, setActivePage] = useState("Home");

  const pageComponents = {
    Home: <Home />,
    Users: <Users />,
    Products: <PlaceholderPage title="Products" />,
    Inventory: <PlaceholderPage title="Inventory" />,
    Shops: <PlaceholderPage title="Shops" />,
    Orders: <PlaceholderPage title="Orders" />,
    Returns: <PlaceholderPage title="Returns" />,
    Disputes: <PlaceholderPage title="Disputes" />,
    Cart: <PlaceholderPage title="Cart" />,
    Transactions: <PlaceholderPage title="Transactions" />
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

function PlaceholderPage({ title }) {
  return (
    <section className="page-placeholder">
      <div className="placeholder-card">
        <h1>{title}</h1>
        <p>This section is not yet implemented. You can select a different menu item.</p>
      </div>
    </section>
  );
}
