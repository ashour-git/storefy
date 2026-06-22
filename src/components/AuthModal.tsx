"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "./AppProvider";
import { authClient } from "../lib/auth-client";

export function AuthModal() {
  const { authModal, closeAuth, openLogin, openSignup, t, dir } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const isLogin = authModal === "login";
  const isOpen = authModal !== null;

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setEmail("");
        setPassword("");
        setName("");
        setError("");
        setSuccess("");
      });
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [isOpen, authModal]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeAuth]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeAuth();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const result = await authClient.signIn.email({
          email,
          password,
        });
        if (result.error) {
          setError(t("auth_error_invalid"));
        } else {
          closeAuth();
          window.location.href = '/admin';
        }
      } else {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (result.error) {
          setError(result.error.message || t("auth_error_generic"));
        } else {
          setSuccess(t("auth_success_signup"));
          setTimeout(() => {
            closeAuth();
            window.location.href = '/admin';
          }, 1200);
        }
      }
    } catch {
      setError(t("auth_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="auth-overlay"
      dir={dir}
    >
      <div className="auth-modal">
        {/* Close button */}
        <button
          onClick={closeAuth}
          className="auth-close"
          aria-label="Close"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="auth-logo">S</div>
          <h2 className="auth-title">
            {isLogin ? t("auth_login_title") : t("auth_signup_title")}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? t("auth_login_sub") : t("auth_signup_sub")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-name">{t("auth_name")}</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                dir={dir}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">{t("auth_email")}</label>
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">{t("auth_password")}</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              dir="ltr"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : isLogin ? (
              t("auth_login_btn")
            ) : (
              t("auth_signup_btn")
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin ? t("auth_no_account") : t("auth_has_account")}{" "}
          </span>
          <button
            type="button"
            onClick={() => (isLogin ? openSignup() : openLogin())}
          >
            {isLogin ? t("auth_switch_signup") : t("auth_switch_login")}
          </button>
        </div>
      </div>
    </div>
  );
}
