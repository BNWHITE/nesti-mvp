defmodule NestiApiWeb.HealthController do
  @moduledoc """
  Health check controller for Render deployment.
  Used for:
  - Render health checks
  - Load balancer health checks
  - Monitoring systems
  """
  
  use NestiApiWeb, :controller
  
  alias NestiApi.Repo
  
  @doc """
  Basic health check - returns 200 if the service is running.
  GET /api/health
  """
  def index(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{
      status: "healthy",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      version: Application.spec(:nesti_api, :vsn) |> to_string()
    })
  end
  
  @doc """
  Deep health check - verifies database connectivity.
  GET /api/health/deep
  """
  def deep(conn, _params) do
    checks = %{
      database: check_database(),
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      version: Application.spec(:nesti_api, :vsn) |> to_string()
    }
    
    status = if all_healthy?(checks), do: :ok, else: :service_unavailable
    
    conn
    |> put_status(status)
    |> json(Map.put(checks, :status, if(status == :ok, do: "healthy", else: "unhealthy")))
  end
  
  # Private functions
  
  defp check_database do
    try do
      Repo.query!("SELECT 1")
      %{status: "healthy", latency_ms: measure_db_latency()}
    rescue
      e ->
        %{status: "unhealthy", error: Exception.message(e)}
    end
  end
  
  defp measure_db_latency do
    {time, _result} = :timer.tc(fn -> Repo.query!("SELECT 1") end)
    Float.round(time / 1000, 2)  # Convert to milliseconds
  end
  
  defp all_healthy?(checks) do
    checks
    |> Map.values()
    |> Enum.filter(&is_map/1)
    |> Enum.all?(fn check -> check[:status] == "healthy" end)
  end
end
