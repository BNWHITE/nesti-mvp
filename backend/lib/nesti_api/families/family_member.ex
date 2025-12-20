defmodule NestiApi.Families.FamilyMember do
  @moduledoc """
  FamilyMember schema representing a user's membership in a family.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "family_members" do
    field :role, :string
    field :joined_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.User
    belongs_to :family, NestiApi.Families.Family

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(family_member, attrs) do
    family_member
    |> cast(attrs, [:user_id, :family_id, :role, :joined_at])
    |> validate_required([:user_id, :family_id, :role])
    |> validate_inclusion(:role, ["admin", "member"])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:family_id)
    |> unique_constraint([:user_id, :family_id])
  end

  @doc false
  def creation_changeset(family_member, attrs) do
    family_member
    |> changeset(attrs)
    |> put_change(:joined_at, DateTime.utc_now())
  end
end
