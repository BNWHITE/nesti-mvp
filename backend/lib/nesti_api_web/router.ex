defmodule NestiApiWeb.Router do
  use NestiApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", NestiApiWeb do
    pipe_through :api
    
    # Health checks (pas d'auth requise)
    get "/health", HealthController, :index
    get "/health/deep", HealthController, :deep
    
    # Autres routes à ajouter ici
  end
end
