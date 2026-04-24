"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { getShopsByOwner } from "../../../../lib/productApi";
import { getStoredEntrepreneurShopId } from "../../../../lib/entrepreneurDefaultShop";
import { set_entrepreneur_shop_details } from "../../../../redux/entrepreneur/entrepreneur_shop";
import bankData from "../../../../json/bank.json";
import "./styles/xxl.css";
import "./styles/s.css";

const API_PROXY = "/api/backend";

function shopRowId(s) {
  return s?.id ?? s?.shop_id ?? s?.shopId;
}

const initialForm = {
  bank_name: "",
  bank_code: "",
  account_name: "",
  account_number: "",
};

export default function PayoutPage() {
  const dispatch = useDispatch();
  const entrepreneurId = useSelector((s) => s.entrepreneur_id?.entrepreneur_id);
  const shopFromStore = useSelector((s) => s.entrepreneur_shop?.shop);

  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [payoutAccount, setPayoutAccount] = useState(null);
  const [existingAccountId, setExistingAccountId] = useState(null);
  const [existingLast4, setExistingLast4] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const banks = useMemo(() => {
    const arr = Array.isArray(bankData) ? [...bankData] : [];
    return arr.sort((a, b) => String(a?.name ?? "").localeCompare(String(b?.name ?? "")));
  }, []);
  const bankOptions = useMemo(
    () =>
      banks.map((bank) => ({
        value: String(bank?.code ?? ""),
        label: String(bank?.name ?? "Unknown bank"),
      })),
    [banks]
  );
  const selectedBankOption = useMemo(
    () => bankOptions.find((option) => option.value === String(form.bank_code ?? "")) ?? null,
    [bankOptions, form.bank_code]
  );

  const activeShopFromStore = useMemo(
    () => shopFromStore?.id ?? shopFromStore?.shop_id ?? shopFromStore?.shopId,
    [shopFromStore?.id, shopFromStore?.shop_id, shopFromStore?.shopId]
  );

  useEffect(() => {
    if (entrepreneurId == null) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getShopsByOwner(entrepreneurId);
        if (cancelled) return;
        const list = Array.isArray(res?.shops) ? res.shops : [];
        setShops(list);

        if (!list.length) {
          setSelectedShopId("");
          setError("No shop found. Create a shop first.");
          return;
        }

        const storedId = getStoredEntrepreneurShopId();
        const preferred =
          activeShopFromStore != null
            ? String(activeShopFromStore)
            : storedId != null
            ? String(storedId)
            : String(shopRowId(list[0]) ?? "");

        const inList = list.some((s) => String(shopRowId(s)) === preferred);
        const nextShopId = inList ? preferred : String(shopRowId(list[0]) ?? "");
        setSelectedShopId(nextShopId);

        const selectedShop = list.find((s) => String(shopRowId(s)) === String(nextShopId));
        if (selectedShop) dispatch(set_entrepreneur_shop_details(selectedShop));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load shops.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entrepreneurId, activeShopFromStore, dispatch]);

  useEffect(() => {
    if (!selectedShopId || entrepreneurId == null) return;
    let cancelled = false;
    (async () => {
      setError("");
      setMessage("");
      setIsVerified(false);
      setVerifiedName("");
      try {
        const res = await fetch(`${API_PROXY}/shop/payment/${selectedShopId}/${entrepreneurId}`, {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const p = json?.payoutAccount;
        if (p) {
          setPayoutAccount(p);
          setExistingAccountId(p.id ?? null);
          setExistingLast4(p.account_number_last4 ? String(p.account_number_last4) : "");
          setShowForm(false);
          setForm({
            bank_name: p.bank_name ?? "",
            bank_code: p.bank_code ?? "",
            account_name: p.account_name ?? "",
            account_number: "",
          });
        } else {
          setPayoutAccount(null);
          setExistingAccountId(null);
          setExistingLast4("");
          setShowForm(false);
          setForm(initialForm);
        }
      } catch {
        if (!cancelled) {
          setPayoutAccount(null);
          setExistingAccountId(null);
          setExistingLast4("");
          setShowForm(false);
          setForm(initialForm);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedShopId, entrepreneurId]);

  const onInput = (e) => {
    const { name, value } = e.target;
    if (name === "account_number" || name === "bank_code") {
      setIsVerified(false);
      setVerifiedName("");
      setForm((prev) => ({ ...prev, account_name: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const verifyAccount = async () => {
    const account_number = form.account_number.replace(/\D/g, "");
    if (!form.bank_code.trim()) {
      setError("Select a bank first.");
      return;
    }
    if (account_number.length !== 10) {
      setError("Account number must be 10 digits to verify.");
      return;
    }
    if (entrepreneurId == null) {
      setError("User not found.");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      const res = await fetch(
        `${API_PROXY}/shop/payment/verify/${entrepreneurId}?account_number=${account_number}&bank_code=${encodeURIComponent(form.bank_code)}`,
        { credentials: "include" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Account verification failed.");
      }
      const resolvedName = String(json?.account_name ?? "").trim();
      setIsVerified(true);
      setVerifiedName(resolvedName);
      setForm((prev) => ({
        ...prev,
        account_name: resolvedName || prev.account_name,
        bank_name: String(json?.bank_name ?? prev.bank_name ?? ""),
      }));
    } catch (err) {
      setIsVerified(false);
      setVerifiedName("");
      setError(err?.message || "Account verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const onShopChange = (e) => {
    const nextId = e.target.value;
    setSelectedShopId(nextId);
    const shop = shops.find((s) => String(shopRowId(s)) === String(nextId));
    if (shop) dispatch(set_entrepreneur_shop_details(shop));
  };

  const validate = () => {
    if (!form.bank_name.trim()) return "Bank name is required.";
    if (!form.bank_code.trim()) return "Bank code is required.";
    const digits = form.account_number.replace(/\D/g, "");
    if (digits.length !== 10) return "Account number must be 10 digits.";
    if (!isVerified) return "Verify account before saving payout details.";
    if (!form.account_name.trim()) return "Account name is required.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!selectedShopId || entrepreneurId == null) {
      setError("Shop and user are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        bank_name: form.bank_name.trim(),
        bank_code: form.bank_code.trim(),
        account_name: form.account_name.trim(),
        account_number: form.account_number.replace(/\D/g, ""),
      };
      const method = existingAccountId ? "PUT" : "POST";
      const res = await fetch(`${API_PROXY}/shop/payment/${selectedShopId}/${entrepreneurId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Could not save payout details.");
      setMessage("Payout details saved successfully.");
      setExistingAccountId(existingAccountId ?? 1);
      const last4 = payload.account_number.slice(-4);
      const saved = {
        id: existingAccountId ?? 1,
        bank_name: payload.bank_name,
        bank_code: payload.bank_code,
        account_name: payload.account_name,
        account_number_last4: last4,
        country_code: "NG",
        currency: "NGN",
        status: "verified",
      };
      setExistingLast4(last4);
      setPayoutAccount(saved);
      setShowForm(false);
      setForm({ ...payload, account_number: "" });
    } catch (err) {
      setError(err?.message || "Could not save payout details.");
    } finally {
      setSaving(false);
    }
  };

  const onEditSavedAccount = () => {
    setShowForm(true);
    setIsVerified(false);
    setVerifiedName("");
    setError("");
    setMessage("");
    setForm((prev) => ({ ...prev, account_number: "" }));
  };

  const onDeleteSavedAccount = async () => {
    if (!selectedShopId || entrepreneurId == null) return;
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_PROXY}/shop/payment/${selectedShopId}/${entrepreneurId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Could not delete payout account.");
      setPayoutAccount(null);
      setExistingAccountId(null);
      setExistingLast4("");
      setShowForm(false);
      setForm(initialForm);
      setIsVerified(false);
      setVerifiedName("");
      setMessage("Payout account deleted.");
    } catch (err) {
      setError(err?.message || "Could not delete payout account.");
    }
  };

  return (
    <div className="payout-page">
      <div className="payout-header">
        <h5>Payout Details</h5>
        <p>Add the bank details used to settle your earnings after successful orders.</p>
      </div>

      {shops.length > 0 ? (
        <div className="payout-shop-row">
          <label htmlFor="payout-shop">Shop</label>
          <select id="payout-shop" value={selectedShopId} onChange={onShopChange}>
            {shops.map((shop, index) => {
              const id = shopRowId(shop);
              return (
                <option key={id != null ? String(id) : `shop-${index}`} value={String(id ?? "")}>
                  {shop?.name ?? shop?.Name ?? "—"}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}

      {loading ? <p>Loading payout details...</p> : null}
      {!loading && error ? <p className="payout-error">{error}</p> : null}
      {!loading && message ? <p className="payout-success">{message}</p> : null}

      {!loading && selectedShopId && !showForm ? (
        payoutAccount ? (
          <div className="payout-summary-card">
            <h6>Payout account</h6>
            <div className="payout-summary-grid">
              <p><span>Bank</span><b>{payoutAccount?.bank_name || "—"}</b></p>
              <p><span>Account name</span><b>{payoutAccount?.account_name || "—"}</b></p>
              <p><span>Account number</span><b>****{payoutAccount?.account_number_last4 || existingLast4 || "—"}</b></p>
              <p><span>Status</span><b>{payoutAccount?.status || "verified"}</b></p>
            </div>
            <div className="payout-summary-actions">
              <button type="button" className="payout-verify-btn" onClick={onEditSavedAccount}>Edit</button>
              <button type="button" className="payout-cancel-btn" onClick={onDeleteSavedAccount}>Delete</button>
            </div>
          </div>
        ) : (
          <div className="payout-empty-state">
            <h6>Payout account</h6>
            <p>
              You have not added any payout account yet. Add your bank details so settled earnings can be transferred
              to your account.
            </p>
            <button
              type="button"
              className="payout-empty-action"
              onClick={() => {
                setShowForm(true);
                setMessage("");
                setError("");
              }}
            >
              + Add payout details
            </button>
          </div>
        )
      ) : null}

      {!loading && selectedShopId && showForm ? (
        <form className="payout-form" onSubmit={onSubmit}>
          <div className="payout-grid">
            <div className="payout-field">
              <label>Bank name</label>
              <Select
                inputId="bank_code"
                classNamePrefix="payout-select"
                options={bankOptions}
                value={selectedBankOption}
                onChange={(option) => {
                  const code = option?.value ?? "";
                  const name = option?.label ?? "";
                  setIsVerified(false);
                  setVerifiedName("");
                  setForm((prev) => ({
                    ...prev,
                    bank_code: code,
                    bank_name: name,
                    account_name: "",
                  }));
                }}
                placeholder="Search and select bank"
                isClearable
                isSearchable
              />
            </div>

            {isVerified && form.account_name ? (
              <div className="payout-field">
                <label htmlFor="account_name">Account name</label>
                <input
                  id="account_name"
                  name="account_name"
                  value={form.account_name}
                  readOnly
                  placeholder="Resolved account name"
                />
              </div>
            ) : null}

            <div className="payout-field">
              <label htmlFor="account_number">Account number</label>
              <input
                id="account_number"
                name="account_number"
                value={form.account_number}
                onChange={onInput}
                inputMode="numeric"
                placeholder="10-digit account number"
              />
              {existingLast4 ? (
                <small>Current account ending in {existingLast4}. Enter full account number to replace it.</small>
              ) : null}
              {!isVerified ? <small>Account name will appear after successful verification.</small> : null}
              {!verifying && isVerified ? (
                <small className="payout-verified">Verified account: {verifiedName || form.account_name}</small>
              ) : null}
              <button
                type="button"
                className="payout-verify-btn"
                onClick={verifyAccount}
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify account"}
              </button>
            </div>

            <div className="payout-field">
              <label>Country</label>
              <input value="Nigeria (NG)" disabled />
            </div>

            <div className="payout-field">
              <label>Currency</label>
              <input value="NGN" disabled />
            </div>
          </div>

          <button type="submit" disabled={saving} className="payout-save-btn">
            {saving ? "Saving..." : "Save payout details"}
          </button>
          {!existingAccountId ? (
            <button
              type="button"
              className="payout-cancel-btn"
              onClick={() => {
                setShowForm(false);
                setForm(initialForm);
                setIsVerified(false);
                setVerifiedName("");
                setError("");
              }}
            >
              Cancel
            </button>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
