defmodule NestiApi.Repo.Migrations.CreateFavoriteActivities do
  use Ecto.Migration

  def change do
    create table(:favorite_activities, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :activity_id, references(:activities, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:favorite_activities, [:user_id, :activity_id])
    create index(:favorite_activities, [:user_id])
    create index(:favorite_activities, [:activity_id])
  end
end
