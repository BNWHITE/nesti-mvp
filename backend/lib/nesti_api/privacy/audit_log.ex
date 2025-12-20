defmodule NestiApi.Privacy.AuditLog do
  @moduledoc """
  AuditLog schema for tracking user actions for RGPD compliance.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "audit_logs" do
    field :action, :string
    field :resource_type, :string
    field :resource_id, :binary_id
    field :metadata, :map
    field :ip_address, :string

    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime, updated_at: false)
  end

  @doc false
  def changeset(audit_log, attrs) do
    audit_log
    |> cast(attrs, [:user_id, :action, :resource_type, :resource_id, :metadata, :ip_address])
    |> validate_required([:action, :resource_type])
    |> foreign_key_constraint(:user_id)
  end
end
