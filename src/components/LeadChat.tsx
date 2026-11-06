"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { saveLead } from "@/lib/firebase-client";
import styles from "./LeadChat.module.css";

type ChatStage = "question" | "form" | "declined" | "success";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function LeadChat({
  cookieBannerVisible,
}: {
  cookieBannerVisible: boolean;
}) {
  const [stage, setStage] = useState<ChatStage>("question");
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!consent) {
      setError("É necessário concordar com o contato para enviar seus dados.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setError("Informe um número de WhatsApp válido com DDD.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveLead({
        name,
        phone,
        email,
        objective: null,
        amountType: null,
        amount: null,
        source: "chatbot",
        consent: true,
      });
      setStage("success");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar seus dados. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      className={`${styles.widget} ${
        cookieBannerVisible ? styles.aboveCookieBanner : ""
      }`}
    >
      {isOpen ? (
        <section
          aria-label="Chat de atendimento Damasceno"
          className={styles.panel}
        >
          <header className={styles.header}>
            <span className={styles.avatar} aria-hidden="true">
              D
            </span>
            <div>
              <strong>Atendimento Damasceno</strong>
              <small>Assistente virtual</small>
            </div>
            <button
              aria-label="Minimizar chat"
              className={styles.minimize}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              −
            </button>
          </header>

          <div aria-live="polite" className={styles.content}>
            <p className={styles.message}>
              {stage === "question" &&
                "Você está buscando opções para rentabilizar seu patrimônio hoje?"}
              {stage === "form" &&
                "Ótimo! Deixe seus dados para nossa equipe entender seu objetivo e falar com você."}
              {stage === "declined" &&
                "Tudo bem! Se quiser conversar com nossa equipe, é só chamar."}
              {stage === "success" &&
                "Pronto! Recebemos seu contato. Nossa equipe Damasceno falará com você."}
            </p>

            {stage === "question" && (
              <div className={styles.answers}>
                <button onClick={() => setStage("form")} type="button">
                  Sim
                </button>
                <button
                  className={styles.secondary}
                  onClick={() => setStage("declined")}
                  type="button"
                >
                  Não agora
                </button>
              </div>
            )}

            {stage === "declined" && (
              <button
                className={styles.restart}
                onClick={() => setStage("question")}
                type="button"
              >
                Quero conversar
              </button>
            )}

            {stage === "form" && (
              <form className={styles.form} onSubmit={submitLead}>
                <label>
                  Nome
                  <input
                    autoComplete="name"
                    maxLength={120}
                    onChange={(event) => setName(event.target.value)}
                    required
                    value={name}
                  />
                </label>
                <label>
                  WhatsApp com DDD
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={15}
                    onChange={(event) =>
                      setPhone(formatPhone(event.target.value))
                    }
                    placeholder="(00) 00000-0000"
                    required
                    value={phone}
                  />
                </label>
                <label>
                  E-mail
                  <input
                    autoComplete="email"
                    maxLength={254}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </label>
                <label className={styles.consent}>
                  <input
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    required
                    type="checkbox"
                  />
                  <span>
                    Concordo que a equipe Damasceno use meus dados para entrar
                    em contato.
                  </span>
                </label>
                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
                <button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando..." : "Quero receber contato"}
                </button>
              </form>
            )}
          </div>
        </section>
      ) : (
        <button
          className={styles.launcher}
          onClick={() => setIsOpen(true)}
          type="button"
        >
          Falar com a Damasceno
        </button>
      )}
    </aside>
  );
}
