defmodule NestiApi.Content.Comment do
  @moduledoc """
  Comment schema for posts with encryption.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "comments" do
    field :content_encrypted, NestiApi.Encrypted.Binary

    belongs_to :post, NestiApi.Content.Post
    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(comment, attrs) do
    comment
    |> cast(attrs, [:content_encrypted, :post_id, :user_id])
    |> validate_required([:content_encrypted, :post_id, :user_id])
    |> foreign_key_constraint(:post_id)
    |> foreign_key_constraint(:user_id)
  end
end
