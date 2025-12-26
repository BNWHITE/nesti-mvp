defmodule NestiApi.Privacy.AuditLog do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "audit_logs" do
    field :action, :string
    field :resource_type, :string
    field :resource_id, :binary_id
    field :metadata, :map, default: %{}
    field :ip_address, :string

    belongs_to :user, NestiApi.Accounts.Profile

    timestamps(inserted_at: :timestamp, updated_at: false, type: :utc_datetime)
  end

  @doc false
  def changeset(log, attrs) do
    log
    |> cast(attrs, [:user_id, :action, :resource_type, :resource_id, :metadata, :ip_address])
    |> validate_required([:action, :resource_type])
  end
end
