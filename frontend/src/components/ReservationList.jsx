"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteReservation } from "../services/reservationService";
import { clearAuth } from "../utils/auth";

function formatarData(valor) {
  if (!valor) return "—";
  const s = String(valor);
  const ymd = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function formatarHora(valor) {
  if (valor == null) return "—";
  const s = String(valor);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export default function ReservationList({
  reservas,
  carregando,
  erro,
  onReservationRemoved,
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);
  const [feedbackExclusao, setFeedbackExclusao] = useState(null);

  if (carregando) {
    return (
      <p className="text-sm text-white/60">Carregando suas reservas...</p>
    );
  }

  if (erro) {
    return (
      <div className="rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
        {erro}
      </div>
    );
  }

  if (!reservas?.length) {
    return (
      <p className="text-sm text-white/60">
        Você ainda não possui reservas. Crie uma ao lado quando estiver pronto.
      </p>
    );
  }

  async function handleCancelar(reserva) {
    if (!window.confirm("Cancelar esta reserva?")) return;

    setFeedbackExclusao(null);
    setDeletingId(reserva.id);

    try {
      await deleteReservation(reserva.id);
      if (onReservationRemoved) {
        onReservationRemoved(reserva.id);
      }
      setFeedbackExclusao({ tipo: "sucesso", texto: "Reserva cancelada." });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      if (status === 404) {
        const msg =
          error?.response?.data?.erro ||
          "Reserva não encontrada ou sem permissão.";
        setFeedbackExclusao({ tipo: "erro", texto: msg });
        return;
      }
      setFeedbackExclusao({
        tipo: "erro",
        texto:
          error?.response?.data?.erro ||
          "Não foi possível cancelar a reserva. Tente novamente.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {feedbackExclusao && (
        <div
          className={
            feedbackExclusao.tipo === "sucesso"
              ? "rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200"
              : "rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300"
          }
          role="status"
        >
          {feedbackExclusao.texto}
        </div>
      )}

      <ul className="space-y-2">
        {reservas.map((r) => {
          const cancelando = deletingId === r.id;
          return (
            <li
              key={r.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0">
                <span className="font-medium text-white">{r.sala_nome}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
                  <span>
                    <span className="text-white/50">Data: </span>
                    {formatarData(r.data)}
                  </span>
                  <span>
                    <span className="text-white/50">Horário: </span>
                    {formatarHora(r.hora_inicio)} – {formatarHora(r.hora_fim)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCancelar(r)}
                disabled={cancelando}
                className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-900/30 hover:border-red-500/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cancelando ? "Cancelando..." : "Cancelar"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
