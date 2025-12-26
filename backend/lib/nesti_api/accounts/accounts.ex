defmodule NestiApi.Accounts do
  @moduledoc """
  The Accounts context handles user authentication and profile management.
  
  Privacy by Design:
  - Passwords hashed with Argon2id (state of the art)
  - Personal data encrypted at rest with AES-256
  - Email verification required
  - Parental consent for minors < 16 years
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Accounts.User

  @doc """
  Returns the list of users.
  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.
  """
  def get_user(id), do: Repo.get(User, id)

  @doc """
  Gets a user by email.
  """
  def get_user_by_email(email) when is_binary(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Creates a user with encrypted password using Argon2id.
  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.
  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user (RGPD Right to be Forgotten).
  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Authenticates a user with email and password.
  Returns {:ok, user} if credentials are valid, {:error, reason} otherwise.
  """
  def authenticate_user(email, password) do
    user = get_user_by_email(email)

    cond do
      user && Argon2.verify_pass(password, user.password_hash) ->
        {:ok, user}

      user ->
        Argon2.no_user_verify()
        {:error, :invalid_credentials}

      true ->
        Argon2.no_user_verify()
        {:error, :invalid_credentials}
    end
  end

  @doc """
  Checks if user is a minor (< 16 years old for EU RGPD).
  """
  def minor?(user) do
    if user.date_of_birth do
      age = Date.diff(Date.utc_today(), user.date_of_birth) / 365
      age < 16
    else
      false
    end
  end

  @doc """
  Checks if parental consent is required and given.
  """
  def parental_consent_valid?(user) do
    !minor?(user) || user.parental_consent_given
  end
end
