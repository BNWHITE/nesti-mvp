defmodule NestiApi.Activities.Activity do
  @moduledoc """
  Activity schema for discovering family activities.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "activities" do
    field :title, :string
    field :description, :string
    field :category, :string
    field :location, :string
    field :price, :decimal
    field :rating, :decimal
    field :tags, {:array, :string}
    field :is_public, :boolean

    has_many :favorites, NestiApi.Activities.FavoriteActivity

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(activity, attrs) do
    activity
    |> cast(attrs, [:title, :description, :category, :location, :price, :rating, :tags, :is_public])
    |> validate_required([:title, :category])
    |> validate_inclusion(:category, [
      "outdoor", "indoor", "sport", "culture", "entertainment", "education", "other"
    ])
    |> validate_number(:rating, greater_than_or_equal_to: 0, less_than_or_equal_to: 5)
  end
end
