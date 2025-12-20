defmodule NestiApi.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      NestiApi.Repo,
      # Start the Telemetry supervisor
      NestiApiWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: NestiApi.PubSub},
      # Start the Endpoint (http/https)
      NestiApiWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: NestiApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    NestiApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
