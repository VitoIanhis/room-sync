"use client";

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

export default function ReservationList({ reservas, carregando, erro }) {
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

  return (
    <ul className="space-y-2">
      {reservas.map((r) => (
        <li
          key={r.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
        >
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
        </li>
      ))}
    </ul>
  );
}
