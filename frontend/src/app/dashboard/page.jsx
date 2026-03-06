"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsuario, getToken, clearAuth } from "../../utils/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getUsuario();
    setUsuario(user);
    setCarregando(false);
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  if (carregando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p>Verificando autenticação...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f4f4f5",
      }}
    >
      <header
        style={{
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#111827",
          color: "#e5e7eb",
        }}
      >
        <h1 style={{ fontSize: "1.25rem" }}>RoomSync – Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {usuario && (
            <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Logado como <strong>{usuario.nome || usuario.email}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 4,
              border: "1px solid #f97316",
              backgroundColor: "#111827",
              color: "#f97316",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <section style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
          Bem-vindo(a) ao RoomSync
        </h2>
        <p style={{ marginBottom: "1.5rem", color: "#4b5563", maxWidth: 560 }}>
          Este é um dashboard simples da AC1. A partir dele você poderá acessar
          a listagem e criação de salas (implementadas nos próximos entregáveis).
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/salas"
            style={{
              padding: "0.9rem 1.1rem",
              borderRadius: 6,
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            Ir para salas
          </Link>
        </div>
      </section>
    </main>
  );
}

