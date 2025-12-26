defmodule NestiApi.Social.Post do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "posts" do
    field :content, :string
    field :media_urls, {:array, :string}, default: []
    field :type, :string, default: "standard"
    field :is_pinned, :boolean, default: false

    belongs_to :family, NestiApi.Families.Family
    belongs_to :author, NestiApi.Accounts.Profile

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:family_id, :author_id, :content, :media_urls, :type, :is_pinned])
    |> validate_required([:family_id, :author_id, :content])
    |> validate_length(:content, min: 1, max: 5000)
  end
end
