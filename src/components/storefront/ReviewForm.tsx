"use client";

import { useState } from "react";
import type React from "react";

export function ReviewForm({ storeSlug, productId, locale }: { storeSlug: string; productId: string; locale: "ar" | "en" }) {
  const [rating, setRating] = useState("5");
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/storefront/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeSlug, productId, rating, authorName, body }),
    });
    setMessage(response.ok ? (locale === "ar" ? "تم إرسال التقييم للمراجعة." : "Review submitted for moderation.") : (locale === "ar" ? "تعذر إرسال التقييم." : "Could not submit review."));
    if (response.ok) setBody("");
  };

  return (
    <form onSubmit={submit} className="store-review-form">
      <h3>{locale === "ar" ? "اكتب تقييمك" : "Write a review"}</h3>
      <div className="store-review-row">
        <select value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select>
        <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder={locale === "ar" ? "اسمك" : "Your name"} />
      </div>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={locale === "ar" ? "كيف كانت تجربتك؟" : "How was your experience?"} required />
      <button type="submit" className="store-submit-btn">{locale === "ar" ? "إرسال للمراجعة" : "Submit for moderation"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
