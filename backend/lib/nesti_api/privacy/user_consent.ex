defmodule NestiApi.Privacy.UserConsent do
  @moduledoc """
  UserConsent schema for tracking user consent for various data processing purposes.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "user_consents" do
    field :consent_type, :string
    field :granted, :boolean
    field :granted_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(consent, attrs) do
    consent
    |> cast(attrs, [:user_id, :consent_type, :granted, :granted_at])
    |> validate_required([:user_id, :consent_type, :granted])
    |> validate_inclusion(:consent_type, ["ai_usage", "data_processing", "marketing"])
    |> foreign_key_constraint(:user_id)
    |> unique_constraint([:user_id, :consent_type])
  end
end
