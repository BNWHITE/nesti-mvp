defmodule NestiApi.Repo.Migrations.CreatePosts do
  use Ecto.Migration

  def change do
    create table(:posts, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :content_encrypted, :binary  # Encrypted content with Cloak
      add :author_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :family_id, references(:families, type: :binary_id, on_delete: :delete_all), null: false
      add :type, :string, default: "text", null: false  # text, photo, video
      add :media_url, :string

      timestamps(type: :utc_datetime)
    end

    create index(:posts, [:author_id])
    create index(:posts, [:family_id])
    create index(:posts, [:type])
    create index(:posts, [:inserted_at])
  end
end
