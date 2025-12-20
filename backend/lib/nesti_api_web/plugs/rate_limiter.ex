defmodule NestiApiWeb.Plugs.RateLimiter do
  @moduledoc """
  Rate limiting plug using Hammer for API protection.
  
  Rate limits by endpoint type:
  - Auth (login/register): 5 req/min per IP
  - API general: 100 req/min per user
  - AI Chat: 20 req/min per user
  - Upload média: 10 req/min per user
  """
  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  def init(opts), do: opts

  def call(conn, _opts) do
    identifier = get_identifier(conn)
    limit = get_limit_for_path(conn.request_path)

    case Hammer.check_rate(identifier, limit.window_ms, limit.max_requests) do
      {:allow, _count} ->
        conn

      {:deny, _limit} ->
        conn
        |> put_status(:too_many_requests)
        |> json(%{error: "Rate limit exceeded. Please try again later."})
        |> halt()
    end
  end

  defp get_identifier(conn) do
    # Use user_id if authenticated, otherwise use IP
    case conn.assigns[:current_user] do
      nil -> "ip:#{get_client_ip(conn)}"
      user -> "user:#{user.id}"
    end
  end

  defp get_client_ip(conn) do
    case Plug.Conn.get_req_header(conn, "x-forwarded-for") do
      [ip | _] -> ip
      _ -> to_string(:inet_parse.ntoa(conn.remote_ip))
    end
  end

  defp get_limit_for_path(path) do
    cond do
      String.contains?(path, "/api/auth") ->
        %{window_ms: 60_000, max_requests: 5}

      String.contains?(path, "/api/ai/chat") ->
        %{window_ms: 60_000, max_requests: 20}

      String.contains?(path, "/api/upload") ->
        %{window_ms: 60_000, max_requests: 10}

      true ->
        %{window_ms: 60_000, max_requests: 100}
    end
  end
end
