defmodule NestiApi.Repo.Migrations.CreateAuditLogs do
  use Ecto.Migration

  def change do
    create table(:audit_logs, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :nilify_all)
      add :action, :string, null: false
      add :resource_type, :string, null: false
      add :resource_id, :binary_id
      add :metadata, :map, default: %{}
      add :ip_address, :string

      timestamps(type: :utc_datetime, updated_at: false)
    end

    create index(:audit_logs, [:user_id])
    create index(:audit_logs, [:action])
    create index(:audit_logs, [:resource_type])
    create index(:audit_logs, [:inserted_at])
  end
end
