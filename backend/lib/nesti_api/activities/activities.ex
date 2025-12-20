defmodule NestiApi.Activities do
  @moduledoc """
  The Activities context handles activity discovery and favorites.
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Activities.{Activity, FavoriteActivity}

  @doc """
  Searches activities with filters.
  """
  def search_activities(filters \\ %{}) do
    query = from(a in Activity, where: a.is_public == true)

    query =
      case Map.get(filters, :category) do
        nil -> query
        category -> where(query, [a], a.category == ^category)
      end

    query =
      case Map.get(filters, :search) do
        nil -> query
        search_term ->
          search = "%#{search_term}%"
          where(query, [a], ilike(a.title, ^search) or ilike(a.description, ^search))
      end

    query =
      case Map.get(filters, :min_rating) do
        nil -> query
        min_rating -> where(query, [a], a.rating >= ^min_rating)
      end

    query =
      case Map.get(filters, :max_price) do
        nil -> query
        max_price -> where(query, [a], a.price <= ^max_price)
      end

    query
    |> order_by([a], desc: a.rating)
    |> limit(50)
    |> Repo.all()
  end

  @doc """
  Gets a single activity.
  """
  def get_activity(id) do
    Repo.get(Activity, id)
  end

  @doc """
  Toggles favorite status for an activity.
  """
  def toggle_favorite(user_id, activity_id) do
    query =
      from f in FavoriteActivity,
        where: f.user_id == ^user_id and f.activity_id == ^activity_id

    case Repo.one(query) do
      nil -> add_favorite(user_id, activity_id)
      favorite -> Repo.delete(favorite)
    end
  end

  defp add_favorite(user_id, activity_id) do
    %FavoriteActivity{}
    |> FavoriteActivity.changeset(%{user_id: user_id, activity_id: activity_id})
    |> Repo.insert()
  end

  @doc """
  Gets user's favorite activities.
  """
  def get_user_favorites(user_id) do
    FavoriteActivity
    |> where([f], f.user_id == ^user_id)
    |> join(:inner, [f], a in Activity, on: f.activity_id == a.id)
    |> select([f, a], a)
    |> order_by([f], desc: f.inserted_at)
    |> Repo.all()
  end

  @doc """
  Gets activity recommendations based on user's favorites.
  Simple implementation - returns highly rated activities in favorite categories.
  """
  def get_recommendations(user_id) do
    favorite_categories =
      from(f in FavoriteActivity,
        join: a in Activity,
        on: f.activity_id == a.id,
        where: f.user_id == ^user_id,
        select: a.category,
        distinct: true
      )
      |> Repo.all()

    case favorite_categories do
      [] ->
        # No favorites yet, return top-rated activities
        Activity
        |> where([a], a.is_public == true)
        |> order_by([a], desc: a.rating)
        |> limit(10)
        |> Repo.all()

      categories ->
        # Return top activities from favorite categories that user hasn't favorited
        favorited_ids =
          from(f in FavoriteActivity,
            where: f.user_id == ^user_id,
            select: f.activity_id
          )
          |> Repo.all()

        Activity
        |> where([a], a.is_public == true)
        |> where([a], a.category in ^categories)
        |> where([a], a.id not in ^favorited_ids)
        |> order_by([a], desc: a.rating)
        |> limit(10)
        |> Repo.all()
    end
  end
end
