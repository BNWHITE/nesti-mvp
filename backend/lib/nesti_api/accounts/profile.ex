defmodule NestiApi.Accounts.Profile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: false}
  @foreign_key_type :binary_id

  schema "profiles" do
    field :email, :string
    field :first_name, :string
    field :last_name, :string
    field :full_name, :string
    field :avatar_url, :string

    has_many :family_members, NestiApi.Families.FamilyMember, foreign_key: :user_id
    has_many :families, through: [:family_members, :family]

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(profile, attrs) do
    profile
    |> cast(attrs, [:id, :email, :first_name, :last_name, :full_name, :avatar_url])
    |> validate_required([:id, :email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> unique_constraint(:email)
  end
end
