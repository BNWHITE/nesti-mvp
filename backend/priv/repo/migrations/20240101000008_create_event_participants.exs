defmodule NestiApi.Repo.Migrations.CreateEventParticipants do
  use Ecto.Migration

  def change do
    create table(:event_participants, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :event_id, references(:events, type: :binary_id, on_delete: :delete_all), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :status, :string, default: "pending", null: false  # pending, accepted, declined

      timestamps(type: :utc_datetime)
    end

    create unique_index(:event_participants, [:event_id, :user_id])
    create index(:event_participants, [:event_id])
    create index(:event_participants, [:user_id])
    create index(:event_participants, [:status])
  end
end
