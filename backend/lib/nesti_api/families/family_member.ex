defmodule NestiApi.Families.FamilyMember do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @roles ["admin", "parent", "ado", "enfant"]

  schema "family_members" do
    field :role, :string

    belongs_to :family, NestiApi.Families.Family
    belongs_to :user, NestiApi.Accounts.Profile

    timestamps(inserted_at: :joined_at, type: :utc_datetime)
  end

  @doc false
  def changeset(family_member, attrs) do
    family_member
    |> cast(attrs, [:family_id, :user_id, :role])
    |> validate_required([:family_id, :user_id, :role])
    |> validate_inclusion(:role, @roles)
    |> unique_constraint([:family_id, :user_id])
  end

  def roles, do: @roles
end
