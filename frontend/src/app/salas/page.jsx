"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api";
import { getToken, getUsuario, clearAuth } from "../../utils/auth";

export default function SalasPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [carregandoSalas, setCarregandoSalas] = useState(false);
  const [salas, setSalas] = useState([]);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [criando, setCriando] = useState(false);

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

    const capNumber = parseInt(capacidade, 10);
    if (Number.isNaN(capNumber) || capNumber < 1) {
      setErroForm("Capacidade deve ser um número inteiro maior que zero.");
      return;
    }

    try {
      setCriando(true);
      await api.post("/salas", {
        nome,
        capacidade: capNumber,
        descricao: descricao || null,
      });

      setNome("");
      setCapacidade("");
      setDescricao("");
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
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem" }}>RoomSync – Salas</h1>
          <nav
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Link
              href="/dashboard"
              style={{ fontSize: "0.9rem", color: "#e5e7eb" }}
            >
              Dashboard
            </Link>
          </nav>
        </div>

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

      <section style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            Criar nova sala
          </h2>
          <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
            Preencha os campos abaixo para cadastrar uma nova sala.
          </p>

          {erroForm && (
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
              {erroForm}
            </div>
          )}

          <form
            onSubmit={handleCriarSala}
            style={{
              display: "grid",
              gap: "0.75rem",
              maxWidth: 480,
              backgroundColor: "#fff",
              padding: "1.25rem",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <label style={{ fontSize: "0.9rem" }}>
              Nome da sala
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
              Capacidade
              <input
                type="number"
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
                required
                min={1}
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
              Descrição (opcional)
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "0.25rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 4,
                  border: "1px solid #d4d4d8",
                  resize: "vertical",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={criando}
              style={{
                marginTop: "0.25rem",
                padding: "0.6rem 0.75rem",
                borderRadius: 4,
                border: "none",
                backgroundColor: criando ? "#94a3b8" : "#16a34a",
                color: "#fff",
                fontWeight: 600,
                cursor: criando ? "default" : "pointer",
              }}
            >
              {criando ? "Salvando..." : "Criar sala"}
            </button>
          </form>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
            Salas cadastradas
          </h2>
          <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
            A listagem abaixo mostra todas as salas registradas no sistema.
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

          {carregandoSalas ? (
            <p>Carregando salas...</p>
          ) : salas.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              Nenhuma sala cadastrada até o momento.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "0.75rem",
              }}
            >
              {salas.map((sala) => (
                <div
                  key={sala.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: "1rem",
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {sala.nome}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#4b5563",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Capacidade: <strong>{sala.capacidade}</strong> pessoas
                    </p>
                    {sala.descricao && (
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          maxWidth: 500,
                        }}
                      >
                        {sala.descricao}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                    }}
                  >
                    ID: {sala.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

