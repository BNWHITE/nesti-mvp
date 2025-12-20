defmodule NestiApiWeb.UserSocket do
  use Phoenix.Socket

  alias NestiApi.Guardian

  # Channels
  channel "family:*", NestiApiWeb.FamilyChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        user_id = Map.get(claims, "sub")
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info) do
    :error
  end

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end
