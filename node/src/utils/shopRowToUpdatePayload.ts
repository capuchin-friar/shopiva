import type { ShopDocument, ShopLocation, ShopSocialLinks, ShopStatus, VendorType } from "../types/business.js";

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (value == null) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const o = JSON.parse(value) as unknown;
      if (o !== null && typeof o === "object" && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function rowVal(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null) return v;
    const lower = k.toLowerCase();
    const v2 = row[lower];
    if (v2 !== undefined && v2 !== null) return v2;
  }
  return undefined;
}

const DEFAULT_LOC: ShopLocation = {
  address: null,
  city: null,
  state: null,
  country: null,
  zipcode: null,
  coordinates: null,
};

const DEFAULT_SOCIAL: ShopSocialLinks = {
  facebook: null,
  instagram: null,
  twitter: null,
  website: null,
  tiktok: null,
};

/**
 * Build a full {@link ShopDocument} from a Postgres `shops` row for {@link UpdateShopService}.
 */
export function shopRowToUpdatePayload(row: Record<string, unknown>): ShopDocument {
  const shopId = Number(rowVal(row, "id"));
  const ownerId = Number(rowVal(row, "ownerId", "ownerid"));
  const name = String(rowVal(row, "name") ?? "").trim();
  const slug = String(rowVal(row, "slug") ?? "").trim();
  const description = rowVal(row, "description") != null ? String(rowVal(row, "description")) : null;
  const logo = rowVal(row, "logo") != null ? String(rowVal(row, "logo")) : null;
  const banner = rowVal(row, "banner") != null ? String(rowVal(row, "banner")) : null;
  const category = rowVal(row, "category") != null ? String(rowVal(row, "category")) : null;
  const tagsRaw = rowVal(row, "tags");
  const tags = Array.isArray(tagsRaw) ? (tagsRaw as unknown[]).map((t) => String(t)) : [];
  const contactEmail = rowVal(row, "contactEmail", "contactemail") != null ? String(rowVal(row, "contactEmail", "contactemail")) : null;
  const contactPhone = rowVal(row, "contactPhone", "contactphone") != null ? String(rowVal(row, "contactPhone", "contactphone")) : null;
  const vendorTypeRaw = String(rowVal(row, "vendorType", "vendortype") ?? "reseller").trim() || "reseller";
  const vendorType = (["manufacturer", "reseller", "dropshipper"].includes(vendorTypeRaw)
    ? vendorTypeRaw
    : "reseller") as VendorType;

  const location = { ...DEFAULT_LOC, ...parseJsonObject(rowVal(row, "location")) } as ShopLocation;
  const socialLinks = { ...DEFAULT_SOCIAL, ...parseJsonObject(rowVal(row, "socialLinks", "sociallinks")) } as ShopSocialLinks;

  const isActive = Boolean(rowVal(row, "isActive", "isactive") ?? true);
  const isVerified = Boolean(rowVal(row, "isVerified", "isverified") ?? false);
  const statusRaw = String(rowVal(row, "status") ?? "pending_approval").trim() || "pending_approval";
  const status = (["active", "suspended", "closed", "pending_approval"].includes(statusRaw)
    ? statusRaw
    : "pending_approval") as ShopStatus;

  const verificationDocuments = parseJsonObject(rowVal(row, "verificationDocuments", "verificationdocuments"));

  const createdAt =
    rowVal(row, "createdAt", "createdat") != null ? String(rowVal(row, "createdAt", "createdat")) : new Date().toISOString();
  const updatedAt =
    rowVal(row, "updatedAt", "updatedat") != null ? String(rowVal(row, "updatedAt", "updatedat")) : new Date().toISOString();

  return {
    ownerId,
    shopId,
    name,
    slug,
    description,
    logo,
    banner,
    category,
    tags,
    contactEmail,
    contactPhone,
    vendorType,
    location,
    socialLinks,
    isActive,
    isVerified,
    status,
    verificationDocuments: verificationDocuments as unknown as ShopDocument["verificationDocuments"],
    createdAt,
    updatedAt,
  };
}
