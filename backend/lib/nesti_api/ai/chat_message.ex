defmodule NestiApi.AI.ChatMessage do
  @moduledoc """
  ChatMessage schema for Nesti AI conversations with encryption.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "chat_messages" do
    field :message_encrypted, NestiApi.Encrypted.Binary
    field :response_encrypted, NestiApi.Encrypted.Binary

    belongs_to :user, NestiApi.Accounts.User
    belongs_to :family, NestiApi.Families.Family

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:message_encrypted, :response_encrypted, :user_id, :family_id])
    |> validate_required([:message_encrypted, :user_id, :family_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:family_id)
  end
end
