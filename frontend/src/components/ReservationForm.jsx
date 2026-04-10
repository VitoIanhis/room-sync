"use client";

import { useState } from "react";
import { createReservation } from "../services/reservationService";
import { clearAuth } from "../utils/auth";

function compareTimes(a, b) {
  const [ha, ma] = a.split(":").map(Number);
  const [hb, mb] = b.split(":").map(Number);
  const ta = ha * 60 + ma;
  const tb = hb * 60 + mb;
  return ta - tb;
}

export default function ReservationForm({
  salas,
  router,
  onSuccess,
  disabledSalas,
}) {
  const [salaId, setSalaId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!salaId || !data || !horaInicio || !horaFim) {
      setErro("Preencha sala, data, hora de início e hora de término.");
      return;
    }

    if (compareTimes(horaFim, horaInicio) <= 0) {
      setErro("A hora de término deve ser maior que a hora de início.");
      return;
    }

    const payload = {
      sala_id: Number(salaId),
      data,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
    };

    try {
      setEnviando(true);
      await createReservation(payload);
      setHoraInicio("");
      setHoraFim("");
      if (onSuccess) onSuccess();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível criar a reserva. Tente novamente.";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition";

  const selectClass = `${inputClass} cursor-pointer !bg-[#bcbcbc]/10 !text-brand-white shadow-none [color-scheme:dark] [&_option]:bg-zinc-950 [&_option]:text-brand-white`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {erro && (
        <div className="rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-white uppercase tracking-wide">
          Sala
        </label>
        <select
          value={salaId}
          onChange={(e) => setSalaId(e.target.value)}
          required
          disabled={disabledSalas || salas.length === 0}
          className={`reservation-sala-select ${selectClass} disabled:opacity-50 disabled:!bg-[#bcbcbc]/10`}
        >
          <option value="">Selecione uma sala</option>
          {salas.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.nome} (cap. {sala.capacidade})
            </option>
          ))}
        </select>
        {salas.length === 0 && (
          <p className="text-xs text-amber-200/80">
            Não há salas cadastradas. Crie uma sala no dashboard antes de
            reservar.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-white uppercase tracking-wide">
          Data
        </label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-white uppercase tracking-wide">
            Hora início
          </label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-white uppercase tracking-wide">
            Hora fim
          </label>
          <input
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando || salas.length === 0}
        className="mt-1 w-full rounded-lg px-3 py-2 shadow-md duration-300 ease-in-out bg-brand-blue hover:bg-brand-blue/80 hover:-translate-y-1 text-sm font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {enviando ? "Salvando..." : "Criar reserva"}
      </button>
    </form>
  );
}
