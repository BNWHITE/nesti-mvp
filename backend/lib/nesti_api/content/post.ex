defmodule NestiApi.Content.Post do
  @moduledoc """
  Post schema for family content sharing with encryption.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "posts" do
    field :content_encrypted, NestiApi.Encrypted.Binary
    field :type, :string
    field :media_url, :string

    belongs_to :author, NestiApi.Accounts.User
    belongs_to :family, NestiApi.Families.Family
    has_many :comments, NestiApi.Content.Comment
    has_many :reactions, NestiApi.Content.Reaction

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:content_encrypted, :type, :media_url, :author_id, :family_id])
    |> validate_required([:content_encrypted, :type, :author_id, :family_id])
    |> validate_inclusion(:type, ["text", "photo", "video"])
    |> foreign_key_constraint(:author_id)
    |> foreign_key_constraint(:family_id)
  end
end
