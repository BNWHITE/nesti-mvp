defmodule NestiApiWeb.Plugs.AuthPipeline do
  @moduledoc """
  Authentication pipeline plug that verifies JWT tokens from cookies.
  """
  import Plug.Conn
  import Phoenix.Controller

  alias NestiApi.Guardian

  def init(opts), do: opts

  def call(conn, _opts) do
    with {:ok, token} <- get_token_from_cookie(conn),
         {:ok, claims} <- Guardian.decode_and_verify(token),
         {:ok, user_id} <- get_user_id(claims) do
      conn
      |> assign(:current_user_id, user_id)
      |> assign(:claims, claims)
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("401.json", %{error: "Unauthorized"})
        |> halt()
    end
  end

  defp get_token_from_cookie(conn) do
    case conn.cookies["access_token"] do
      nil -> {:error, :no_token}
      token -> {:ok, token}
    end
  end

  defp get_user_id(claims) do
    case Map.get(claims, "sub") do
      nil -> {:error, :invalid_claims}
      user_id -> {:ok, user_id}
    end
  end
end
