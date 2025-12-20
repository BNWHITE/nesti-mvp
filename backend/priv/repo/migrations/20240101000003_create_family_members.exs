defmodule NestiApi.Repo.Migrations.CreateFamilyMembers do
  use Ecto.Migration

  def change do
    create table(:family_members, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :family_id, references(:families, type: :binary_id, on_delete: :delete_all), null: false
      add :role, :string, default: "member", null: false  # admin, member
      add :joined_at, :utc_datetime, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:family_members, [:user_id, :family_id])
    create index(:family_members, [:user_id])
    create index(:family_members, [:family_id])
    create index(:family_members, [:role])
  end
end
