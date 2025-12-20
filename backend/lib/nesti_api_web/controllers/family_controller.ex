defmodule NestiApiWeb.FamilyController do
  use NestiApiWeb, :controller

  alias NestiApi.Families

  @doc """
  POST /api/v1/families
  Creates a new family with the current user as admin.
  """
  def create(conn, params) do
    user_id = conn.assigns.current_user_id

    case Families.create_family(user_id, params) do
      {:ok, family} ->
        conn
        |> put_status(:created)
        |> json(%{
          family: %{
            id: family.id,
            family_name: family.family_name,
            description: family.description,
            emoji: family.emoji,
            invite_code: family.invite_code,
            subscription_type: family.subscription_type
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
  GET /api/v1/families/me
  Gets the current user's family.
  """
  def show_my_family(conn, _params) do
    user_id = conn.assigns.current_user_id

    case Families.get_user_family(user_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Not in a family"})

      family ->
        json(conn, %{
          family: %{
            id: family.id,
            family_name: family.family_name,
            description: family.description,
            emoji: family.emoji,
            invite_code: family.invite_code,
            subscription_type: family.subscription_type,
            members: Enum.map(family.family_members, &serialize_member/1)
          }
        })
    end
  end

  @doc """
  PUT /api/v1/families/:id
  Updates family details (admin only).
  """
  def update(conn, %{"id" => family_id} = params) do
    user_id = conn.assigns.current_user_id

    case Families.update_family(family_id, params, user_id) do
      {:ok, family} ->
        json(conn, %{
          family: %{
            id: family.id,
            family_name: family.family_name,
            description: family.description,
            emoji: family.emoji
          }
        })

      {:error, :not_admin} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Admin access required"})

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  @doc """
  POST /api/v1/families/join
  Joins a family using an invite code.
  """
  def join(conn, %{"invite_code" => invite_code}) do
    user_id = conn.assigns.current_user_id

    case Families.join_by_code(user_id, invite_code) do
      {:ok, member} ->
        conn
        |> put_status(:created)
        |> json(%{message: "Joined family successfully", member_id: member.id})

      {:error, :invalid_code} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Invalid invite code"})

      {:error, :already_in_family} ->
        conn
        |> put_status(:conflict)
        |> json(%{error: "Already in a family"})

      {:error, _} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Could not join family"})
    end
  end

  @doc """
  GET /api/v1/families/members
  Lists all members of the current user's family.
  """
  def list_members(conn, _params) do
    user_id = conn.assigns.current_user_id

    case Families.get_user_family(user_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Not in a family"})

      family ->
        members = Families.get_family_members(family.id)
        json(conn, %{members: Enum.map(members, &serialize_member/1)})
    end
  end

  @doc """
  PUT /api/v1/families/members/:id/role
  Updates a member's role (admin only).
  """
  def update_member_role(conn, %{"id" => member_user_id, "role" => new_role}) do
    user_id = conn.assigns.current_user_id

    with {:ok, family} <- get_user_family(user_id),
         {:ok, _member} <- Families.update_member_role(family.id, member_user_id, new_role, user_id) do
      json(conn, %{message: "Role updated successfully"})
    else
      {:error, :not_in_family} ->
        conn |> put_status(:not_found) |> json(%{error: "Not in a family"})

      {:error, :not_admin} ->
        conn |> put_status(:forbidden) |> json(%{error: "Admin access required"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not update role"})
    end
  end

  @doc """
  DELETE /api/v1/families/members/:id
  Removes a member from the family (admin only or self).
  """
  def remove_member(conn, %{"id" => member_user_id}) do
    user_id = conn.assigns.current_user_id

    with {:ok, family} <- get_user_family(user_id),
         {:ok, _} <- Families.remove_member(family.id, member_user_id, user_id) do
      json(conn, %{message: "Member removed successfully"})
    else
      {:error, :not_in_family} ->
        conn |> put_status(:not_found) |> json(%{error: "Not in a family"})

      {:error, :not_admin} ->
        conn |> put_status(:forbidden) |> json(%{error: "Admin access required"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not remove member"})
    end
  end

  @doc """
  POST /api/v1/families/invite-code/regenerate
  Regenerates the family invite code (admin only).
  """
  def regenerate_invite_code(conn, _params) do
    user_id = conn.assigns.current_user_id

    with {:ok, family} <- get_user_family(user_id),
         {:ok, updated_family} <- Families.generate_invite_code(family.id, user_id) do
      json(conn, %{invite_code: updated_family.invite_code})
    else
      {:error, :not_in_family} ->
        conn |> put_status(:not_found) |> json(%{error: "Not in a family"})

      {:error, :not_admin} ->
        conn |> put_status(:forbidden) |> json(%{error: "Admin access required"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not regenerate code"})
    end
  end

  # Private helpers

  defp get_user_family(user_id) do
    case Families.get_user_family(user_id) do
      nil -> {:error, :not_in_family}
      family -> {:ok, family}
    end
  end

  defp serialize_member(member) do
    %{
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      user: if member.user do
        %{
          id: member.user.id,
          first_name: member.user.first_name,
          last_name: member.user.last_name,
          avatar_url: member.user.avatar_url
        }
      else
        nil
      end
    }
  end
end
