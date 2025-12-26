defmodule NestiApi.Families.Family do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "families" do
    field :name, :string
    field :description, :string
    field :emoji, :string, default: "👨‍👩‍👧‍👦"
    
    belongs_to :creator, NestiApi.Accounts.Profile, foreign_key: :created_by, type: :binary_id
    has_many :family_members, NestiApi.Families.FamilyMember
    has_many :members, through: [:family_members, :user]
    has_many :posts, NestiApi.Social.Post

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(family, attrs) do
    family
    |> cast(attrs, [:name, :description, :emoji, :created_by])
    |> validate_required([:name, :created_by])
    |> validate_length(:name, min: 2, max: 100)
  end
end
