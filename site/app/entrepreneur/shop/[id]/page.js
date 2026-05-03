"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deviceLocationErrorMessage,
  requestDeviceGeolocationCoordinates,
  resolveVendorLocationFromCoords,
} from "../../../../reusables/vendorDeviceLocation";
import Link from "next/link";
import { useParams } from "next/navigation";
import "./styles/global.css";
import "./styles/s.css";
import "./styles/xxl.css";
import axios from "axios";
import AddBtn from "../../../../reusables/AddBtn"
import EditBtn from "../../../../reusables/EditBtn"
import { humanizeCategoryKey } from "../../../../reusables/getCategoryOptions";
import { useSelector } from "react-redux";
import { getOrdersByShop, getProducts } from "../../../../lib/productApi";

function shopProp(obj, ...keys) {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}

function parseVerificationDocs(dShop) {
  const raw = shopProp(dShop, "verificationDocuments", "verificationdocuments");
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw;
  return {};
}

const VERIFICATION_ITEMS = [
  {
    label: "ID Card",
    mode: "verificationUpload",
    key: "idCard",
    helpText: "Government-issued ID (JPEG, PNG, or PDF).",
  },
  {
    label: "Address",
    mode: "verificationUpload",
    key: "proofOfAddress",
    helpText: "Utility bill or bank statement as proof of address.",
  },
  { label: "BVN", mode: "bvn", key: null, helpText: null },
  {
    label: "CAC",
    mode: "verificationUpload",
    key: "cacDocument",
    helpText: "CAC certificate or business registration (JPEG, PNG, or PDF).",
  },
];

function hasVerificationData(item, verDocs) {
  if (!item || !verDocs) return false;
  if (item.mode === "bvn") {
    const bvn = verDocs?.bvn;
    return Boolean(bvn?.last4 || bvn?.verifiedAt || bvn?.submittedAt);
  }
  if (!item.key) return false;
  const doc = verDocs[item.key];
  return Boolean(doc?.url);
}

function verificationStatus(item, verDocs) {
  if (!item || !verDocs) {
    return { label: "Not submitted", color: "#6b7280" };
  }

  if (item.mode === "bvn") {
    const bvn = verDocs?.bvn;
    if (bvn?.verified === true) {
      return { label: "Passed", color: "#00926e" };
    }
    if (bvn?.last4 || bvn?.submittedAt) {
      return { label: "Pending", color: "#b45309" };
    }
    return { label: "Not submitted", color: "#6b7280" };
  }

  const doc = item.key ? verDocs[item.key] : null;
  if (doc?.verified === true) {
    return { label: "Passed", color: "#00926e" };
  }
  if (doc?.url) {
    return { label: "Pending", color: "#b45309" };
  }
  return { label: "Not submitted", color: "#6b7280" };
}

function formatShopStatus(status) {
  if (status == null || status === "") return "—";
  const s = String(status);
  const map = {
    pending_approval: "Pending approval",
    active: "Active",
    suspended: "Suspended",
    closed: "Closed",
  };
  return map[s] || s.replace(/_/g, " ");
}

function formatMoney(amount, currency = "NGN") {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `₦${safe.toFixed(2)}`;
  }
}

function formatDateShort(value) {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function productRowId(p) {
  return p?.id ?? p?.product_id ?? p?.productId;
}

function orderRowId(o) {
  return o?.order_id ?? o?.id ?? o?.orderId;
}

function orderStatusLabel(status) {
  const s = String(status ?? "").trim();
  if (!s) return "—";
  return s.replace(/_/g, " ");
}

function parseLocation(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function parseBusinessAvailability(loc) {
  if (!loc || typeof loc !== "object") return null;
  const raw = loc.businessAvailability ?? loc.businessavailability;
  if (!raw || typeof raw !== "object") return null;

  if (Array.isArray(raw.perDay) && raw.perDay.length > 0) {
    const perDay = raw.perDay
      .filter(
        (e) =>
          e &&
          typeof e.day === "string" &&
          typeof e.startTime === "string" &&
          typeof e.endTime === "string" &&
          e.startTime < e.endTime
      )
      .map((e) => ({
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
      }));
    if (perDay.length === 0) return null;
    perDay.sort(
      (a, b) =>
        BUSINESS_DAY_ORDER.indexOf(a.day) - BUSINESS_DAY_ORDER.indexOf(b.day)
    );
    return { perDay };
  }

  const days = Array.isArray(raw.days)
    ? raw.days.filter((d) => typeof d === "string")
    : [];
  const startTime = typeof raw.startTime === "string" ? raw.startTime : "";
  const endTime = typeof raw.endTime === "string" ? raw.endTime : "";
  if (
    days.length === 0 ||
    !startTime ||
    !endTime ||
    startTime >= endTime
  ) {
    return null;
  }
  const perDay = days
    .map((day) => ({ day, startTime, endTime }))
    .sort(
      (a, b) =>
        BUSINESS_DAY_ORDER.indexOf(a.day) - BUSINESS_DAY_ORDER.indexOf(b.day)
    );
  return { perDay };
}

const BUSINESS_DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const availabilitySummaryTableWrap = {
  fontSize: "14px",
  margin: "10px 0px 0px 0px",
  fontWeight: "500",
  background: "#f9f9f9",
  width: "100%",
  borderRadius: "2.5px",
  padding: "8px 10px",
  maxWidth: "100%",
};

const availabilitySummaryTable = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "inherit",
  fontWeight: "inherit",
};

const availabilitySummaryTh = {
  textAlign: "left",
  padding: "4px 8px 8px 0",
  borderBottom: "1px solid #e0e0e0",
  color: "#555",
  fontWeight: "600",
  fontSize: "12px",
};

const availabilitySummaryTdDay = {
  padding: "6px 12px 6px 0",
  verticalAlign: "top",
  fontWeight: "600",
  whiteSpace: "nowrap",
};

const availabilitySummaryTdTime = {
  padding: "6px 0",
  verticalAlign: "top",
};

function BusinessAvailabilitySummaryTable({ businessAvail, detailLoading }) {
  if (detailLoading) {
    return <div style={availabilitySummaryTableWrap}>…</div>;
  }
  if (!businessAvail?.perDay?.length) {
    return <div style={availabilitySummaryTableWrap}>Not set</div>;
  }
  return (
    <div style={availabilitySummaryTableWrap}>
      <table style={availabilitySummaryTable}>
        <thead>
          <tr>
            <th scope="col" style={availabilitySummaryTh}>
              Day
            </th>
            <th scope="col" style={availabilitySummaryTh}>
              Hours
            </th>
          </tr>
        </thead>
        <tbody>
          {businessAvail.perDay.map((e) => (
            <tr key={`${e.day}-${e.startTime}-${e.endTime}`}>
              <td style={availabilitySummaryTdDay}>{e.day}</td>
              <td style={availabilitySummaryTdTime}>
                {e.startTime}–{e.endTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function locationLines(loc) {
  const o = parseLocation(loc);
  if (!o) return [{ type: "empty" }];
  const lines = [];
  if (o.address) lines.push({ type: "headline", text: o.address });
  const pairs = [
    ["State", o.state],
    ["City", o.city],
    ["Area", o.area],
    ["Street", o.street],
    ["Postal code", o.zipcode ?? o.postal_code],
    ["Country", o.country],
  ];
  pairs.forEach(([label, v]) => {
    if (v) lines.push({ type: "row", label, value: v });
  });
  const coords = o.coordinates;
  if (
    coords != null &&
    Number.isFinite(Number(coords.lat)) &&
    Number.isFinite(Number(coords.lng))
  ) {
    lines.push({
      type: "row",
      label: "Coordinates",
      value: `${Number(coords.lat).toFixed(6)}, ${Number(coords.lng).toFixed(6)}`,
    });
  }
  if (lines.length === 0) return [{ type: "empty" }];
  return lines;
}

function walletTotals(account) {
  if (!account) {
    return { available: 0, pending: 0, currency: "NGN", total: 0 };
  }
  const available = Number(
    account.available_balance ?? account.availablebalance ?? 0
  );
  const pending = Number(
    account.pending_balance ?? account.pendingbalance ?? 0
  );
  const currency = String(account.currency ?? "NGN");
  const a = Number.isFinite(available) ? available : 0;
  const p = Number.isFinite(pending) ? pending : 0;
  return { available: a, pending: p, currency, total: a + p };
}

function policyClausesFromParsed(policyObj) {
  const p =
    policyObj && typeof policyObj === "object" && !Array.isArray(policyObj)
      ? policyObj
      : {};
  let c = p.clauses;
  if (typeof c === "string") {
    try {
      const parsed = JSON.parse(c);
      c = Array.isArray(parsed) ? parsed : [];
    } catch {
      c = [];
    }
  }
  return Array.isArray(c) ? c : [];
}

function policyConfigured(policies, key) {
  if (!policies) return false;
  const parseObj = (v) => {
    if (v == null) return {};
    if (typeof v === "object") return v;
    if (typeof v === "string") {
      try {
        const o = JSON.parse(v);
        return o && typeof o === "object" ? o : {};
      } catch {
        return {};
      }
    }
    return {};
  };

  if (key === "custom") {
    const raw = shopProp(policies, "custompolicies", "customPolicies");
    const c = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(raw);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : [];
    return Array.isArray(c) && c.length > 0;
  }
  if (key === "refund") {
    const raw = shopProp(policies, "refundpolicy", "refundPolicy");
    return policyClausesFromParsed(parseObj(raw)).length > 0;
  }
  if (key === "delivery") {
    const raw = shopProp(policies, "deliverypolicy", "deliveryPolicy");
    return policyClausesFromParsed(parseObj(raw)).length > 0;
  }
  return false;
}

function ShopLocationPicker({
  detailLoading,
  locationObj,
  persistPatch,
  locLines,
}) {
  const [picking, setPicking] = useState(false);
  const [pickErr, setPickErr] = useState("");

  const onUseLocation = useCallback(async () => {
    setPickErr("");
    setPicking(true);
    try {
      const coords = await requestDeviceGeolocationCoordinates();
      const resolved = await resolveVendorLocationFromCoords(
        coords.latitude,
        coords.longitude
      );
      await persistPatch({
        location: {
          ...locationObj,
          address: resolved.address,
          city: resolved.city,
          state: resolved.state,
          country: resolved.country,
          zipcode: resolved.zipcode,
          postal_code: resolved.postal_code ?? resolved.zipcode ?? null,
          area: resolved.area ?? null,
          street: resolved.street ?? null,
          coordinates: resolved.coordinates,
        },
      });
    } catch (err) {
      if (err?.response?.data?.error) {
        setPickErr(String(err.response.data.error));
      } else if (err?.response != null) {
        setPickErr("Could not save shop location. Try again.");
      } else {
        setPickErr(deviceLocationErrorMessage(err));
      }
    } finally {
      setPicking(false);
    }
  }, [locationObj, persistPatch]);

  return (
    <div className="shop-cnt-body-left-shop-address">
      <div className="shop-cnt-body-left-shop-address-head">
        <span>
          <h5>Shop location</h5>
        </span>
        <span>
          <button
            type="button"
            className="shop-location-btn"
            onClick={onUseLocation}
            disabled={detailLoading || picking}
          >
            {picking
              ? "Getting location…"
              : "Use my current location"}
          </button>
        </span>
      </div>
      <p className="shop-hint" style={{ margin: "6px 0 0 0" }}>
        Set where you operate (physical stall, warehouse, or home base). We
        read your device position, then resolve the address from maps data.
        Allow location when the browser asks.
      </p>
      {pickErr ? (
        <span className="shop-err" role="alert" style={{ display: "block", marginTop: 8 }}>
          {pickErr}
        </span>
      ) : null}
      <div className="shop-cnt-body-left-shop-verification-body">
        <small>
          {detailLoading ? (
            <p style={{ margin: 0 }}>…</p>
          ) : (
            locLines.map((line, i) => {
              if (line.type === "empty") {
                return (
                  <p key="empty" style={{ margin: 0 }}>
                    No location on file — use the button above.
                  </p>
                );
              }
              if (line.type === "headline") {
                return <h6 key={`h-${i}`}>{line.text}</h6>;
              }
              return (
                <p key={`r-${i}`} style={{ margin: 0 }}>
                  <strong>{line.label}:</strong> {line.value}
                </p>
              );
            })
          )}
        </small>
      </div>
    </div>
  );
}

/**
 * Shop detail / edit by ID — boilerplate.
 * Route: /entrepreneur/shop/[id]
 */
export default function ShopByIdPage() {
  const {
    entrepreneur_id
  } = useSelector(s => s.entrepreneur_id)
  const params = useParams();
  const shopId = params?.id;

  const [screenWidth, setscreenWidth] = useState(0);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shops, setShops] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const refreshDashboard = useCallback(async () => {
    if (!selectedShopId) return;
    try {
      const { data } = await axios.get(
        `/api/shop/dashboard/${selectedShopId}`,
        { withCredentials: true }
      );
      setDashboard(data);
    } catch {
      /* keep previous dashboard */
    }
  }, [selectedShopId]);

  const persistPatch = useCallback(
    async (patchBody) => {
      if (!selectedShopId) return;
      await axios.patch(`/api/shop/patch/${selectedShopId}`, patchBody, {
        withCredentials: true,
      });
      await refreshDashboard();
    },
    [selectedShopId, refreshDashboard]
  );

  useEffect(() => {
    const read = () => setscreenWidth(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    if (shopId == null || shopId === "") {
      setError("Missing shop ID.");
      setLoading(false);
      return;
    }
    setError(null);
  }, [shopId]);

  useEffect(() => {
    if (shopId == null || shopId === "" || entrepreneur_id == null) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    axios
      .get("/api/shop/my-shops", { withCredentials: true })
      .then(({ data }) => {
        if (!cancelled) {
          setShops(Array.isArray(data?.shops) ? data.shops : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err.response?.data?.error ||
            err.message ||
            "Failed to load your shops.";
          setError(msg);
          setShops([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entrepreneur_id, shopId]);

  useEffect(() => {
    if (shops.length === 0) return;
    const match = shops.find((s) => String(s.id) === String(shopId));
    setSelectedShopId(String((match ?? shops[0]).id));
  }, [shops, shopId]);

  useEffect(() => {
    if (!selectedShopId) return;
    let cancelled = false;
    setDashboard(null);
    setDetailLoading(true);
    axios
      .get(`/api/shop/dashboard/${selectedShopId}`, { withCredentials: true })
      .then(({ data }) => {
        if (!cancelled) setDashboard(data);
      })
      .catch(() => {
        if (!cancelled) setDashboard(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedShopId]);

  useEffect(() => {
    if (!selectedShopId || entrepreneur_id == null) return;
    const sid = Number.parseInt(String(selectedShopId), 10);
    if (Number.isNaN(sid)) return;

    let cancelled = false;
    setListLoading(true);
    setListError("");

    (async () => {
      let productsErr = "";
      let ordersErr = "";
      const [productsData, ordersData] = await Promise.all([
        getProducts(sid, entrepreneur_id).catch((err) => {
          productsErr = err?.message || "Failed to load products.";
          return { products: [] };
        }),
        getOrdersByShop(sid, entrepreneur_id).catch((err) => {
          ordersErr = err?.message || "Failed to load orders.";
          return { orders: [] };
        }),
      ]);

      if (cancelled) return;
      setShopProducts(Array.isArray(productsData?.products) ? productsData.products : []);
      setShopOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);

      const errs = [productsErr, ordersErr].filter(Boolean);
      setListError(errs.join(" "));
      setListLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedShopId, entrepreneur_id]);

  const selectedShop =
    shops.find((s) => String(s.id) === selectedShopId) ?? null;

  const dShop = dashboard?.shop ?? null;
  const verDocs = parseVerificationDocs(dShop);
  const wallet = walletTotals(dashboard?.account);
  const productCount = dashboard?.productCount ?? shopProducts.length;
  const ordersCount = dashboard?.ordersCount ?? shopOrders.length;
  const reviewMetrics = dashboard?.reviewMetrics ?? null;
  const policies = dashboard?.policies ?? null;
  const locLines = locationLines(shopProp(dShop, "location", "Location"));

  const categorySlug = shopProp(dShop, "category", "Category");
  const categoryDisplay =
    categorySlug != null && categorySlug !== ""
      ? humanizeCategoryKey(String(categorySlug))
      : "—";

  const locationObj =
    parseLocation(shopProp(dShop, "location", "Location")) || {};

  const businessAvail = parseBusinessAvailability(locationObj);
  const hasBusinessAvailability = businessAvail != null;

  if (loading) {
    return (
      <div className="shop-cnt">
        <div className="right" style={{ width: "100%" }}>
          <p>Loading shop…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-cnt">
        <div className="right" style={{ width: "100%" }}>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <Link href="/entrepreneur/shop" style={{ color: "#005c45" }}>
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {
        screenWidth > 480 && screenWidth < 1200
        ?
        <>
          <div
            style={{
              minHeight: "100vh",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "24px",
              boxSizing: "border-box",
            }}
            role="status"
            aria-live="polite"
          >
            <h4
              style={{
                margin: 0,
                maxWidth: "36rem",
                textAlign: "center",
                fontWeight: 600,
                lineHeight: 1.45,
                fontSize: "1.05rem",
              }}
            >
              This shop editor supports narrow layouts (about 480px wide or less) or
              large screens (1200px and up). Tablet-sized widths are not supported
              yet—try resizing the window or opening the page on a phone or desktop.
            </h4>
          </div>
        </>
        :
        <div className="shop-cnt">
          {/* <div className="shop-cnt-head">
            <div className="shop-cnt-head-profile-cnt">
              <img className="shop-cnt-head-user-img" src="" alt="User profile image" />
              &nbsp;
              &nbsp;
              <div>
                <h3>Akpulu.F</h3>
                <p>Awka, NG</p>
              </div>
            </div>

            <div>
              <button className="shop-head-cnt-profile-link">
                View Profile 
              </button>
            </div>
          </div> */}
          
          { 
            screenWidth >= 1024
            &&
            <div className="shop-cnt-body">
              <div className="left">
                <div className="shop-cnt-body-left-shop-list">
                  <div className="shop-cnt-body-left-shop-list-head">
                    <span><h5>View Shops</h5></span>
                    <span style={{padding: "0px"}}>
                      <AddBtn action={() => window.location.href="/entrepreneur/shop"} />
                    </span>
                  </div>
                  <div className="input-cnt">
                    <select
                      name=""
                      id=""
                      className=""
                      value={selectedShopId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedShopId(id);
                      }}
                    >
                      {
                        shops.map((s) => (
                          <option key={s.id} value={String(s.id)}>{s.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="shop-cnt-body-left-shop-summary">
                  <div className="shop-summary">
                    <span>
                      {detailLoading
                        ? "…"
                        : formatMoney(wallet.total, wallet.currency)}
                    </span>
                    <span>Revenue</span>
                    {!detailLoading && wallet.pending > 0 ? (
                      <small style={{ display: "block", color: "#666" }}>
                        Pending {formatMoney(wallet.pending, wallet.currency)}
                      </small>
                    ) : null}
                  </div>

                  <div className="shop-summary">
                    <span>{detailLoading ? "…" : ordersCount}</span>
                    <span>Orders</span>
                  </div>

                  <div className="shop-summary">
                    <span>{detailLoading ? "…" : productCount}</span>
                    <span>Products</span>
                  </div>
                </div>
                <div className="shop-cnt-body-left-shop-category">
                  <div className="shop-cnt-body-left-shop-category-head">
                    <span><h5>Category</h5></span>
                    <span>
                      <EditBtn
                        mode="category"
                        title="Shop category"
                        initialValue={categorySlug ?? ""}
                        selectPlaceholder="Pick a category"
                        onSave={(slug) => persistPatch({ category: slug })}
                      />
                    </span>
                  </div>
                  <p style={{fontSize: "2.5vh", margin: "10px 0px 0px 0px", fontWeight: "500", background: "#f9f9f9", width: "fit-content", borderRadius: "2.5px", padding: "8px 10px"}}>
                    {detailLoading ? "…" : categoryDisplay}
                  </p>
                </div>
                {/* Availability section disabled — not in scope for now.
                <div className="shop-cnt-body-left-shop-availability">
                  <div className="shop-cnt-body-left-shop-availability-head">
                    <span><h5>Availability</h5></span>
                    <span style={{padding: "0px"}}>
                      {hasBusinessAvailability ? (
                        <EditBtn
                          mode="businessAvailability"
                          title="Business availability"
                          initialBusinessAvailability={businessAvail}
                          onSave={(sched) =>
                            persistPatch({
                              location: {
                                ...locationObj,
                                businessAvailability: sched,
                              },
                            })
                          }
                        />
                      ) : (
                        <AddBtn
                          mode="businessAvailability"
                          title="Business availability"
                          initialBusinessAvailability={businessAvail}
                          onSave={(sched) =>
                            persistPatch({
                              location: {
                                ...locationObj,
                                businessAvailability: sched,
                              },
                            })
                          }
                        />
                      )}
                    </span>
                  </div>
                  <BusinessAvailabilitySummaryTable
                    businessAvail={businessAvail}
                    detailLoading={detailLoading}
                  />
                </div>
                */}
                <div className="shop-cnt-body-left-shop-verification">
                  <div className="shop-cnt-body-left-shop-verification-head">
                    <span><h5>Verification</h5></span>
                    
                  </div>
                  <div className="shop-cnt-body-left-shop-verification-body">
                    {VERIFICATION_ITEMS.map((item) => (
                      <div key={item.label} className="kyc-cnt">
                        <span>
                          {item.label}
                          <small
                            style={{
                              color: verificationStatus(item, verDocs).color,
                              marginLeft: "6px",
                            }}
                          >
                            {verificationStatus(item, verDocs).label}
                          </small>
                        </span>
                        <span>
                          {hasVerificationData(item, verDocs) ? (
                            <EditBtn
                              mode={item.mode}
                              title={item.label}
                              shopId={selectedShopId}
                              onComplete={refreshDashboard}
                              verificationDocKey={item.key ?? undefined}
                              helpText={item.helpText ?? undefined}
                              bvnInitialLast4={
                                item.mode === "bvn" ? verDocs?.bvn?.last4 : undefined
                              }
                            />
                          ) : (
                            <AddBtn
                              mode={item.mode}
                              title={item.label}
                              shopId={selectedShopId}
                              onComplete={refreshDashboard}
                              verificationDocKey={item.key ?? undefined}
                              helpText={item.helpText ?? undefined}
                              bvnInitialLast4={
                                item.mode === "bvn" ? verDocs?.bvn?.last4 : undefined
                              }
                            />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <ShopLocationPicker
                  detailLoading={detailLoading}
                  locationObj={locationObj}
                  persistPatch={persistPatch}
                  locLines={locLines}
                />
                <div className="shop-cnt-body-left-shop-policies">
                  <div className="shop-cnt-body-left-shop-policies-head">
                    <span><h5>Policies</h5></span>
                  </div>
                  <div className="shop-cnt-body-left-shop-policies-body">
                    {[
                      // { key: "refund", label: "Refund policy" },
                      { key: "delivery", label: "Delivery policy" },
                      // { key: "custom", label: "Custom policies" },
                    ].map((row) => (
                      <div key={row.key} className="kyc-cnt">
                        <span>
                          {row.label}
                          <small
                            style={{
                              color:
                                !detailLoading && policyConfigured(policies, row.key)
                                  ? "#00926e"
                                  : "#6b7280",
                              marginLeft: "6px",
                            }}
                          >
                            {!detailLoading && policyConfigured(policies, row.key)
                              ? "Set"
                              : "Not set"}
                          </small>
                        </span>
                        <span>
                          {!detailLoading && policyConfigured(policies, row.key) ? (
                            <EditBtn
                              mode="policyBuilder"
                              title={row.label}
                              shopId={selectedShopId}
                              policies={policies}
                              policyTarget={row.key}
                              onComplete={refreshDashboard}
                            />
                          ) : (
                            <AddBtn
                              mode="policyBuilder"
                              title={row.label}
                              shopId={selectedShopId}
                              policies={policies}
                              policyTarget={row.key}
                              onComplete={refreshDashboard}
                            />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="right">
                <div className="shop-cnt-body-right-shop-meta">
                  <div
                    className="banner-cnt"
                    style={
                      shopProp(dShop, "banner", "Banner")
                        ? {
                            backgroundImage: `url(${shopProp(dShop, "banner", "Banner")})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            minHeight: "120px",
                          }
                        : undefined
                    }
                  />
                  <div className="logo-cnt">
                    {shopProp(dShop, "logo", "Logo") ? (
                      <img src={shopProp(dShop, "logo", "Logo")} alt="" />
                    ) : null}
                  </div>
                </div>
                <div className="shop-cnt-body-right-shop-title">
                  <span style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "200px",
                    position: "relative"
                  }}>
                    <h3>{selectedShop?.name ?? "—"}</h3>
                    &nbsp;
                    &nbsp;
                      <EditBtn />
                  </span>
                  <span>
                    <div className="shop-status-cnt">
                      <small>
                        <b>
                          {detailLoading
                            ? "…"
                            : formatShopStatus(
                                shopProp(dShop, "status", "Status")
                              )}
                        </b>
                      </small>
                      {!detailLoading &&
                      reviewMetrics &&
                      Number(reviewMetrics.review_count) > 0 ? (
                        <small style={{ display: "block", color: "#666" }}>
                          {reviewMetrics.review_count} reviews · avg{" "}
                          {Number(reviewMetrics.average_rating).toFixed(1)}★
                        </small>
                      ) : null}
                    </div>
                  </span>
                </div>
                <div className="shop-cnt-body-right-shop-description">
                  <div className="shop-cnt-body-right-shop-description-head">
                    <h5>Description</h5>
                    &nbsp;
                    &nbsp;
                    <div>
                      <EditBtn
                        mode="textarea"
                        title="Shop description"
                        placeholder="Describe your shop"
                        initialValue={
                          shopProp(dShop, "description", "Description") ?? ""
                        }
                        onSave={(val) => persistPatch({ description: val })}
                      />
                    </div>
                  </div>
                  <span>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {detailLoading
                        ? "Loading…"
                        : shopProp(dShop, "description", "Description") ||
                          "No description yet."}
                    </p>
                  </span>
                </div>
                
                {/* <div className="shop-cnt-body-right-shop-catalog">
                  <div className="catalog-head">
                    <h5 style={{padding: "0px", margin: "0px"}}>
                      Catalog ({detailLoading || listLoading ? "…" : productCount})
                    </h5>
                  </div>
                  <div className="catalog-body">
                    {listError ? (
                      <p style={{ color: "#b91c1c", margin: 0 }}>{listError}</p>
                    ) : null}
                    {!listLoading && shopProducts.length === 0 ? (
                      <p style={{ margin: 0, color: "#666" }}>No products found for this shop.</p>
                    ) : null}
                    {!listLoading && shopProducts.length > 0 ? (
                      <div className="catalog-card-cnt">
                        {shopProducts.map((p) => (
                          <div
                            key={String(productRowId(p))}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "200px",
                              margin: "0px 8px",
                              flexShrink: 0,
                              flexDirection: "column",
                              padding: "6px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <img src="" style={{
                              height: "120px",
                              width: "100%"
                            }} alt="" />
                            <div style={{
                              padding: "0px 5px"
                            }}>
                              <span
                                style={{
                                  fontWeight: 400,
                                  display: "block",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "100%",
                                }}
                              >
                                {p?.name ?? p?.Name ?? "—"}
                              </span>
                              <small style={{ color: "#666", whiteSpace: "nowrap" }}>
                                {formatDateShort(p?.created_at ?? p?.createdAt)}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div> */}
                {/* <div className="shop-cnt-body-right-shop-orders">
                  <div className="orders-head">
                    <h5>
                      Orders ({detailLoading || listLoading ? "…" : ordersCount})
                    </h5>
                    <h5 style={{ color: "#888", fontWeight: 500 }}>
                      Real-time from shop orders
                    </h5>
                  </div>
                  <div className="orders-body">
                    {!listLoading && shopOrders.length === 0 ? (
                      <p style={{ margin: 0, color: "#666" }}>No orders found for this shop.</p>
                    ) : null}
                    {!listLoading && shopOrders.length > 0 ? (
                      <div className="orders-card-cnt">
                        {shopOrders.map((o) => (
                          <div
                            key={String(orderRowId(o))}
                            className="order-card-item"
                          >
                            <img src="" style={{
                              height: "120px",
                              width: "100%"
                            }} alt="" />
                            <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                              #{orderRowId(o)}
                            </span>
                            <span style={{ fontWeight: 500 }}>
                              {formatMoney(o?.amount ?? 0, "NGN")}
                            </span>
                            <span
                              style={{
                                textTransform: "capitalize",
                                color: "#666",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {orderStatusLabel(o?.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div> */}

              </div>
            </div>
          }
          {
            screenWidth <= 480
            &&
            <>
                {/* Shop banner and logo */}
                <div className="shop-cnt-body-right-shop-meta">
                  <div
                    className="banner-cnt"
                    style={
                      shopProp(dShop, "banner", "Banner")
                        ? {
                            backgroundImage: `url(${shopProp(dShop, "banner", "Banner")})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            minHeight: "100px",
                          }
                        : undefined
                    }
                  />
                  <div className="logo-cnt">
                    {shopProp(dShop, "logo", "Logo") ? (
                      <img src={shopProp(dShop, "logo", "Logo")} alt="" />
                    ) : null}
                  </div>

                  <div className="shop-status-cnt">
                    <small>
                      <b>
                        {detailLoading
                          ? "…"
                          : formatShopStatus(shopProp(dShop, "status", "Status"))}
                      </b>
                    </small>
                    {!detailLoading &&
                    reviewMetrics &&
                    Number(reviewMetrics.review_count) > 0 ? (
                      <small style={{ display: "block", color: "#666" }}>
                        {reviewMetrics.review_count} reviews · avg{" "}
                        {Number(reviewMetrics.average_rating).toFixed(1)}★
                      </small>
                    ) : null}
                  </div>
                </div>

                <br />
                <div style={{
                  height: "200vh",
                  position: "relative"
                }}>

                  {/* Shop list */}
                  <div className="shop-cnt-body-left-shop-list">
                    <div className="shop-cnt-body-left-shop-list-head">
                      <span><h5>View Shops</h5></span>
                      <span style={{padding: "0px"}}>
                        <AddBtn action={() => { window.location.href = "/entrepreneur/shop"; }} />
                      </span>
                    </div>
                    <div className="input-cnt">
                      <select
                        name=""
                        id=""
                        className=""
                        value={selectedShopId}
                        onChange={(e) => setSelectedShopId(e.target.value)}
                      >
                        {
                          shops.map((s) => (
                            <option key={s.id} value={String(s.id)}>{s.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  {/* Shop title */}
                  <div className="shop-cnt-body-right-shop-title">
                    <span style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "200px",
                      position: "relative"
                    }}>
                      <h3>{selectedShop?.name ?? "—"}</h3>
                    </span>
                    <span>
                      <EditBtn />
                    </span>
                  
                  </div>
                  {/* Shop summary*/}
                  <div className="shop-cnt-body-left-shop-summary">
                    <div className="shop-summary">
                      <span>
                        {detailLoading
                          ? "…"
                          : formatMoney(wallet.total, wallet.currency)}
                      </span>
                      <span>Revenue</span>
                    </div>
                    <div className="shop-summary">
                      <span>{detailLoading ? "…" : ordersCount}</span>
                      <span>Orders</span>
                    </div>
                    <div className="shop-summary">
                      <span>{detailLoading ? "…" : productCount}</span>
                      <span>Products</span>
                    </div>
                  </div>
                  <div className="shop-cnt-body-left-shop-category">
                    <div className="shop-cnt-body-left-shop-category-head">
                      <span><h5>Category</h5></span>
                      <span>
                        <EditBtn
                          mode="category"
                          title="Shop category"
                          initialValue={categorySlug ?? ""}
                          selectPlaceholder="Pick a category"
                          onSave={(slug) => persistPatch({ category: slug })}
                        />
                      </span>
                    </div>
                    <p style={{fontSize: "2.5vh", margin: "10px 0px 0px 0px", fontWeight: "500", background: "#f9f9f9", width: "fit-content", borderRadius: "2.5px", padding: "8px 10px"}}>
                      {detailLoading ? "…" : categoryDisplay}
                    </p>
                  </div>
                  {/* Availability section disabled — not in scope for now.
                  <div className="shop-cnt-body-left-shop-availability">
                    <div className="shop-cnt-body-left-shop-availability-head">
                      <span><h5>Availability</h5></span>
                      <span style={{padding: "0px"}}>
                        {hasBusinessAvailability ? (
                          <EditBtn
                            mode="businessAvailability"
                            title="Business availability"
                            initialBusinessAvailability={businessAvail}
                            onSave={(sched) =>
                              persistPatch({
                                location: {
                                  ...locationObj,
                                  businessAvailability: sched,
                                },
                              })
                            }
                          />
                        ) : (
                          <AddBtn
                            mode="businessAvailability"
                            title="Business availability"
                            initialBusinessAvailability={businessAvail}
                            onSave={(sched) =>
                              persistPatch({
                                location: {
                                  ...locationObj,
                                  businessAvailability: sched,
                                },
                              })
                            }
                          />
                        )}
                      </span>
                    </div>
                    <BusinessAvailabilitySummaryTable
                      businessAvail={businessAvail}
                      detailLoading={detailLoading}
                    />
                  </div>
                  */}
                  <div className="shop-cnt-body-right-shop-description">
                  <div className="shop-cnt-body-right-shop-description-head">
                    <h5>Description</h5>
                    &nbsp;
                    &nbsp;
                    <div>
                      <EditBtn
                        mode="textarea"
                        title="Shop description"
                        placeholder="Describe your shop"
                        initialValue={
                          shopProp(dShop, "description", "Description") ?? ""
                        }
                        onSave={(val) => persistPatch({ description: val })}
                      />
                    </div>
                  </div>
                    <span>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {detailLoading
                          ? "Loading…"
                          : shopProp(dShop, "description", "Description") ||
                            "No description yet."}
                      </p>
                    </span>
                    
                  </div>

                  <div className="shop-cnt-body-left-shop-verification">
                    <div className="shop-cnt-body-left-shop-verification-head">
                      <span><h5>Verification</h5></span>
                      
                    </div>
                    <div className="shop-cnt-body-left-shop-verification-body">
                      {VERIFICATION_ITEMS.map((item) => (
                        <div key={item.label} className="kyc-cnt">
                          <span>
                            {item.label}
                            <small
                              style={{
                                color: verificationStatus(item, verDocs).color,
                                marginLeft: "6px",
                              }}
                            >
                              {verificationStatus(item, verDocs).label}
                            </small>
                          </span>
                          <span>
                            {hasVerificationData(item, verDocs) ? (
                              <EditBtn
                                mode={item.mode}
                                title={item.label}
                                shopId={selectedShopId}
                                onComplete={refreshDashboard}
                                verificationDocKey={item.key ?? undefined}
                                helpText={item.helpText ?? undefined}
                                bvnInitialLast4={
                                  item.mode === "bvn" ? verDocs?.bvn?.last4 : undefined
                                }
                              />
                            ) : (
                              <AddBtn
                                mode={item.mode}
                                title={item.label}
                                shopId={selectedShopId}
                                onComplete={refreshDashboard}
                                verificationDocKey={item.key ?? undefined}
                                helpText={item.helpText ?? undefined}
                                bvnInitialLast4={
                                  item.mode === "bvn" ? verDocs?.bvn?.last4 : undefined
                                }
                              />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ShopLocationPicker
                    detailLoading={detailLoading}
                    locationObj={locationObj}
                    persistPatch={persistPatch}
                    locLines={locLines}
                  />
                  <div className="shop-cnt-body-left-shop-policies">
                    <div className="shop-cnt-body-left-shop-policies-head">
                      <span><h5>Policies</h5></span>
                    </div>
                    <div className="shop-cnt-body-left-shop-policies-body">
                      {[
                        // { key: "refund", label: "Refund policy" },
                        { key: "delivery", label: "Delivery policy" },
                        // { key: "custom", label: "Custom policies" },
                      ].map((row) => (
                        <div key={row.key} className="kyc-cnt">
                          <span>
                            {row.label}
                            <small
                              style={{
                                color:
                                  !detailLoading && policyConfigured(policies, row.key)
                                    ? "#00926e"
                                    : "#6b7280",
                                marginLeft: "6px",
                              }}
                            >
                              {!detailLoading && policyConfigured(policies, row.key)
                                ? "Set"
                                : "Not set"}
                            </small>
                          </span>
                          <span>
                            {!detailLoading && policyConfigured(policies, row.key) ? (
                              <EditBtn
                                mode="policyBuilder"
                                title={row.label}
                                shopId={selectedShopId}
                                policies={policies}
                                policyTarget={row.key}
                                onComplete={refreshDashboard}
                              />
                            ) : (
                              <AddBtn
                                mode="policyBuilder"
                                title={row.label}
                                shopId={selectedShopId}
                                policies={policies}
                                policyTarget={row.key}
                                onComplete={refreshDashboard}
                              />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* <div className="shop-cnt-body-right-shop-catalog">
                    <div className="catalog-head">
                      <h5 style={{padding: "0px", margin: "0px"}}>
                        Catalog ({detailLoading || listLoading ? "…" : productCount})
                      </h5>
                    </div>
                    <div className="catalog-body">
                      {listError ? (
                        <p style={{ color: "#b91c1c", margin: 0 }}>{listError}</p>
                      ) : null}
                      {!listLoading && shopProducts.length === 0 ? (
                        <p style={{ margin: 0, color: "#666" }}>No products found for this shop.</p>
                      ) : null}
                      {!listLoading && shopProducts.length > 0 ? (
                        <div style={{ width: "100%" }}>
                          {shopProducts.slice(0, 8).map((p) => (
                            <div
                              key={String(productRowId(p))}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                padding: "6px 0",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {p?.name ?? p?.Name ?? "—"}
                              </span>
                              <small style={{ color: "#666", whiteSpace: "nowrap" }}>
                                {formatDateShort(p?.created_at ?? p?.createdAt)}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="shop-cnt-body-right-shop-orders">
                    <div className="orders-head">
                      <h6>
                        Orders ({detailLoading || listLoading ? "…" : ordersCount})
                      </h6>
                      <h6 style={{ color: "#888", fontWeight: 500 }}>
                        Real-time from shop orders
                      </h6>
                    </div>
                    <div className="orders-body">
                      {!listLoading && shopOrders.length === 0 ? (
                        <p style={{ margin: 0, color: "#666" }}>No orders found for this shop.</p>
                      ) : null}
                      {!listLoading && shopOrders.length > 0 ? (
                        <div style={{ width: "100%" }}>
                          {shopOrders.slice(0, 8).map((o) => (
                            <div
                              key={String(orderRowId(o))}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1.2fr 1fr 1fr",
                                gap: 8,
                                padding: "6px 0",
                                borderBottom: "1px solid #f0f0f0",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                #{orderRowId(o)}
                              </span>
                              <span>{formatMoney(o?.amount ?? 0, "NGN")}</span>
                              <span style={{ textTransform: "capitalize" }}>
                                {orderStatusLabel(o?.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div> */}
                </div>

              
            </>
          }

        </div>
      }
    </>
  );
}


function MobileView(){


  return(
    <>

    </>
  )
}
