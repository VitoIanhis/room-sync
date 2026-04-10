"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuario, getToken, clearAuth } from "../../utils/auth";
import api from "../../services/api";
import DarkVeil from "../DarkVeil";
import logo from "../../logo.png";

function dataLocalHoje() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Aceita TIME do Postgres (HH:MM:SS) ou input time (HH:MM). */
function minutosDesdeMeiaNoite(t) {
  if (t == null) return 0;
  const s = String(t).trim();
  const [h, min] = s.slice(0, 8).split(":");
  const hh = parseInt(h, 10);
  const mm = parseInt(min, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

function minutosAgora() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function formatarDataReserva(valor) {
  if (!valor) return "—";
  const s = String(valor).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function sliceHora(t) {
  if (t == null) return "—";
  return String(t).slice(0, 5);
}

export default function DashboardPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [totalSalas, setTotalSalas] = useState(0);
  const [carregandoSalas, setCarregandoSalas] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [carregandoReservas, setCarregandoReservas] = useState(true);
  const [salasDashboard, setSalasDashboard] = useState([]);
  const [mostrarModalSala, setMostrarModalSala] = useState(false);
  const [novaSalaNome, setNovaSalaNome] = useState("");
  const [novaSalaCapacidade, setNovaSalaCapacidade] = useState("");
  const [novaSalaErro, setNovaSalaErro] = useState("");
  const [salvandoSala, setSalvandoSala] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getUsuario();
    setUsuario(user);

    async function carregarDashboard() {
      try {
        setCarregandoSalas(true);
        setCarregandoReservas(true);
        const [salasRes, reservasRes] = await Promise.all([
          api.get("/salas"),
          api.get("/reservas"),
        ]);
        const lista = salasRes?.data?.salas || [];
        setTotalSalas(lista.length);
        setSalasDashboard(lista);
        setReservas(reservasRes?.data?.reservas || []);
      } catch (error) {
        setTotalSalas(0);
        setSalasDashboard([]);
        setReservas([]);
      } finally {
        setCarregandoSalas(false);
        setCarregandoReservas(false);
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, [router]);

  const hojeStr = dataLocalHoje();

  /** Próximas reservas: dias futuros + hoje ainda não encerrado. Hoje em destaque na lista. */
  const reservasProximas = useMemo(() => {
    const agora = minutosAgora();
    return reservas
      .filter((r) => {
        const ds = String(r.data).slice(0, 10);
        if (ds > hojeStr) return true;
        if (ds < hojeStr) return false;
        return minutosDesdeMeiaNoite(r.hora_fim) >= agora;
      })
      .sort((a, b) => {
        const da = String(a.data).slice(0, 10);
        const db = String(b.data).slice(0, 10);
        const aHoje = da === hojeStr;
        const bHoje = db === hojeStr;
        if (aHoje !== bHoje) return aHoje ? -1 : 1;
        if (da !== db) return da.localeCompare(db);
        return (
          minutosDesdeMeiaNoite(a.hora_inicio) -
          minutosDesdeMeiaNoite(b.hora_inicio)
        );
      });
  }, [reservas, hojeStr]);

  const reservasProximasHoje = useMemo(
    () =>
      reservasProximas.filter((r) => String(r.data).slice(0, 10) === hojeStr),
    [reservasProximas, hojeStr],
  );

  const reservasProximasFuturas = useMemo(
    () =>
      reservasProximas.filter((r) => String(r.data).slice(0, 10) !== hojeStr),
    [reservasProximas, hojeStr],
  );

  const listaHistoricoPassadas = useMemo(() => {
    const agora = minutosAgora();
    return reservas.filter((r) => {
      const ds = String(r.data).slice(0, 10);
      if (ds < hojeStr) return true;
      if (ds > hojeStr) return false;
      return minutosDesdeMeiaNoite(r.hora_fim) < agora;
    });
  }, [reservas, hojeStr]);

  const totalHistoricoPassadas = listaHistoricoPassadas.length;

  const historicoReservasPassadas = useMemo(() => {
    return [...listaHistoricoPassadas]
      .sort((a, b) => {
        const da = String(a.data).slice(0, 10);
        const db = String(b.data).slice(0, 10);
        if (db !== da) return db.localeCompare(da);
        return (
          minutosDesdeMeiaNoite(b.hora_inicio) -
          minutosDesdeMeiaNoite(a.hora_inicio)
        );
      })
      .slice(0, 8);
  }, [listaHistoricoPassadas]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  async function handleCriarSalaRapida(event) {
    event.preventDefault();
    setNovaSalaErro("");

    const capNumber = parseInt(novaSalaCapacidade, 10);
    if (!novaSalaNome.trim()) {
      setNovaSalaErro("Informe o nome da sala.");
      return;
    }
    if (Number.isNaN(capNumber) || capNumber < 1) {
      setNovaSalaErro("Capacidade deve ser um número inteiro maior que zero.");
      return;
    }

    try {
      setSalvandoSala(true);
      const response = await api.post("/salas", {
        nome: novaSalaNome.trim(),
        capacidade: capNumber,
        descricao: null,
      });

      const novaSala = response?.data?.sala;
      if (novaSala) {
        setSalasDashboard((prev) => [...prev, novaSala]);
        setTotalSalas((prev) => prev + 1);
      } else {
        // fallback: recarrega lista
        const recarregado = await api.get("/salas");
        setSalasDashboard(recarregado?.data?.salas || []);
        setTotalSalas(recarregado?.data?.salas?.length || 0);
      }

      setNovaSalaNome("");
      setNovaSalaCapacidade("");
      setMostrarModalSala(false);
    } catch (error) {
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível criar a sala. Verifique os dados.";
      setNovaSalaErro(msg);
    } finally {
      setSalvandoSala(false);
    }
  }

  if (carregando) {
    return (
      <main className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <DarkVeil
            hueShift={34}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.5}
            scanlineFrequency={0}
            warpAmount={0}
          />
        </div>
        <div className="relative z-10 text-sm text-white/80">
          Verificando autenticação...
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <DarkVeil
          hueShift={34}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-10 flex flex-col gap-4">
        <header className="flex items-center justify-between rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <img src={logo.src} alt="RoomSync Logo" width={32} height={32} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm uppercase tracking-[0.25em] text-white/50">
                Dashboard
              </span>
              <span className="text-base font-medium">
                {usuario
                  ? `Bem vindo${usuario.nome ? `, ${usuario.nome}` : ""}!`
                  : "Bem vindo!"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-base">
            <button
              type="button"
              onClick={() => router.push("/reservas")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/10 hover:-translate-y-px transition duration-200"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-base">Nova reserva</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/salas")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/10 hover:-translate-y-px transition duration-200"
            >
              <span className="text-base">Salas</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-base font-medium text-white hover:bg-white/10 hover:-translate-y-px transition duration-200"
            >
              <span>Sair</span>
            </button>
          </div>
        </header>

        <section className="dashboard-scroll rounded-2xl border border-white/20 w-full h-[calc(100vh-10rem)] bg-black/90 backdrop-blur-2xl px-6 py-6 shadow-[0_18px_48px_rgba(0,0,0,0.85)] overflow-y-auto overflow-x-hidden">
          <div className="min-h-full flex flex-col gap-6 text-white pr-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold">Visão geral</h2>
                <p className="text-base text-white/60 max-w-xl">
                  Acompanhe rapidamente suas reservas e salas disponíveis. Use
                  os atalhos abaixo para navegar.
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] gap-6 items-stretch">
              <div className="flex flex-col h-full gap-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/reservas")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push("/reservas");
                    }
                  }}
                  className="relative flex-1 text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200 cursor-pointer"
                >
                  <span className="text-lg uppercase flex items-center justify-between tracking-[0.18em] text-white/50">
                    Reservas
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/reservas");
                      }}
                      className="inline-flex gap-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/10 transition duration-200"
                    >
                      <span className="text-base leading-none">+</span>
                      <span className="text-sm pl-1">Nova reserva</span>
                    </button>
                  </span>
                  <span className="text-base text-white/50">
                    Próximas reservas (outros dias) e o que ainda falta hoje.
                    Itens de hoje aparecem em destaque.
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm text-white/60">
                      Total:{" "}
                      <span className="font-semibold">
                        {carregandoReservas ? "…" : reservasProximas.length}
                      </span>
                    </span>
                  </div>
                  <ul className="mt-2 space-y-2 text-base text-white">
                    {carregandoReservas && (
                      <li className="text-sm text-white/50">Carregando…</li>
                    )}
                    {!carregandoReservas && reservasProximas.length === 0 && (
                      <li className="text-sm text-white/50">
                        Nenhuma reserva futura ou pendente para hoje.
                      </li>
                    )}
                    {!carregandoReservas &&
                      reservasProximasHoje.map((r) => (
                        <li
                          key={r.id}
                          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-brand-blue/40 bg-brand-blue/10 px-3 py-2.5"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0 text-[14px] uppercase tracking-[0.12em] font-bold text-brand-blue">
                              Hoje
                            </span>
                            <span className="truncate font-normal">
                              | {r.sala_nome}
                            </span>
                          </span>
                          <span className="text-sm text-white/60 shrink-0 sm:text-right">
                            {sliceHora(r.hora_inicio)} – {sliceHora(r.hora_fim)}
                          </span>
                        </li>
                      ))}
                  </ul>
                  {reservasProximasHoje.length > 0 &&
                    reservasProximasFuturas.length > 0 && (
                      <span className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
                    )}
                  <ul className="mt-2 space-y-2 text-base text-white">
                    {!carregandoReservas &&
                      reservasProximasFuturas.map((r) => (
                        <li
                          key={r.id}
                          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                        >
                          <span className="truncate font-medium">
                            {r.sala_nome}
                          </span>
                          <span className="text-sm text-white/60 shrink-0 sm:text-right">
                            {formatarDataReserva(r.data)} ·{" "}
                            {sliceHora(r.hora_inicio)} – {sliceHora(r.hora_fim)}
                          </span>
                        </li>
                      ))}
                    {!carregandoReservas &&
                      reservasProximasFuturas.length === 0 &&
                      reservasProximasHoje.length > 0 && (
                        <li className="text-sm text-white/45 pt-1">
                          Sem outras datas agendadas.
                        </li>
                      )}
                  </ul>
                </div>

                <div
                  onClick={() => router.push("/salas")}
                  className="relative flex-1 text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200 cursor-pointer"
                >
                  <span className="text-lg uppercase flex items-center justify-between tracking-[0.18em] text-white/50">
                    Salas disponíveis
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMostrarModalSala(true);
                      }}
                      className="inline-flex gap-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/10 transition duration-200"
                    >
                      <span className="text-base leading-none">+</span>
                      <span className="text-sm pl-1">Criar sala</span>
                    </button>
                  </span>

                  <span className="text-base text-white/50">
                    Salas cadastradas no sistema.
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm text-white/60">
                      Total:{" "}
                      <span className="font-semibold">
                        {carregandoSalas ? "…" : totalSalas}
                      </span>
                    </span>
                  </div>
                  <span className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
                  <ul className="mt-1 space-y-1 text-base text-white">
                    {salasDashboard.length === 0 && !carregandoSalas && (
                      <li className="text-sm text-white/50">
                        Nenhuma sala cadastrada até o momento.
                      </li>
                    )}
                    {salasDashboard.map((sala) => (
                      <li
                        key={sala.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{sala.nome}</span>
                        <span className="text-sm text-white/50">
                          Cap: {sala.capacidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => router.push("/reservas")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push("/reservas");
                  }
                }}
                className="relative h-full min-h-[200px] text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200 cursor-pointer"
              >
                <span className="text-lg uppercase flex items-center justify-between tracking-[0.18em] text-white/50">
                  Histórico de reservas
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/reservas");
                    }}
                    className="inline-flex gap-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/10 transition duration-200"
                  >
                    <span className="text-sm">Ver todas</span>
                  </button>
                </span>
                <span className="text-base text-white/50">
                  Reservas já encerradas: dias anteriores ou intervalo de hoje
                  já concluído.
                </span>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm text-white/60">
                    Total encerradas:{" "}
                    <span className="font-semibold">
                      {carregandoReservas ? "…" : totalHistoricoPassadas}
                    </span>
                    {totalHistoricoPassadas > 8 ? (
                      <span className="text-white/45"> · últimas 8 abaixo</span>
                    ) : null}
                  </span>
                </div>
                <span className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
                <ul className="mt-1 space-y-1 text-base text-white flex-1">
                  {carregandoReservas && (
                    <li className="text-sm text-white/50">Carregando…</li>
                  )}
                  {!carregandoReservas &&
                    historicoReservasPassadas.length === 0 && (
                      <li className="text-sm text-white/50">
                        Nenhuma reserva encerrada ainda.
                      </li>
                    )}
                  {!carregandoReservas &&
                    historicoReservasPassadas.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                      >
                        <span className="truncate">{r.sala_nome}</span>
                        <span className="text-sm text-white/50 shrink-0">
                          {formatarDataReserva(r.data)} ·{" "}
                          {sliceHora(r.hora_inicio)} – {sliceHora(r.hora_fim)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {mostrarModalSala && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/80 px-6 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.9)]">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-white">
                    Nova sala
                  </h3>
                  <p className="text-xs text-white/60">
                    Informe o nome e a capacidade para criar uma nova sala.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!salvandoSala) {
                      setMostrarModalSala(false);
                      setNovaSalaErro("");
                    }
                  }}
                  className="text-white/60 hover:text-white text-sm px-1"
                >
                  ✕
                </button>
              </div>

              {novaSalaErro && (
                <div className="mb-3 rounded-lg border border-red-700/40 bg-red-900/30 px-3 py-2 text-xs text-red-200">
                  {novaSalaErro}
                </div>
              )}

              <form
                onSubmit={handleCriarSalaRapida}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Nome da sala
                  </label>
                  <input
                    type="text"
                    value={novaSalaNome}
                    onChange={(e) => setNovaSalaNome(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                    placeholder="Ex: Sala de reunião 4"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    value={novaSalaCapacidade}
                    onChange={(e) => setNovaSalaCapacidade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                    placeholder="Ex: 10"
                    min={1}
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!salvandoSala) {
                        setMostrarModalSala(false);
                        setNovaSalaErro("");
                      }
                    }}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoSala}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue/80 disabled:opacity-70 disabled:cursor-not-allowed transition duration-200"
                  >
                    {salvandoSala ? "Salvando..." : "Criar sala"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
