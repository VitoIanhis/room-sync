"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "../../services/api";
import DarkVeil from "../DarkVeil";
import logo from "../../logo.png";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      await api.post("/register", { nome, email, senha });
      setSucesso("Cadastro realizado com sucesso! Você já pode fazer login.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível realizar o cadastro. Verifique os dados.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
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

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mx-4">
        <p
          className="text-2xl font-semibold text-white text-center"
          style={{ fontFamily: "'Kaisei Opti', serif" }}
        >
          Crie sua conta
        </p>
        <div className="w-full flex flex-col gap-2 rounded-2xl space-y-2 py-4 px-5 border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          <div className="flex justify-center">
            <Image
              src={logo}
              alt="RoomSync Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>

          <p className="text-base text-white font-bold mb-4 text-center">
            RoomSync – Registro
          </p>
          <p className="text-sm text-white mb-4 text-center">
            Crie sua conta para acessar o sistema.
          </p>

          {erro && (
            <div className="rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300 text-center">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200 text-center">
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white uppercase tracking-wide">
                Nome
              </label>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                minLength={2}
                className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/30 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white uppercase tracking-wide">
                E-mail
              </label>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/30 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white uppercase tracking-wide">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pr-10 px-3 py-2 rounded-lg border-2 border-white/20 bg-[#bcbcbc]/10 hover:border-brand-blue duration-300 ease-in-out transform focus:-translate-y-1 text-sm text-brand-white placeholder-white/30 outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 hover:text-white"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.86 2.86-5.08 5.06-6.5" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.11 11 8-.46 1.3-1.09 2.5-1.86 3.57" />
                      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rounded-lg px-3 py-2 shadow-md duration-300 ease-in-out bg-brand-blue hover:bg-brand-blue/80 hover:-translate-y-1 text-sm font-semibold text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Criar conta"}
            </button>
          </form>

          <p className="text-left text-xs text-white -mt-2 mb-2">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="hover:-translate-y-0.5 duration-500 font-semibold text-[#4C78BC] nav-link relative inline-block transition-all"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
