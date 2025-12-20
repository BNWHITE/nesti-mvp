defmodule NestiApi.Repo.Migrations.CreateDeletionRequests do
  use Ecto.Migration

  def change do
    create table(:deletion_requests, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :requested_at, :utc_datetime, null: false
      add :scheduled_for, :utc_datetime, null: false  # 30 days after request
      add :status, :string, default: "pending", null: false  # pending, cancelled, completed
      add :completed_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:deletion_requests, [:user_id])
    create index(:deletion_requests, [:status])
    create index(:deletion_requests, [:scheduled_for])
  end
end
