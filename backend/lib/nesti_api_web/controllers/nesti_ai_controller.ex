defmodule NestiApiWeb.NestiAIController do
  use NestiApiWeb, :controller

  alias NestiApi.AI

  def chat(conn, %{"message_encrypted" => message_encrypted}) do
    user_id = conn.assigns.current_user_id

    case AI.chat(user_id, message_encrypted) do
      {:ok, chat_message} ->
        conn
        |> put_status(:created)
        |> json(%{
          message: %{
            id: chat_message.id,
            message_encrypted: chat_message.message_encrypted,
            response_encrypted: chat_message.response_encrypted,
            inserted_at: chat_message.inserted_at
          }
        })

      {:error, :consent_required} ->
        conn |> put_status(:forbidden) |> json(%{error: "AI usage consent required"})

      {:error, :parental_consent_required} ->
        conn |> put_status(:forbidden) |> json(%{error: "Parental consent required for minors"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not process chat"})
    end
  end

  def history(conn, params) do
    user_id = conn.assigns.current_user_id
    page = Map.get(params, "page", "1") |> String.to_integer()
    per_page = Map.get(params, "per_page", "50") |> String.to_integer()

    messages = AI.get_chat_history(user_id, page: page, per_page: per_page)
    
    json(conn, %{
      messages: Enum.map(messages, fn msg ->
        %{
          id: msg.id,
          message_encrypted: msg.message_encrypted,
          response_encrypted: msg.response_encrypted,
          inserted_at: msg.inserted_at
        }
      end)
    })
  end

  def clear_history(conn, _params) do
    user_id = conn.assigns.current_user_id

    case AI.clear_history(user_id) do
      {:ok, :cleared} ->
        json(conn, %{message: "Chat history cleared"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not clear history"})
    end
  end

  def suggestions(conn, _params) do
    user_id = conn.assigns.current_user_id

    case AI.get_suggestions(user_id) do
      {:ok, suggestions} ->
        json(conn, %{suggestions: suggestions})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not get suggestions"})
    end
  end
end
