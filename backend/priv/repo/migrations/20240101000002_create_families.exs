defmodule NestiApi.Repo.Migrations.CreateFamilies do
  use Ecto.Migration

  def change do
    create table(:families, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :family_name, :string, null: false
      add :description, :text
      add :emoji, :string, default: "👨‍👩‍👧‍👦"
      add :invite_code, :string, null: false
      add :subscription_type, :string, default: "free", null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:families, [:invite_code])
    create index(:families, [:subscription_type])
  end
end
