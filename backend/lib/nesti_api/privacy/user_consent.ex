defmodule NestiApi.Privacy.UserConsent do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @purposes ["data_processing", "marketing", "analytics", "third_party_sharing"]

  schema "user_consents" do
    field :purpose, :string
    field :granted, :boolean, default: false
    field :granted_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.Profile

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user_consent, attrs) do
    user_consent
    |> cast(attrs, [:user_id, :purpose, :granted, :granted_at])
    |> validate_required([:user_id, :purpose, :granted])
    |> validate_inclusion(:purpose, @purposes)
  end
end
