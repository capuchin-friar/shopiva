/**
 * Entrepreneur Signup Page
 * 
 * Registration form for new entrepreneurs.
 * Supports both local and Google OAuth registration.
 * 
 * @module app/entrepreneur/signup/page
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useDispatch } from "react-redux";

// Styles
import "./styles/xxl.css";
import "react-phone-number-input/style.css";

// Assets
import gg_svg from "../../../svgs/google-color-svgrepo-com (1).svg";
import logo_img from "../../../images/462832894_122104672550563288_120709183929923776_n.jpg";

// Data
import country from "../../../reusables/country.json";

// Utilities
import { entrepreneur_overlay_setup } from "../../../reusables/overlay";
import { setNewCookie } from "app/layout";

// ============================================================================
// CONSTANTS
// ============================================================================

/** API endpoint for registration */
const REGISTRATION_ENDPOINT = "http://localhost:3456/entrepreneur/registration";

/** Default country code */
const DEFAULT_COUNTRY_CODE = "+234";

/** Default country flag */
const DEFAULT_COUNTRY_FLAG = "https://flagcdn.com/w320/ng.png";

// ============================================================================
// SIGNUP PAGE COMPONENT
// ============================================================================

/**
 * Entrepreneur signup page component
 * 
 * @returns {JSX.Element} The signup form
 */
export default function Signup() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const session = useSession();
  const dispatch = useDispatch();

  // Form state
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("");
  const [referralSrc, setReferralSrc] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [duplicateErr, setDuplicateErr] = useState("");
  const [countries, setCountries] = useState([]);

  // Validation reference
  const validation = useRef(false);
  const book = useRef({
    fname: false,
    lname: false,
    email: false,
    pwd: false,
    phn: false,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load countries on mount
  useEffect(() => {
    setCountries(country);
  }, []);

  // Get referral source from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referral = urlParams.get("referral");
    setReferralSrc(referral || "website");
  }, []);

  // Handle Google OAuth session
  useEffect(() => {
    if (session.status !== "authenticated") return;

    fetch(REGISTRATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({
        fname: session.data.user.name.split(" ")[0],
        lname: session.data.user.name.split(" ")[1],
        email: session.data.user.email,
        pwd: "null",
        phone_number: "null",
        gender: "null",
        referral_src: "null",
        provider: "google",
      }),
    })
      .then(async (result) => {
        const response = await result.json();

        if (response.bool) {
          setNewCookie(response.cookie, 1);
          window.location.href = "/entrepreneur/pre-sale";
          entrepreneur_overlay_setup(false, "One Moment Please...");
        } else {
          handleRegistrationError(response.data.mssg);
          entrepreneur_overlay_setup(false, "Try Again...");
        }
      })
      .catch((err) => {
        console.error("Google registration error:", err);
      });
  }, [session]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Adds error message to a form field
   * @param {Array} err - Array of error objects
   * @param {HTMLElement} pElem - Parent element to append error to
   */
  const addErrMssg = (err, pElem) => {
    if (!pElem) return;

    const existingError = pElem.querySelector(".err-mssg");
    if (existingError) {
      existingError.remove();
    }

    if (err.length > 0) {
      const div = document.createElement("div");
      div.className = "err-mssg";
      div.innerHTML = err[0].mssg;
      pElem.append(div);
    }
  };

  /**
   * Handles registration error responses
   * @param {string} errorType - Type of error from API
   */
  const handleRegistrationError = (errorType) => {
    if (errorType === "email exists") {
      setDuplicateErr("Email already exists, please try something else");
    } else if (errorType === "phone exists") {
      setDuplicateErr("Phone already exists, please try something else");
    }
  };

  /**
   * Validates all form inputs
   */
  const validateForm = () => {
    const inputs = [...document.querySelectorAll("input")];

    inputs.forEach((item) => {
      if (item.type === "text") {
        validateTextInput(item);
      } else if (item.type === "password") {
        validatePasswordInput(item);
      } else if (item.type === "tel") {
        validatePhoneInput(item);
      }
    });
  };

  /**
   * Validates text inputs (name, email)
   */
  const validateTextInput = (item) => {
    if (item.name === "fname" || item.name === "lname") {
      const empty =
        item.value !== ""
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please field cannot be empty" };
      const length =
        item.value.length > 3
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please name must be at least 3 letters." };
      const specialCharFree = /^[a-zA-Z]+$/.test(item.value.trim())
        ? { bool: true, mssg: "" }
        : { bool: false, mssg: "Please enter only alphabets." };

      const errs = [empty, length, specialCharFree];
      addErrMssg(
        errs.filter((e) => e.mssg !== ""),
        item.parentElement
      );

      const hasErrors = errs.filter((e) => e.mssg !== "").length > 0;
      book.current[item.name] = !hasErrors;
    }

    if (item.name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const empty =
        item.value !== ""
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please field cannot be empty." };
      const validEmail = emailRegex.test(item.value)
        ? { bool: true, mssg: "" }
        : { bool: false, mssg: "Please enter a valid email address." };

      const errs = [empty, validEmail];
      addErrMssg(
        errs.filter((e) => e.mssg !== ""),
        item.parentElement
      );

      const hasErrors = errs.filter((e) => e.mssg !== "").length > 0;
      book.current.email = !hasErrors;
    }
  };

  /**
   * Validates password inputs
   */
  const validatePasswordInput = (item) => {
    if (item.name === "password") {
      const empty =
        item.value !== ""
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please field cannot be empty." };
      const length =
        item.value.length >= 8
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Password must contain at least 8 characters." };

      const errs = [empty, length];
      addErrMssg(
        errs.filter((e) => e.mssg !== ""),
        item.parentElement
      );

      const hasErrors = errs.filter((e) => e.mssg !== "").length > 0;
      book.current.pwd = !hasErrors;
    }

    if (item.name === "confirm-password") {
      const empty =
        item.value !== ""
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please field cannot be empty." };
      const match =
        item.value === pwd
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Password mismatch." };

      const errs = [empty, match];
      addErrMssg(
        errs.filter((e) => e.mssg !== ""),
        item.parentElement
      );

      const hasErrors = errs.filter((e) => e.mssg !== "").length > 0;
      book.current.pwd = !hasErrors;
    }
  };

  /**
   * Validates phone input
   */
  const validatePhoneInput = (item) => {
    if (item.name === "phone") {
      const empty =
        item.value !== ""
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Please field cannot be empty." };
      const length =
        item.value.length >= 10
          ? { bool: true, mssg: "" }
          : { bool: false, mssg: "Invalid Phone Number" };

      const errs = [empty, length];
      addErrMssg(
        errs.filter((e) => e.mssg !== ""),
        item.parentElement
      );

      const hasErrors = errs.filter((e) => e.mssg !== "").length > 0;
      book.current.phn = !hasErrors;
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles form submission
   * @param {Event} e - Click event
   */
  const handleRegistration = (e) => {
    try {
      entrepreneur_overlay_setup(true, "One Moment Please...");
      validateForm();

      const allValid = Object.values(book.current).every((val) => val === true);
      validation.current = allValid;

      if (!validation.current) {
        entrepreneur_overlay_setup(false, "Try Again...");
        return;
      }

      fetch(REGISTRATION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({
          fname,
          lname,
          email,
          pwd,
          phone_number: phoneNumber,
          referral_src: referralSrc,
          provider,
        }),
      })
        .then(async (result) => {
          const response = await result.json();

          if (response.bool) {
            setNewCookie(response.cookie, 1);
            window.location.href = "/entrepreneur/pre-sale";
            entrepreneur_overlay_setup(false, "One Moment Please...");
          } else {
            handleRegistrationError(response.data.mssg);
            entrepreneur_overlay_setup(false, "Try Again...");
          }
        })
        .catch((err) => {
          console.error("Registration error:", err);
          entrepreneur_overlay_setup(false, "One Moment Please...");
        });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  /**
   * Handles Google OAuth signup
   */
  const handleGoogleSignup = () => {
    setProvider("google");
    signIn("google", { redirect: false });
  };

  /**
   * Navigates to login page
   */
  const handleLoginNavigation = () => {
    window.location.href = "/entrepreneur/login";
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="enetrepreneur-signup-form">
      <div className="form-cnt">
        {/* Header Section */}
        <section>
          <section
            style={{
              marginLeft: "0px",
              flexDirection: "row",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <img
              src={logo_img.src}
              style={{ height: "40px", width: "40px", borderRadius: "10px" }}
              alt="Shopiva logo"
            />
          </section>

          {/* Google Signup Button */}
          <div style={{ display: "flex", width: "auto" }}>
            <button
              onClick={handleGoogleSignup}
              style={{
                padding: "2px 15px",
                height: "40px",
                background: "#000",
                border: "none",
                borderRadius: "5px",
              }}
            >
              <span style={{ color: "#fff" }}>Continue with Google</span>
              &nbsp;&nbsp;
              <span>
                <img
                  src={gg_svg.src}
                  style={{ height: "20px", width: "20px" }}
                  alt="Google"
                />
              </span>
            </button>
          </div>
        </section>

        {/* Registration Form */}
        <section style={{ height: "auto" }}>
          {/* Duplicate Error Message */}
          <h6 className="err-mssg">{duplicateErr}</h6>

          <div style={{ width: "100%" }}>
            {/* Name Fields */}
            <section style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{ width: "48%", display: "flex", flexDirection: "column" }}
                className="input-cnt"
              >
                <label htmlFor="fname">First name</label>
                <input
                  style={{ color: "#000", width: "100%" }}
                  onInput={(e) => setFname(e.target.value)}
                  type="text"
                  placeholder="First name"
                  name="fname"
                  id="fname"
                />
              </div>
              <div
                style={{ width: "48%", display: "flex", flexDirection: "column" }}
                className="input-cnt"
              >
                <label htmlFor="lname">Last name</label>
                <input
                  style={{ color: "#000", width: "100%" }}
                  onInput={(e) => setLname(e.target.value)}
                  type="text"
                  placeholder="Last name"
                  name="lname"
                  id="lname"
                />
              </div>
            </section>

            {/* Email Field */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label htmlFor="email">Email</label>
              <input
                style={{ color: "#000", width: "100%" }}
                onInput={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="Email"
                name="email"
                id="email"
              />
            </div>

            {/* Phone Field */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label htmlFor="phone">Phone</label>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <div
                    style={{
                      padding: "5px",
                      background: "#fff",
                      border: "none",
                      height: "40px",
                      width: "100px",
                    }}
                  >
                    <div className="dropdown">
                      <button
                        style={{
                          height: "40px",
                          width: "90px",
                          margin: "-5px 0px 0px 0px",
                          background: "#f9f9f9",
                          padding: "5px 0px 5px 5px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#000",
                        }}
                        className="btn btn-secondary"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span>
                          <img
                            src={DEFAULT_COUNTRY_FLAG}
                            style={{ height: "20px", width: "20px" }}
                            alt="Country flag"
                          />
                        </span>
                        <span
                          style={{
                            color: "#000",
                            padding: "5px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "0px 0px -5px 0px",
                            fontWeight: "500",
                            fontSize: "small",
                          }}
                        >
                          {DEFAULT_COUNTRY_CODE}
                        </span>
                      </button>
                      <ul
                        className="dropdown-menu"
                        style={{ width: "300px", overflow: "auto", height: "200px" }}
                      />
                    </div>
                  </div>
                </span>
                <span style={{ width: "calc(100% - 100px)" }}>
                  <input
                    style={{ color: "#000", width: "100%" }}
                    onInput={(e) =>
                      setPhoneNumber(`${DEFAULT_COUNTRY_CODE}${e.target.value}`)
                    }
                    type="tel"
                    maxLength={11}
                    name="phone"
                    id="phone"
                  />
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label htmlFor="password">Password</label>
              <input
                style={{ color: "#000", width: "100%" }}
                onInput={(e) => setPwd(e.target.value)}
                type="password"
                autoComplete="off"
                placeholder="Password"
                name="password"
                id="password"
              />
            </div>

            {/* Confirm Password Field */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                style={{ color: "#000", width: "100%" }}
                onInput={(e) => setConfirmPwd(e.target.value)}
                type="password"
                placeholder="Confirm Password"
                name="confirm-password"
                id="confirm-password"
              />
            </div>

            {/* Submit Button */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}
            >
              <button
                style={{ borderRadius: "8px" }}
                onClick={(e) => {
                  setProvider("local");
                  handleRegistration(e);
                }}
              >
                Register
              </button>
            </div>
          </div>
        </section>

        {/* Login Link */}
        <section className="other-reg-forms">
          <button
            style={{
              marginLeft: "0",
              background: "#fff",
              border: "none",
              color: "#00926e",
            }}
            onClick={handleLoginNavigation}
          >
            <small>Already registered? Login.</small>
          </button>
        </section>
      </div>
    </div>
  );
}
