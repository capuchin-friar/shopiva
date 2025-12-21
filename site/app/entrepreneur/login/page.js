/**
 * Entrepreneur Login Page
 * 
 * Login form for entrepreneur authentication.
 * Supports both local and Google OAuth login.
 * 
 * @module app/entrepreneur/login/page
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

// Utilities
import { entrepreneur_overlay_setup } from "../../../reusables/overlay";
import { setNewCookie } from "app/layout";

// ============================================================================
// CONSTANTS
// ============================================================================

/** API endpoint for login */
const LOGIN_ENDPOINT = "http://localhost:3456/entrepreneur/login";

/** Google OAuth login endpoint */
const GOOGLE_LOGIN_ENDPOINT = "https://shopiva-server.onrender.com/entrepreneur/login";

// ============================================================================
// LOGIN PAGE COMPONENT
// ============================================================================

/**
 * Entrepreneur login page component
 * 
 * @returns {JSX.Element} The login form
 */
export default function Login() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const session = useSession();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  
  // Validation reference
  const validation = useRef(false);
  const book = useRef({
    email: false,
    pwd: false,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Handles Google OAuth session authentication
   */
  useEffect(() => {
    if (session.status !== "authenticated") return;

    fetch(GOOGLE_LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({
        email: session.data.user.email,
        provider: "google",
      }),
    })
      .then(async (result) => {
        const response = await result.json();

        if (response.bool) {
          setNewCookie(response.cookie, 1);
          window.location.href = "/entrepreneur";
          entrepreneur_overlay_setup(false, "Try Again...");
        } else {
          handleLoginError(response.data);
          entrepreneur_overlay_setup(false, "Try Again...");
        }
      })
      .catch((err) => {
        console.error("Google login error:", err);
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
    // Remove existing error message
    const existingError = pElem.querySelector(".err-mssg");
    if (existingError) {
      existingError.remove();
    }

    // Add new error if exists
    if (err.length > 0) {
      const div = document.createElement("div");
      div.className = "err-mssg";
      div.innerHTML = err[0].mssg;
      pElem.append(div);
    }
  };

  /**
   * Handles login error responses
   * @param {string} errorType - Type of error from API
   */
  const handleLoginError = (errorType) => {
    if (errorType === "duplicate email") {
      addErrMssg(
        [{ mssg: "Email already exists, please try something else" }],
        document.querySelector(".email")?.parentElement
      );
    } else if (errorType === "duplicate phone") {
      addErrMssg(
        [{ mssg: "Phone number already exists, please try something else" }],
        document.querySelector(".phone")?.parentElement
      );
    } else {
      addErrMssg(
        [{ mssg: "Password is not correct..." }],
        document.querySelector(".pwd")?.parentElement
      );
    }
  };

  /**
   * Validates form inputs
   */
  const validateForm = () => {
    const inputs = [...document.querySelectorAll("input")];

    inputs.forEach((item) => {
      if (item.type === "text" && item.name === "email") {
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

      if (item.type === "password" && item.name === "password") {
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
    });
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles form submission for local login
   * @param {Event} e - Click event
   */
  const handleLogin = (e) => {
    try {
      e.target.disabled = true;

      validateForm();
      
      // Check if all validations passed
      const allValid = Object.values(book.current).every((val) => val === true);
      validation.current = allValid;

      if (!validation.current) {
        e.target.disabled = false;
        return;
      }

      entrepreneur_overlay_setup(true, "One Moment Please...");

      fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({ email, pwd, provider: "local" }),
      })
        .then(async (result) => {
          const response = await result.json();

          if (response.bool) {
            e.target.disabled = false;
            setNewCookie(response.cookie, 1);
            window.location.href = "/entrepreneur";
            entrepreneur_overlay_setup(false, "Try Again...");
          } else {
            handleLoginError(response.data);
            e.target.disabled = false;
            entrepreneur_overlay_setup(false, "Try Again...");
          }
        })
        .catch((err) => {
          console.error("Login error:", err);
          e.target.disabled = false;
        });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  /**
   * Handles Google OAuth login
   */
  const handleGoogleLogin = () => {
    signIn("google", { redirect: false });
  };

  /**
   * Navigates to signup page
   */
  const handleSignupNavigation = () => {
    window.location.href = "/entrepreneur/signup";
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

          {/* Google Login Button */}
          <div style={{ display: "flex", width: "auto" }}>
            <button
              onClick={handleGoogleLogin}
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

        {/* Login Form */}
        <section style={{ height: "auto" }}>
          <div style={{ width: "100%" }}>
            {/* Email Input */}
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

            {/* Password Input */}
            <div
              className="input-cnt"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label htmlFor="password">Password</label>
              <input
                style={{ color: "#000", width: "100%" }}
                onInput={(e) => setPwd(e.target.value)}
                type="password"
                placeholder="Password"
                className="pwd"
                name="password"
                id="password"
              />
            </div>

            {/* Submit Button */}
            <div className="input-cnt">
              <button
                style={{ borderRadius: "8px", background: "#00926e" }}
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </section>

        {/* Signup Link */}
        <section className="other-reg-forms">
          <button
            style={{
              marginLeft: "0",
              background: "#fff",
              border: "none",
              color: "#00926e",
            }}
            onClick={handleSignupNavigation}
          >
            <small>Not registered? Signup.</small>
          </button>
        </section>
      </div>
    </div>
  );
}
