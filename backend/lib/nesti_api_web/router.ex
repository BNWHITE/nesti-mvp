defmodule NestiApiWeb.Router do
  use NestiApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug, origin: ["http://localhost:3000", "http://localhost:8080"]
  end

  # Root route
  scope "/", NestiApiWeb do
    pipe_through :api

    get "/", PageController, :index
  end

  # API routes
  scope "/api", NestiApiWeb do
    pipe_through :api

    get "/health", HealthController, :index
    
    # Version info
    get "/version", PageController, :version
  end
end
