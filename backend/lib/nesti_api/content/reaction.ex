defmodule NestiApi.Content.Reaction do
  @moduledoc """
  Reaction schema for posts (emoji reactions).
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "reactions" do
    field :emoji, :string

    belongs_to :post, NestiApi.Content.Post
    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [:emoji, :post_id, :user_id])
    |> validate_required([:emoji, :post_id, :user_id])
    |> validate_length(:emoji, min: 1, max: 10)
    |> foreign_key_constraint(:post_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint([:post_id, :user_id, :emoji])
  end
end
