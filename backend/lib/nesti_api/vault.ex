defmodule NestiApi.Vault do
  @moduledoc """
  Encryption vault for sensitive data using Cloak.
  
  This module provides AES-256-GCM encryption for data at rest,
  ensuring RGPD compliance and privacy by design.
  """
  use Cloak.Vault, otp_app: :nesti_api
end
