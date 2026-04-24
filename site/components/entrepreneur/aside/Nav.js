"use client";

import { useRouter, usePathname } from "next/navigation";
import homeSvg from "../../../svgs/home-1-svgrepo-com.svg";
import ordersSvg from "../../../svgs/product-service-campaign-item-svgrepo-com.svg";
import productsSvg from "../../../svgs/prices-svgrepo-com.svg";
import inventorySvg from "../../../svgs/inventory-logistics-warehouse-svgrepo-com.svg";
import transactionSvg from "../../../svgs/transaction-minus-svgrepo-com.svg";
// import moreSvg from "../../../svgs/products-svgrepo-com.svg";
import dispute_svg from "../../../svgs/domestic-dispute-svgrepo-com.svg";

import "./assets/s.css";

function normalizePath(p) {
  const raw = (p || "").split("?")[0];
  if (raw === "/" || raw === "") return "/";
  return raw.replace(/\/+$/, "") || "/";
}

function isNavItemActive(pathname, itemUrl) {
  const path = normalizePath(pathname);
  const base = normalizePath(itemUrl);
  if (base === "/entrepreneur") {
    return path === "/entrepreneur";
  }
  return path === base || path.startsWith(`${base}/`);
}

const NAV_LINKS = [
  { url: "/entrepreneur/", title: "Home", svg: homeSvg },
  { url: "/entrepreneur/orders", title: "Orders", svg: ordersSvg },
  { url: "/entrepreneur/product", title: "Products", svg: productsSvg },
  { url: "/entrepreneur/inventory", title: "Inventory", svg: inventorySvg },
  { url: "/entrepreneur/transaction", title: "Transaction", svg: transactionSvg },
  { url: "/entrepreneur/disputes", title: "Disputes", svg: dispute_svg },
];

function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ul className="entrepreneur-bottom-nav" style={{ margin: "0px", padding: "10px 0px" }}>
      {NAV_LINKS.map(({ title, svg, url }) => {
        const active = isNavItemActive(pathname, url);
        return (
        <li key={title} className={active ? "nav-item-active" : undefined}>
          <button
            type="button"
            onClick={() => router.push(url)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "inherit",
              cursor: "pointer",
              fontWeight: active ? 700 : 500,
            }}
            aria-current={active ? "page" : undefined}
          >
            <span>
              <img
                src={svg.src}
                alt={title}
                width={20}
                height={20}
                style={{ width: 20, height: 20, display: "block" }}
              />
            </span>
            <span>{title}</span>
          </button>
        </li>
        );
      })}
    </ul>
  );
}

export default Nav;
