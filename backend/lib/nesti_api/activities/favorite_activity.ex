defmodule NestiApi.Activities.FavoriteActivity do
  @moduledoc """
  FavoriteActivity schema for user's favorite activities.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "favorite_activities" do
    belongs_to :user, NestiApi.Accounts.User
    belongs_to :activity, NestiApi.Activities.Activity

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(favorite, attrs) do
    favorite
    |> cast(attrs, [:user_id, :activity_id])
    |> validate_required([:user_id, :activity_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:activity_id)
    |> unique_constraint([:user_id, :activity_id])
  end
end
