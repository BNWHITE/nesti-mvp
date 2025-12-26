defmodule NestiApi.Guardian do
  @moduledoc """
  Guardian implementation for JWT authentication.
  
  Provides secure JWT tokens with short expiration times (15 minutes)
  and refresh token support for enhanced security.
  """
  use Guardian, otp_app: :nesti_api

  alias NestiApi.Accounts

  def subject_for_token(%{id: id}, _claims) do
    {:ok, to_string(id)}
  end

  def subject_for_token(_, _) do
    {:error, :invalid_subject}
  end

  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user(id) do
      nil -> {:error, :resource_not_found}
      user -> {:ok, user}
    end
  end

  def resource_from_claims(_claims) do
    {:error, :invalid_claims}
  end

  # Simplified callbacks without Guardian.DB dependency
  # Token persistence is handled via Supabase/database directly if needed
  def after_encode_and_sign(_resource, _claims, token, _options) do
    {:ok, token}
  end

  def on_verify(claims, _token, _options) do
    {:ok, claims}
  end

  def on_refresh({old_token, old_claims}, {new_token, new_claims}, _options) do
    {:ok, {old_token, old_claims}, {new_token, new_claims}}
  end

  def on_revoke(claims, _token, _options) do
    {:ok, claims}
  end
end
