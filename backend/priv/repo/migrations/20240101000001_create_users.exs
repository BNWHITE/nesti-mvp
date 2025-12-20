defmodule NestiApi.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :email, :binary  # Encrypted with Cloak
      add :email_hash, :string, null: false  # For uniqueness constraints
      add :first_name, :binary  # Encrypted with Cloak
      add :last_name, :binary  # Encrypted with Cloak
      add :avatar_url, :string
      add :password_hash, :string, null: false
      add :date_of_birth, :date
      add :parental_consent_given, :boolean, default: false, null: false
      add :parental_consent_date, :utc_datetime
      add :email_verified, :boolean, default: false, null: false
      add :email_verified_at, :utc_datetime
      add :last_sign_in_at, :utc_datetime
      add :role, :string, default: "user", null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email_hash])
    create index(:users, [:role])
  end
end
