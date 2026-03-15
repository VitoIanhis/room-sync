"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsuario, getToken, clearAuth } from "../../utils/auth";
import api from "../../services/api";
import DarkVeil from "../DarkVeil";
import logo from "../../logo.png";

export default function DashboardPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [totalSalas, setTotalSalas] = useState(0);
  const [carregandoSalas, setCarregandoSalas] = useState(true);
  const [reservaHoje, setReservaHoje] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
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

    async function carregarResumoSalas() {
      try {
        setCarregandoSalas(true);
        const response = await api.get("/salas");
        const lista = response?.data?.salas || [];
        setTotalSalas(lista.length);
        setSalasDashboard(lista);

        const hojeStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        let encontrada = null;

        const historico = lista
          .map((sala) => {
            if (!sala.descricao) {
              return {
                id: sala.id,
                nome: sala.nome,
                capacidade: sala.capacidade,
                data: null,
                hora: null,
              };
            }

            const desc = String(sala.descricao);
            const dataMatch = desc.match(
              /Data:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/,
            );
            const horaMatch = desc.match(/Horário:\s*([0-9]{2}:[0-9]{2})/);

            const data = dataMatch ? dataMatch[1] : null;
            const hora = horaMatch ? horaMatch[1] : null;

            if (data && hora && data === hojeStr) {
              encontrada = {
                nome: sala.nome,
                capacidade: sala.capacidade,
                data,
                hora,
              };
            }

            return {
              id: sala.id,
              nome: sala.nome,
              capacidade: sala.capacidade,
              data,
              hora,
            };
          })
          .reverse()
          .slice(0, 5);

        setReservaHoje(encontrada);
        setHistoricoReservas(historico);
      } catch (error) {
        setTotalSalas(0);
        setReservaHoje(null);
        setHistoricoReservas([]);
      } finally {
        setCarregandoSalas(false);
        setCarregando(false);
      }
    }

    carregarResumoSalas();
  }, [router]);

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
          <div className="flex items-center gap-2 text-base">
            <button
              type="button"
              onClick={() => router.push("/salas")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/10 hover:-translate-y-[1px] transition duration-200"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-base">Nova reserva</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-base font-medium text-white hover:bg-white/10 hover:-translate-y-[1px] transition duration-200"
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
                <button
                  type="button"
                  onClick={() => router.push("/salas")}
                  className="relative flex-1 text-left rounded-xl border border-white/10 bg-white/5/40 px-5 py-5 flex flex-col gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                      Reserva de hoje
                    </span>
                    <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                      🔒 Em breve
                    </span>
                  </div>
                  <p className="relative z-10 mt-2 text-sm text-white/60">
                    Visualize rapidamente a próxima reserva do dia assim que o
                    módulo de reservas estiver disponível.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/salas")}
                  className="relative flex-1 text-left rounded-xl border border-white/10 bg-white/5/40 px-5 py-5 flex flex-col gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                      Reservas ativas
                    </span>
                    <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                      🔒 Em breve
                    </span>
                  </div>
                  <p className="relative z-10 mt-2 text-sm text-white/60">
                    Aqui você verá todas as reservas que estiverem acontecendo
                    no momento.
                  </p>
                </button>

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
                      className="  gap-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-[11px] font-medium text-white hover:bg-white/10 transition duration-200"
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

              <button
                type="button"
                onClick={() => router.push("/salas")}
                className="relative h-full text-left rounded-xl border border-white/10 bg-white/5/40 px-5 py-5 flex flex-col gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                    Histórico de reservas
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                    🔒 Em breve
                  </span>
                </div>
                <p className="relative z-10 mt-2 text-sm text-white/60">
                  Em uma próxima etapa, você poderá consultar todas as reservas
                  passadas com filtros por data, sala e responsável.
                </p>
              </button>
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
