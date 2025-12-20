defmodule NestiApi.Privacy.DeletionRequest do
  @moduledoc """
  DeletionRequest schema for RGPD right to be forgotten.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "deletion_requests" do
    field :requested_at, :utc_datetime
    field :scheduled_for, :utc_datetime
    field :status, :string
    field :completed_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(deletion_request, attrs) do
    deletion_request
    |> cast(attrs, [:user_id, :requested_at, :scheduled_for, :status, :completed_at])
    |> validate_required([:user_id, :requested_at, :scheduled_for, :status])
    |> validate_inclusion(:status, ["pending", "cancelled", "completed"])
    |> foreign_key_constraint(:user_id)
  end
end
