defmodule NestiApiWeb.PageController do
  use NestiApiWeb, :controller

  def index(conn, _params) do
    json(conn, %{
      message: "🏠 Bienvenue sur Nesti API v2.0",
      description: "Backend Elixir/Phoenix pour l'application Nesti",
      status: "operational",
      version: "2.0.0",
      endpoints: %{
        health: "/api/health",
        version: "/api/version",
        docs: "https://github.com/BNWHITE/nesti-mvp"
      },
      features: [
        "🔐 Authentification sécurisée",
        "👨‍👩‍👧‍👦 Gestion familiale",
        "📱 API REST complète",
        "🔒 Chiffrement end-to-end",
        "📊 Conformité RGPD"
      ]
    })
  end

  def version(conn, _params) do
    json(conn, %{
      version: "2.0.0",
      elixir: System.version(),
      phoenix: Application.spec(:phoenix, :vsn) |> to_string(),
      environment: Mix.env() |> to_string(),
      build_date: "2025-12-25"
    })
  end
end
