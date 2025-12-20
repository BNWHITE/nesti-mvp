defmodule NestiApi.Families do
  @moduledoc """
  The Families context handles family management and membership.
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Families.{Family, FamilyMember}

  @doc """
  Creates a family with the creator as admin.
  """
  def create_family(user_id, attrs \\ %{}) do
    Repo.transaction(fn ->
      with {:ok, family} <- create_family_record(attrs),
           {:ok, _member} <- add_member(family.id, user_id, "admin") do
        family
      else
        {:error, changeset} -> Repo.rollback(changeset)
      end
    end)
  end

  defp create_family_record(attrs) do
    %Family{}
    |> Family.creation_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets the family for a given user.
  """
  def get_user_family(user_id) do
    query =
      from f in Family,
        join: fm in FamilyMember,
        on: fm.family_id == f.id,
        where: fm.user_id == ^user_id,
        preload: [family_members: :user]

    Repo.one(query)
  end

  @doc """
  Gets a family by ID.
  """
  def get_family(id) do
    Family
    |> preload([family_members: :user])
    |> Repo.get(id)
  end

  @doc """
  Gets a family by invite code.
  """
  def get_family_by_invite_code(code) do
    Repo.get_by(Family, invite_code: code)
  end

  @doc """
  Joins a family using an invite code.
  """
  def join_by_code(user_id, invite_code) do
    with {:ok, family} <- find_family_by_code(invite_code),
         {:ok, _existing} <- check_not_already_member(user_id),
         {:ok, member} <- add_member(family.id, user_id, "member") do
      {:ok, member}
    end
  end

  defp find_family_by_code(code) do
    case get_family_by_invite_code(code) do
      nil -> {:error, :invalid_code}
      family -> {:ok, family}
    end
  end

  defp check_not_already_member(user_id) do
    case get_user_family(user_id) do
      nil -> {:ok, :not_member}
      _family -> {:error, :already_in_family}
    end
  end

  defp add_member(family_id, user_id, role) do
    %FamilyMember{}
    |> FamilyMember.creation_changeset(%{
      family_id: family_id,
      user_id: user_id,
      role: role
    })
    |> Repo.insert()
  end

  @doc """
  Gets all members of a family.
  """
  def get_family_members(family_id) do
    FamilyMember
    |> where([fm], fm.family_id == ^family_id)
    |> preload(:user)
    |> order_by([fm], asc: fm.joined_at)
    |> Repo.all()
  end

  @doc """
  Updates a member's role (admin only).
  """
  def update_member_role(family_id, user_id, new_role, requester_id) do
    with {:ok, _} <- verify_admin(family_id, requester_id),
         {:ok, member} <- find_member(family_id, user_id) do
      member
      |> FamilyMember.changeset(%{role: new_role})
      |> Repo.update()
    end
  end

  @doc """
  Removes a member from a family (admin only, or self-removal).
  """
  def remove_member(family_id, user_id, requester_id) do
    cond do
      user_id == requester_id ->
        # Self-removal is always allowed
        do_remove_member(family_id, user_id)

      true ->
        # Admin removing another member
        with {:ok, _} <- verify_admin(family_id, requester_id) do
          do_remove_member(family_id, user_id)
        end
    end
  end

  defp do_remove_member(family_id, user_id) do
    case find_member(family_id, user_id) do
      {:ok, member} -> Repo.delete(member)
      error -> error
    end
  end

  defp verify_admin(family_id, user_id) do
    query =
      from fm in FamilyMember,
        where: fm.family_id == ^family_id and fm.user_id == ^user_id and fm.role == "admin"

    case Repo.one(query) do
      nil -> {:error, :not_admin}
      member -> {:ok, member}
    end
  end

  defp find_member(family_id, user_id) do
    query =
      from fm in FamilyMember,
        where: fm.family_id == ^family_id and fm.user_id == ^user_id

    case Repo.one(query) do
      nil -> {:error, :member_not_found}
      member -> {:ok, member}
    end
  end

  @doc """
  Regenerates the invite code for a family (admin only).
  """
  def generate_invite_code(family_id, requester_id) do
    with {:ok, _} <- verify_admin(family_id, requester_id),
         {:ok, family} <- find_family(family_id) do
      family
      |> Family.creation_changeset(%{})
      |> Repo.update()
    end
  end

  defp find_family(family_id) do
    case Repo.get(Family, family_id) do
      nil -> {:error, :family_not_found}
      family -> {:ok, family}
    end
  end

  @doc """
  Updates a family.
  """
  def update_family(family_id, attrs, requester_id) do
    with {:ok, _} <- verify_admin(family_id, requester_id),
         {:ok, family} <- find_family(family_id) do
      family
      |> Family.changeset(attrs)
      |> Repo.update()
    end
  end
end
