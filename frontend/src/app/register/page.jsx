"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f4f4f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          RoomSync – Registro
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#555" }}>
          Crie sua conta para acessar o sistema.
        </p>

        {erro && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: 4,
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: 4,
              backgroundColor: "#dcfce7",
              color: "#15803d",
              fontSize: "0.9rem",
            }}
          >
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <label style={{ fontSize: "0.9rem" }}>
            Nome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
              style={{
                width: "100%",
                marginTop: "0.25rem",
                padding: "0.5rem 0.75rem",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
              }}
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: "0.25rem",
                padding: "0.5rem 0.75rem",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
              }}
            />
          </label>

          <label style={{ fontSize: "0.9rem" }}>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                marginTop: "0.25rem",
                padding: "0.5rem 0.75rem",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 0.75rem",
              borderRadius: 4,
              border: "none",
              backgroundColor: loading ? "#94a3b8" : "#16a34a",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#2563eb", fontWeight: 500 }}>
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}

