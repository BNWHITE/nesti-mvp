defmodule NestiApi.Privacy.DataExport do
  @moduledoc """
  DataExport schema for RGPD data portability.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "data_exports" do
    field :status, :string
    field :file_path, :string
    field :expires_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(data_export, attrs) do
    data_export
    |> cast(attrs, [:user_id, :status, :file_path, :expires_at])
    |> validate_required([:user_id, :status])
    |> validate_inclusion(:status, ["processing", "completed", "failed"])
    |> foreign_key_constraint(:user_id)
  end
end
