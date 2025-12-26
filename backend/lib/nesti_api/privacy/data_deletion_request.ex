defmodule NestiApi.Privacy.DataDeletionRequest do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "data_deletion_requests" do
    field :status, :string, default: "pending"
    field :reason, :string
    field :completed_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.Profile

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(request, attrs) do
    request
    |> cast(attrs, [:user_id, :status, :reason, :completed_at])
    |> validate_required([:user_id, :status])
    |> validate_inclusion(:status, ["pending", "processing", "completed", "cancelled"])
  end
end
