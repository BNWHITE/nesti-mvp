defmodule NestiApi.Repo.Migrations.CreateUserConsents do
  use Ecto.Migration

  def change do
    create table(:user_consents, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :consent_type, :string, null: false  # ai_usage, data_processing, marketing
      add :granted, :boolean, default: false, null: false
      add :granted_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create unique_index(:user_consents, [:user_id, :consent_type])
    create index(:user_consents, [:user_id])
    create index(:user_consents, [:consent_type])
  end
end
