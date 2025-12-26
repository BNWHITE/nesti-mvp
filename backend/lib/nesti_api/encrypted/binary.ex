defmodule NestiApi.Encrypted.Binary do
  @moduledoc """
  Custom Ecto type for encrypted binary fields.
  Uses Cloak for transparent encryption/decryption.
  """
  use Cloak.Ecto.Binary, vault: NestiApi.Vault
end
