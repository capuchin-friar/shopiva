"use client"

import React from 'react'
import "./style.css";

export default function Aside({ activePage, onSelect }) {
    const list = [
        { label: "Home", svg: "", url: "" },
        { label: "Users", svg: "", url: "" },
        { label: "Products", svg: "", url: "" },
        { label: "Inventory", svg: "", url: "" },
        { label: "Shops", svg: "", url: "" },
        { label: "Orders", svg: "", url: "" },
        { label: "Returns", svg: "", url: "" },
        { label: "Disputes", svg: "", url: "" },
        { label: "Cart", svg: "", url: "" },
        { label: "Transactions", svg: "", url: "" }
    ];

    return (
        <aside className="aside-nav">
            <ul>
                {list.map((menu) => (
                    <li key={menu.label} className={activePage === menu.label ? 'active' : ''}>
                        <button
                            type="button"
                            className="aside-link"
                            onClick={() => onSelect(menu.label)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    onSelect(menu.label)
                                }
                            }}
                        >
                            <span className="aside-icon">{menu.svg || menu.label.charAt(0)}</span>
                            <span>{menu.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    )
}
