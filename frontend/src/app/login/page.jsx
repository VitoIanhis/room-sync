"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, senha });
      const { token, usuario } = response.data;

      if (token) {
        localStorage.setItem("roomsync_token", token);
      }
      if (usuario) {
        localStorage.setItem("roomsync_usuario", JSON.stringify(usuario));
      }

      router.push("/dashboard");
    } catch (error) {
      const msg =
        error?.response?.data?.erro ||
        "Não foi possível fazer login. Verifique seus dados.";
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
          maxWidth: 400,
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          RoomSync – Login
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#555" }}>
          Acesse o sistema para gerenciar salas.
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
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
              backgroundColor: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Ainda não tem conta?{" "}
          <Link href="/register" style={{ color: "#2563eb", fontWeight: 500 }}>
            Registre-se
          </Link>
        </p>
      </div>
    </main>
  );
}

