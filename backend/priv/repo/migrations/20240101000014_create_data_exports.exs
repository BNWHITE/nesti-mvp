defmodule NestiApi.Repo.Migrations.CreateDataExports do
  use Ecto.Migration

  def change do
    create table(:data_exports, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :status, :string, default: "processing", null: false  # processing, completed, failed
      add :file_path, :string
      add :expires_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:data_exports, [:user_id])
    create index(:data_exports, [:status])
    create index(:data_exports, [:expires_at])
  end
end
