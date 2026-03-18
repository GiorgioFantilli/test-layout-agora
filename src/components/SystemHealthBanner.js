import React from "react";
import { useSystemHealth } from "../hooks/useEmails";

/**
 * Banner che mostra avvisi persistenti sullo stato dei servizi (LLM, DB).
 * Appare solo quando almeno un servizio è degradato, scompare automaticamente
 * al ripristino. Non richiedibile: riflette lo stato corrente in tempo reale.
 */
export default function SystemHealthBanner() {
  const { data: health } = useSystemHealth();

  if (!health || health.status === "ok") return null;

  const issues = [];

  if (health.llm && health.llm !== "ok") {
    if (health.llm_circuit === "OPEN") {
      issues.push({
        level: "warn",
        icon: "fas fa-circle-pause",
        title: "Servizio AI sospeso",
        detail:
          "Il modello AI non ha risposto ripetutamente — le analisi sono in pausa. Il sistema riproverà automaticamente.",
      });
    } else {
      issues.push({
        level: "warn",
        icon: "fas fa-brain",
        title: "Modello AI non raggiungibile",
        detail:
          "Le nuove analisi AI (classificazione, rilevanza, sintesi) non possono essere elaborate al momento.",
      });
    }
  }

  if (health.db && health.db !== "ok") {
    issues.push({
      level: "error",
      icon: "fas fa-database",
      title: "Errore database",
      detail: "Connessione al database non disponibile — alcune funzionalità potrebbero non rispondere.",
    });
  }

  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col gap-0">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-2 text-sm border-b ${
            issue.level === "error"
              ? "bg-red-50 border-red-300 text-red-800"
              : "bg-amber-50 border-amber-300 text-amber-800"
          }`}
        >
          <i className={`${issue.icon} mt-0.5 shrink-0`} />
          <span>
            <span className="font-semibold">{issue.title}</span>
            {" — "}
            {issue.detail}
          </span>
        </div>
      ))}
    </div>
  );
}
