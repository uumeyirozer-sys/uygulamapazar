"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("Mesajınız mock olarak alındı. Gerçek iletişim altyapısı eklendiğinde bu form aktif olacaktır.");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="market-card p-6 md:p-7">
      <div className="mb-6">
        <p className="tag-text text-brand-red">İletişim</p>
        <h2 className="mt-2 text-2xl font-black text-brand-black">Bize ulaşın</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">Sorularınız, iş birlikleri ve platform bildirimleri için mock iletişim formu.</p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-brand-black">E-posta</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
            placeholder="ornek@uygulamapazar.com"
            type="email"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-brand-black">Konu</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
            placeholder="İletişim konusu"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-brand-black">Mesaj</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-36 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-brand-red/50 focus:bg-brand-white"
            placeholder="Mesajınızı yazın"
            required
          />
        </label>
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Gönder
        </button>
        {success ? <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-brand-red ring-1 ring-red-100">{success}</div> : null}
      </div>
    </form>
  );
}
