defmodule NestiApi.AI do
  @moduledoc """
  The AI context handles Nesti AI chat functionality with privacy safeguards.
  
  CRITICAL: This module enforces:
  - User consent verification for AI usage
  - Parental consent for minors
  - Message encryption
  - Content filtering for minors
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.AI.ChatMessage
  alias NestiApi.{Families, Accounts, Privacy}

  @doc """
  Processes a chat message with consent verification.
  
  Note: This is a placeholder implementation. In production, this would:
  1. Call OpenAI API
  2. Apply content filtering for minors
  3. Store encrypted messages
  """
  def chat(user_id, message_encrypted) do
    with {:ok, _} <- verify_consent(user_id),
         {:ok, family} <- get_user_family(user_id),
         {:ok, response} <- generate_ai_response(message_encrypted, user_id) do
      save_chat_message(user_id, family.id, message_encrypted, response)
    end
  end

  defp verify_consent(user_id) do
    # Check AI usage consent
    case Privacy.get_user_consent(user_id, "ai_usage") do
      nil -> {:error, :consent_required}
      consent ->
        if consent.granted do
          # Also check parental consent for minors
          verify_parental_consent(user_id)
        else
          {:error, :consent_required}
        end
    end
  end

  defp verify_parental_consent(user_id) do
    case Accounts.get_user(user_id) do
      nil -> {:error, :user_not_found}
      user ->
        if Accounts.minor?(user) && !Accounts.parental_consent_valid?(user) do
          {:error, :parental_consent_required}
        else
          {:ok, :consent_valid}
        end
    end
  end

  defp get_user_family(user_id) do
    case Families.get_user_family(user_id) do
      nil -> {:error, :not_in_family}
      family -> {:ok, family}
    end
  end

  defp generate_ai_response(message_encrypted, user_id) do
    # PLACEHOLDER: In production, this would:
    # 1. Decrypt message
    # 2. Call OpenAI API
    # 3. Apply content filtering for minors
    # 4. Encrypt response
    # For now, return a mock encrypted response
    
    user = Accounts.get_user(user_id)
    is_minor = Accounts.minor?(user)
    
    mock_response = if is_minor do
      "Je suis Nesti, votre assistant familial adapté aux jeunes. Comment puis-je vous aider aujourd'hui ?"
    else
      "Bonjour ! Je suis Nesti, votre assistant familial. Comment puis-je vous aider aujourd'hui ?"
    end
    
    {:ok, mock_response}
  end

  defp save_chat_message(user_id, family_id, message_encrypted, response_encrypted) do
    %ChatMessage{}
    |> ChatMessage.changeset(%{
      user_id: user_id,
      family_id: family_id,
      message_encrypted: message_encrypted,
      response_encrypted: response_encrypted
    })
    |> Repo.insert()
  end

  @doc """
  Gets chat history for a user with pagination.
  """
  def get_chat_history(user_id, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 50)
    offset = (page - 1) * per_page

    ChatMessage
    |> where([cm], cm.user_id == ^user_id)
    |> order_by([cm], desc: cm.inserted_at)
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
  end

  @doc """
  Clears chat history for a user (RGPD right to erasure).
  """
  def clear_history(user_id) do
    ChatMessage
    |> where([cm], cm.user_id == ^user_id)
    |> Repo.delete_all()
    
    {:ok, :cleared}
  end

  @doc """
  Gets activity suggestions based on family context.
  This is a simplified version - production would use AI recommendations.
  """
  def get_suggestions(user_id) do
    # Return mock suggestions for now
    suggestions = [
      "Créer un événement familial",
      "Découvrir des activités près de chez vous",
      "Partager un moment avec la famille",
      "Planifier un weekend"
    ]
    
    {:ok, suggestions}
  end
end
