import categoryJson from "../json/mvp_category.json";

/** Pretty label for a category slug (e.g. `health_beauty` → "Health Beauty"). */
export function humanizeCategoryKey(key) {
  return String(key)
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Top-level keys from `json/category.json` for shop category pickers.
 * @returns {{ value: string, label: string }[]}
 */
export function getTopLevelCategoryOptions() {
  return Object.keys(categoryJson)
    .map((key) => ({
      value: key,
      label: humanizeCategoryKey(key),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
