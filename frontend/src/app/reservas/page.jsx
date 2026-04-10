"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { getReservations } from "../../services/reservationService";
import { getToken, getUsuario, clearAuth } from "../../utils/auth";
import ReservationForm from "../../components/ReservationForm";
import ReservationList from "../../components/ReservationList";
import DarkVeil from "../DarkVeil";
import logo from "../../logo.png";

export default function ReservasPage() {
  const router = useRouter();
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [salas, setSalas] = useState([]);
  const [carregandoSalas, setCarregandoSalas] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [carregandoReservas, setCarregandoReservas] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const carregarSalas = useCallback(async () => {
    try {
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
      setSalas([]);
    } finally {
      setCarregandoSalas(false);
    }
  }, [router]);

  const carregarReservas = useCallback(async () => {
    try {
      setErroLista("");
      setCarregandoReservas(true);
      const lista = await getReservations();
      setReservas(lista);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível carregar suas reservas.";
      setErroLista(msg);
      setReservas([]);
    } finally {
      setCarregandoReservas(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setUsuario(getUsuario());
    setCarregandoAuth(false);
    carregarSalas();
    carregarReservas();
  }, [router, carregarSalas, carregarReservas]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  if (carregandoAuth) {
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
    <main className="relative flex flex-col items-center justify-center min-h-screen w-screen overflow-x-hidden overflow-y-auto py-8">
      <div className="pointer-events-none fixed inset-0 z-0">
        <DarkVeil
          hueShift={34}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 md:px-10 flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-3 text-white">
            <img src={logo.src} alt="RoomSync Logo" width={32} height={32} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm uppercase tracking-[0.25em] text-white/50">
                Reservas
              </span>
              <span className="text-base font-medium">
                {usuario?.nome
                  ? `Olá, ${usuario.nome}`
                  : "Suas reservas"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 hover:-translate-y-[1px] transition duration-200"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 hover:-translate-y-[1px] transition duration-200"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-white/20 w-full bg-black/70 backdrop-blur-2xl px-6 py-6 shadow-[0_18px_48px_rgba(0,0,0,0.85)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">Nova reserva</h2>
                <p className="text-sm text-white/60 mt-1">
                  Escolha a sala, a data e o intervalo de horário.
                </p>
              </div>
              <ReservationForm
                salas={salas}
                router={router}
                disabledSalas={carregandoSalas}
                onSuccess={carregarReservas}
              />
            </div>

            <div className="flex flex-col gap-3 border border-white/10 rounded-2xl bg-black/50 px-4 py-4">
              <div>
                <h3 className="text-xl font-semibold">Minhas reservas</h3>
                <p className="text-sm text-white/60 mt-1">
                  Sala, data e horário de cada reserva.
                </p>
              </div>
              <ReservationList
                reservas={reservas}
                carregando={carregandoReservas}
                erro={erroLista}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
