defmodule NestiApi.Accounts.User do
  @moduledoc """
  User schema with encrypted sensitive fields for RGPD compliance.
  
  Privacy features:
  - Email, first_name, last_name encrypted at rest
  - Password hashed with Argon2id
  - Parental consent tracking for minors
  - RGPD consent tracking
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "users" do
    field :email, NestiApi.Encrypted.Binary
    field :email_hash, :string
    field :first_name, NestiApi.Encrypted.Binary
    field :last_name, NestiApi.Encrypted.Binary
    field :full_name, :string, virtual: true
    field :avatar_url, :string
    field :password, :string, virtual: true
    field :password_hash, :string
    field :date_of_birth, :date
    field :parental_consent_given, :boolean, default: false
    field :parental_consent_date, :utc_datetime
    field :email_verified, :boolean, default: false
    field :email_verified_at, :utc_datetime
    field :last_sign_in_at, :utc_datetime
    field :role, :string, default: "user"

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:first_name, :last_name, :avatar_url, :date_of_birth])
    |> validate_required([:first_name, :last_name])
    |> generate_full_name()
  end

  @doc false
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :password, :first_name, :last_name, :date_of_birth, :parental_consent_given])
    |> validate_required([:email, :password, :first_name, :last_name])
    |> validate_email()
    |> validate_password()
    |> validate_parental_consent()
    |> hash_password()
    |> hash_email()
    |> generate_full_name()
  end

  defp validate_email(changeset) do
    changeset
    |> validate_required([:email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unsafe_validate_unique(:email_hash, NestiApi.Repo)
    |> unique_constraint(:email_hash)
  end

  defp validate_password(changeset) do
    changeset
    |> validate_required([:password])
    |> validate_length(:password, min: 12, message: "must be at least 12 characters")
    |> validate_format(:password, ~r/[a-z]/, message: "must contain at least one lowercase letter")
    |> validate_format(:password, ~r/[A-Z]/, message: "must contain at least one uppercase letter")
    |> validate_format(:password, ~r/[0-9]/, message: "must contain at least one number")
    |> validate_format(:password, ~r/[!?@#$%^&*_0-9]/, message: "must contain at least one special character")
  end

  defp hash_password(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    change(changeset, password_hash: Argon2.hash_pwd_salt(password))
  end

  defp hash_password(changeset), do: changeset

  defp hash_email(%Ecto.Changeset{valid?: true, changes: %{email: email}} = changeset) do
    # Store hash of email for unique constraints while keeping email encrypted
    email_hash = :crypto.hash(:sha256, String.downcase(email)) |> Base.encode16(case: :lower)
    change(changeset, email_hash: email_hash)
  end

  defp hash_email(changeset), do: changeset

  defp generate_full_name(changeset) do
    first = get_change(changeset, :first_name) || get_field(changeset, :first_name)
    last = get_change(changeset, :last_name) || get_field(changeset, :last_name)

    if first && last do
      put_change(changeset, :full_name, "#{first} #{last}")
    else
      changeset
    end
  end

  defp validate_parental_consent(changeset) do
    date_of_birth = get_change(changeset, :date_of_birth)

    if date_of_birth do
      age = Date.diff(Date.utc_today(), date_of_birth) / 365

      if age < 16 do
        parental_consent = get_change(changeset, :parental_consent_given) || false

        if parental_consent do
          put_change(changeset, :parental_consent_date, DateTime.utc_now())
        else
          add_error(changeset, :parental_consent_given, "is required for users under 16 years old")
        end
      else
        changeset
      end
    else
      changeset
    end
  end
end
