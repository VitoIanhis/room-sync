"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";
import { getToken, getUsuario, clearAuth } from "../../utils/auth";
import DarkVeil from "../DarkVeil";
import logo from "../../logo.png";

function SalasSelect({ value, onChange, salas }) {
  const [aberto, setAberto] = useState(false);
  const selecionada = salas.find((sala) => sala.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/ hover:border-brand-blue duration-300 ease-in-out text-sm text-brand-white outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition flex items-center justify-between"
      >
        <span className={selecionada ? "" : "text-white/40"}>
          {selecionada
            ? `${selecionada.nome} (capacidade ${selecionada.capacidade})`
            : "Selecione uma sala disponível"}
        </span>
        <span className="ml-2 text-sm text-white/60">▼</span>
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/20 bg-black/90 shadow-lg max-h-56 overflow-y-auto">
          {salas.map((sala) => (
            <button
              key={sala.id}
              type="button"
              onClick={() => {
                onChange(sala.id);
                setAberto(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-white/10 ${
                sala.id === value
                  ? "bg-white/10 text-brand-white"
                  : "text-white/80"
              }`}
            >
              <span>{sala.nome}</span>
              <span className="text-[11px] text-white/50">
                Cap: {sala.capacidade}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalasPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [carregandoSalas, setCarregandoSalas] = useState(false);
  const [salas, setSalas] = useState([]);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataReserva, setDataReserva] = useState("");
  const [horaReserva, setHoraReserva] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [criando, setCriando] = useState(false);

  const [usuario, setUsuario] = useState(null);
  const [salaSelecionadaId, setSalaSelecionadaId] = useState("");

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
    setCarregando(false);
    carregarSalas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function carregarSalas() {
    try {
      setErro("");
      setCarregandoSalas(true);
      const response = await api.get("/salas");
      setSalas(response.data.salas || []);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível carregar as salas. Tente novamente.";
      setErro(msg);
    } finally {
      setCarregandoSalas(false);
    }
  }

  async function handleCriarSala(event) {
    event.preventDefault();
    setErroForm("");

    let nomeSala = nome;
    let capacidadeSala = capacidade;

    if (salaSelecionadaId) {
      const selecionada = salasCatalogo.find(
        (sala) => sala.id === salaSelecionadaId,
      );
      if (selecionada) {
        nomeSala = selecionada.nome;
        capacidadeSala = String(selecionada.capacidade ?? "");
      }
    }

    const capNumber = parseInt(capacidadeSala, 10);
    if (Number.isNaN(capNumber) || capNumber < 1) {
      setErroForm("Capacidade deve ser um número inteiro maior que zero.");
      return;
    }

    if (!dataReserva || !horaReserva) {
      setErroForm("Informe a data e horário da reserva.");
      return;
    }

    try {
      setCriando(true);
      const metaReserva = `Data: ${dataReserva} | Horário: ${horaReserva}`;
      const descricaoComReserva = descricao
        ? `${descricao}\n${metaReserva}`
        : metaReserva;
      await api.post("/salas", {
        nome: nomeSala,
        capacidade: capNumber,
        descricao: descricaoComReserva,
      });

      setNome("");
      setCapacidade("");
      setDescricao("");
      setDataReserva("");
      setHoraReserva("");
      setSalaSelecionadaId("");
      await carregarSalas();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível criar a sala. Verifique os dados.";
      setErroForm(msg);
    } finally {
      setCriando(false);
    }
  }

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
                Reservas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-base">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/10 hover:-translate-y-[1px] transition duration-200"
            >
              <span className="text-base">Dashboard</span>
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

        <section className="rounded-2xl border border-white/20 w-full bg-black/70 backdrop-blur-2xl px-6 py-6 shadow-[0_18px_48px_rgba(0,0,0,0.85)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold">Nova reserva</h2>
                <p className="text-sm text-white/60">
                  Escolha uma sala disponível e defina a data, horário e
                  detalhes da sua reserva.
                </p>
              </div>

              {erroForm && (
                <div className="rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
                  {erroForm}
                </div>
              )}

              <form onSubmit={handleCriarSala} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Sala
                  </label>
                  <SalasSelect
                    value={salaSelecionadaId}
                    onChange={setSalaSelecionadaId}
                    salas={salasCatalogo}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Nome da reserva
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Ex: Reunião de planejamento"
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Capacidade (opcional)
                  </label>
                  <input
                    type="number"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    min={1}
                    placeholder="Deixe em branco para usar a capacidade da sala"
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white uppercase tracking-wide">
                      Data da reserva
                    </label>
                    <input
                      type="date"
                      value={dataReserva}
                      onChange={(e) => setDataReserva(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white uppercase tracking-wide">
                      Horário da reserva
                    </label>
                    <input
                      type="time"
                      value={horaReserva}
                      onChange={(e) => setHoraReserva(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white uppercase tracking-wide">
                    Descrição (opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Reunião de planejamento"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/40 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={criando}
                  className="mt-2 w-full rounded-lg px-3 py-2 shadow-md duration-300 ease-in-out bg-brand-blue hover:bg-brand-blue/80 hover:-translate-y-1 text-sm font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {criando ? "Salvando..." : "Criar reserva"}
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-3 border border-white/10 rounded-2xl bg-black/60 px-4 py-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">Salas disponíveis</h3>
                <p className="text-sm text-white/60">
                  Estas são as salas que podem ser usadas nas suas reservas.
                </p>
              </div>
              <ul className="space-y-2 text-base">
                {salasCatalogo.map((sala) => (
                  <li
                    key={sala.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{sala.nome}</span>
                      <span className="text-sm text-white/60">
                        Capacidade: {sala.capacidade} pessoas
                      </span>
                    </div>
                    <span className="text-sm text-white/40">ID: {sala.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
