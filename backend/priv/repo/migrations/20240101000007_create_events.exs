defmodule NestiApi.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :text
      add :start_time, :utc_datetime, null: false
      add :end_time, :utc_datetime, null: false
      add :location, :string
      add :family_id, references(:families, type: :binary_id, on_delete: :delete_all), null: false
      add :creator_id, references(:users, type: :binary_id, on_delete: :nilify_all)

      timestamps(type: :utc_datetime)
    end

    create index(:events, [:family_id])
    create index(:events, [:creator_id])
    create index(:events, [:start_time])
    create index(:events, [:end_time])
  end
end
