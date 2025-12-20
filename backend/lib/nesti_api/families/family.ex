defmodule NestiApi.Families.Family do
  @moduledoc """
  Family schema representing a family group in the Nesti app.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "families" do
    field :family_name, :string
    field :description, :string
    field :emoji, :string
    field :invite_code, :string
    field :subscription_type, :string

    has_many :family_members, NestiApi.Families.FamilyMember
    has_many :posts, NestiApi.Content.Post
    has_many :events, NestiApi.Calendar.Event
    has_many :chat_messages, NestiApi.AI.ChatMessage

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(family, attrs) do
    family
    |> cast(attrs, [:family_name, :description, :emoji, :subscription_type])
    |> validate_required([:family_name])
    |> validate_length(:family_name, min: 2, max: 100)
    |> validate_inclusion(:subscription_type, ["free", "premium"])
  end

  @doc false
  def creation_changeset(family, attrs) do
    family
    |> changeset(attrs)
    |> put_change(:invite_code, generate_invite_code())
  end

  defp generate_invite_code do
    # Generate a 8-character alphanumeric code
    :crypto.strong_rand_bytes(6)
    |> Base.encode32()
    |> binary_part(0, 8)
    |> String.upcase()
  end
end
