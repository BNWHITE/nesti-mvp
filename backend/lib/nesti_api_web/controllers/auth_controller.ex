defmodule NestiApiWeb.AuthController do
  use NestiApiWeb, :controller

  alias NestiApi.{Accounts, Guardian}

  @doc """
  POST /api/v1/auth/register
  Registers a new user with encrypted personal data.
  """
  def register(conn, params) do
    case Accounts.create_user(params) do
      {:ok, user} ->
        {:ok, access_token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "access")
        {:ok, refresh_token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "refresh")

        conn
        |> put_resp_cookie("access_token", access_token, http_only: true, secure: true, same_site: "Strict", max_age: 15 * 60)
        |> put_resp_cookie("refresh_token", refresh_token, http_only: true, secure: true, same_site: "Strict", max_age: 7 * 24 * 60 * 60)
        |> put_status(:created)
        |> json(%{
          user: %{
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url
          }
        })

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  @doc """
  POST /api/v1/auth/login
  Authenticates a user and sets HttpOnly cookies.
  """
  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.authenticate_user(email, password) do
      {:ok, user} ->
        {:ok, access_token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "access")
        {:ok, refresh_token, _claims} = Guardian.encode_and_sign(user, %{}, token_type: "refresh")

        # Update last sign in
        Accounts.update_user(user, %{last_sign_in_at: DateTime.utc_now()})

        conn
        |> put_resp_cookie("access_token", access_token, http_only: true, secure: true, same_site: "Strict", max_age: 15 * 60)
        |> put_resp_cookie("refresh_token", refresh_token, http_only: true, secure: true, same_site: "Strict", max_age: 7 * 24 * 60 * 60)
        |> json(%{
          user: %{
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url
          }
        })

      {:error, :invalid_credentials} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})
    end
  end

  @doc """
  POST /api/v1/auth/logout
  Clears authentication cookies.
  """
  def logout(conn, _params) do
    conn
    |> delete_resp_cookie("access_token")
    |> delete_resp_cookie("refresh_token")
    |> json(%{message: "Logged out successfully"})
  end

  @doc """
  POST /api/v1/auth/refresh
  Refreshes the access token using refresh token.
  """
  def refresh_token(conn, _params) do
    with {:ok, refresh_token} <- get_refresh_token(conn),
         {:ok, _old_claims, {new_access_token, _new_claims}} <- Guardian.refresh(refresh_token, ttl: {15, :minutes}) do
      conn
      |> put_resp_cookie("access_token", new_access_token, http_only: true, secure: true, same_site: "Strict", max_age: 15 * 60)
      |> json(%{message: "Token refreshed"})
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid refresh token"})
    end
  end

  defp get_refresh_token(conn) do
    case conn.cookies["refresh_token"] do
      nil -> {:error, :no_token}
      token -> {:ok, token}
    end
  end

  @doc """
  GET /api/v1/auth/me
  Returns current authenticated user.
  """
  def me(conn, _params) do
    user_id = conn.assigns.current_user_id
    user = Accounts.get_user(user_id)

    if user do
      json(conn, %{
        user: %{
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url,
          date_of_birth: user.date_of_birth,
          email_verified: user.email_verified
        }
      })
    else
      conn
      |> put_status(:not_found)
      |> json(%{error: "User not found"})
    end
  end

  @doc """
  POST /api/v1/auth/forgot-password
  Initiates password reset flow (placeholder).
  """
  def forgot_password(conn, %{"email" => _email}) do
    # In production, this would:
    # 1. Find user by email
    # 2. Generate reset token
    # 3. Send email with reset link
    # For now, just return success to avoid enumeration attacks
    json(conn, %{message: "If the email exists, a reset link has been sent"})
  end

  @doc """
  POST /api/v1/auth/reset-password
  Resets password with token (placeholder).
  """
  def reset_password(conn, %{"token" => _token, "password" => _password}) do
    # In production, this would:
    # 1. Verify token
    # 2. Update password
    # 3. Invalidate token
    json(conn, %{message: "Password reset successful"})
  end

  @doc """
  POST /api/v1/auth/oauth/google
  Google OAuth authentication (placeholder).
  """
  def google_oauth(conn, %{"id_token" => _id_token}) do
    # In production, this would:
    # 1. Verify Google ID token
    # 2. Extract user info
    # 3. Create or find user
    # 4. Generate JWT tokens
    json(conn, %{message: "OAuth not yet implemented"})
  end
end
