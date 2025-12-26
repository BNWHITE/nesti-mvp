defmodule NestiApi.Privacy.DataExport do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "data_exports" do
    field :format, :string, default: "json"
    field :status, :string, default: "pending"
    field :file_url, :string
    field :expires_at, :utc_datetime

    belongs_to :user, NestiApi.Accounts.Profile

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(export, attrs) do
    export
    |> cast(attrs, [:user_id, :format, :status, :file_url, :expires_at])
    |> validate_required([:user_id, :format, :status])
    |> validate_inclusion(:format, ["json", "csv", "xml"])
    |> validate_inclusion(:status, ["pending", "processing", "completed", "failed"])
  end
end
