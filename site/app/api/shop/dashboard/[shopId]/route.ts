import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/jwt";
import {
  readUpstreamJson,
  upstreamData,
  upstreamJsonError,
} from "../../../lib/upstreamJson";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

/**
 * Vendor shop dashboard payload expected by /entrepreneur/shop/[id].
 * Composes Node routes GET /shop/:shopId/:ownerId and GET /shop/metrics/:shopId/:ownerId
 * (there is no /shop/dashboard on the Node server).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const token = request.cookies.get("entrepreneur_secret")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "Backend URL is not configured." },
        { status: 500 }
      );
    }
    const secret = getJwtSecret();
    if (!secret) {
      return NextResponse.json(
        { error: "Server auth misconfiguration." },
        { status: 500 }
      );
    }
    const decoded = jwt.verify(token, secret) as { id?: number };
    const ownerId = decoded?.id;
    if (ownerId == null) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const shopId = params.shopId;
    if (!shopId || Number.isNaN(Number(shopId))) {
      return NextResponse.json({ error: "Invalid shop ID." }, { status: 400 });
    }

    const authHeader = { Authorization: `Bearer ${token}` };
    const [shopRes, metricsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/shop/${shopId}/${ownerId}`, {
        headers: authHeader,
      }),
      fetch(`${BACKEND_URL}/shop/metrics/${shopId}/${ownerId}`, {
        headers: authHeader,
      }),
    ]);

    const shopParsed = await readUpstreamJson(shopRes);
    const shopParseErr = upstreamJsonError(shopParsed);
    if (shopParseErr) {
      return NextResponse.json({ error: shopParseErr }, { status: 502 });
    }
    const shopBody = upstreamData(shopParsed);
    if (!shopRes.ok) {
      return NextResponse.json(
        {
          error:
            (shopBody.error as string | undefined) ||
            (shopBody.message as string | undefined) ||
            "Failed to load shop dashboard",
        },
        {
          status:
            shopRes.status === 403
              ? 403
              : shopRes.status === 404
                ? 404
                : 502,
        }
      );
    }

    const rawShop = shopBody.shop ?? null;
    let shop: typeof rawShop = rawShop;
    let policies: Record<string, unknown> | null = null;
    if (rawShop != null && typeof rawShop === "object") {
      const r = rawShop as Record<string, unknown>;
      const p = r.policies;
      if (p != null && typeof p === "object") {
        policies = p as Record<string, unknown>;
      }
      if ("policies" in r) {
        const { policies: _removed, ...rest } = r;
        shop = rest as typeof rawShop;
      }
    }

    let reviewMetrics: {
      review_count: number;
      average_rating: number;
    } | null = null;
    const metricsParsed = await readUpstreamJson(metricsRes);
    let metricsRow: Record<string, unknown> = {};
    if (!upstreamJsonError(metricsParsed) && metricsRes.ok) {
      const mBody = upstreamData(metricsParsed);
      const m = (mBody.metrics as Record<string, unknown>) || {};
      metricsRow = m;
      reviewMetrics = {
        review_count: Number(m.review_count ?? 0),
        average_rating: Number(m.average_rating ?? 0),
      };
    }

    const [productsRes, ordersRes, inventoryRes] = await Promise.all([
      fetch(`${BACKEND_URL}/shop/${shopId}/products/${ownerId}`, {
        headers: authHeader,
      }),
      fetch(`${BACKEND_URL}/shop/${shopId}/orders/${ownerId}`, {
        headers: authHeader,
      }),
      fetch(`${BACKEND_URL}/shop/${shopId}/inventory/${ownerId}`, {
        headers: authHeader,
      }),
    ]);

    const productsParsed = await readUpstreamJson(productsRes);
    const ordersParsed = await readUpstreamJson(ordersRes);
    const inventoryParsed = await readUpstreamJson(inventoryRes);

    const productsBody = upstreamData(productsParsed);
    const ordersBody = upstreamData(ordersParsed);
    const inventoryBody = upstreamData(inventoryParsed);

    const products = Array.isArray(productsBody.products)
      ? (productsBody.products as Record<string, unknown>[])
      : [];
    const orders = Array.isArray(ordersBody.orders)
      ? (ordersBody.orders as Record<string, unknown>[])
      : [];
    const inventory = Array.isArray(inventoryBody.inventory)
      ? (inventoryBody.inventory as Record<string, unknown>[])
      : [];

    const num = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const productCount = products.length;
    const ordersCount = orders.length;
    const ordersRevenue = orders.reduce((sum, o) => sum + num(o.amount), 0);

    const lowInventoryCount = inventory.filter((row) => {
      const q = num(row.quantity_available ?? row.quantityAvailable);
      const th = num(row.low_stock_threshold ?? row.lowStockThreshold);
      if (th > 0) return q <= th;
      return q <= 0;
    }).length;

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - thirtyDaysMs;
    const recentCustomerIds = new Set<string>();
    for (const o of orders) {
      const rawDate = o.date ?? o.created_at ?? o.createdAt;
      const t = rawDate ? new Date(String(rawDate)).getTime() : NaN;
      if (!Number.isFinite(t) || t < cutoff) continue;
      const cid = o.customer_id ?? o.customerId;
      if (cid != null && String(cid).trim() !== "") {
        recentCustomerIds.add(String(cid));
      }
    }
    const newCustomersCount = recentCustomerIds.size;

    const orderTime = (o: Record<string, unknown>) => {
      const rawDate = o.date ?? o.created_at ?? o.createdAt;
      const t = rawDate ? new Date(String(rawDate)).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };
    const recentOrders = [...orders]
      .sort((a, b) => orderTime(b) - orderTime(a))
      .slice(0, 10)
      .map((o) => ({
        order_id: o.order_id ?? o.id,
        customer: o.customer ?? "—",
        amount: o.amount,
        status: o.status ?? "—",
        date: o.date ?? o.created_at ?? o.createdAt ?? null,
      }));

    return NextResponse.json({
      shop,
      account: null,
      productCount,
      ordersCount,
      ordersRevenue,
      lowInventoryCount,
      newCustomersCount,
      recentOrders,
      reviewMetrics,
      metrics: metricsRow,
      policies,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }
    console.error("Shop dashboard API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load dashboard.",
      },
      { status: 500 }
    );
  }
}
