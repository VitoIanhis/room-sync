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
  const salasCatalogo = [
    { id: "sala-1", nome: "Sala 1", capacidade: 10 },
    { id: "sala-2", nome: "Sala 2", capacidade: 6 },
    { id: "sala-3", nome: "Sala 3", capacidade: 20 },
  ];

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
        <header className="flex items-center justify-between rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.75)]">
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

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] gap-6">
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/salas")}
                  className="text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-2 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200"
                >
                  <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                    Reserva de hoje
                  </span>
                  {carregandoSalas ? (
                    <span className="text-sm text-white/60">Carregando…</span>
                  ) : reservaHoje ? (
                    <>
                      <span className="text-lg font-semibold">
                        {reservaHoje.hora} • {reservaHoje.nome}
                      </span>
                      <span className="text-base text-white/50">
                        Capacidade: {reservaHoje.capacidade} pessoas • Data:{" "}
                        {new Date(reservaHoje.data).toLocaleDateString("pt-BR")}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-semibold">
                        Nenhuma reserva para hoje
                      </span>
                      <span className="text-base text-white/50">
                        Crie uma nova reserva informando data e horário na tela
                        de salas.
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/salas")}
                  className="text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-2 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200"
                >
                  <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                    Reservas ativas
                  </span>
                  <span className="text-2xl font-semibold">
                    {carregandoSalas ? "…" : totalSalas}
                  </span>
                  <span className="text-base text-white/50">
                    Quantidade total de reservas cadastradas no sistema.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/salas")}
                  className="text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200"
                >
                  <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                    Salas disponíveis
                  </span>
                  <span className="text-base text-white/50">
                    Catálogo de salas que podem ser usadas nas reservas.
                  </span>
                  <span className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
                  <ul className="mt-1 space-y-1 text-base text-white">
                    {salasCatalogo.map((sala) => (
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
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push("/salas")}
                className="h-full text-left rounded-xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:bg-white/10 hover:-translate-y-[2px] transition duration-200"
              >
                <span className="text-lg uppercase tracking-[0.18em] text-white/50">
                  Histórico de reservas
                </span>
                <span className="text-base text-white/50">
                  Últimas reservas cadastradas.
                </span>
                <span className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
                {carregandoSalas ? (
                  <p className="text-sm text-white/60 mt-1">Carregando…</p>
                ) : historicoReservas.length === 0 ? (
                  <p className="text-sm text-white/60 mt-1">
                    Nenhuma reserva cadastrada ainda.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-base text-white/70">
                    {historicoReservas.map((reserva) => (
                      <li
                        key={reserva.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-lg text-white font-medium">
                            {reserva.nome}
                          </span>
                          <span className="text-base text-white/50">
                            {reserva.data
                              ? new Date(reserva.data).toLocaleDateString(
                                  "pt-BR",
                                )
                              : "Data não informada"}
                            {reserva.hora && ` • ${reserva.hora}`}
                          </span>
                        </div>
                        <span className="text-sm text-white/40 whitespace-nowrap">
                          Cap: {reserva.capacidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
