defmodule NestiApi.Repo.Migrations.CreateActivities do
  use Ecto.Migration

  def change do
    create table(:activities, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :text
      add :category, :string, null: false
      add :location, :string
      add :price, :decimal, precision: 10, scale: 2
      add :rating, :decimal, precision: 3, scale: 2
      add :tags, {:array, :string}, default: []
      add :is_public, :boolean, default: true, null: false

      timestamps(type: :utc_datetime)
    end

    create index(:activities, [:category])
    create index(:activities, [:is_public])
    create index(:activities, [:rating])
  end
end
