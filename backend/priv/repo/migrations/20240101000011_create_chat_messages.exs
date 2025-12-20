defmodule NestiApi.Repo.Migrations.CreateChatMessages do
  use Ecto.Migration

  def change do
    create table(:chat_messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :family_id, references(:families, type: :binary_id, on_delete: :delete_all), null: false
      add :message_encrypted, :binary  # Encrypted with Cloak
      add :response_encrypted, :binary  # Encrypted with Cloak

      timestamps(type: :utc_datetime)
    end

    create index(:chat_messages, [:user_id])
    create index(:chat_messages, [:family_id])
    create index(:chat_messages, [:inserted_at])
  end
end
