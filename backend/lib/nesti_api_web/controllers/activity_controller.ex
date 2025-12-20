defmodule NestiApiWeb.ActivityController do
  use NestiApiWeb, :controller

  alias NestiApi.Activities

  def search(conn, params) do
    filters = %{
      category: Map.get(params, "category"),
      search: Map.get(params, "search"),
      min_rating: Map.get(params, "min_rating"),
      max_price: Map.get(params, "max_price")
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Map.new()

    activities = Activities.search_activities(filters)
    json(conn, %{activities: Enum.map(activities, &serialize_activity/1)})
  end

  def show(conn, %{"id" => activity_id}) do
    case Activities.get_activity(activity_id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Activity not found"})

      activity ->
        json(conn, %{activity: serialize_activity(activity)})
    end
  end

  def toggle_favorite(conn, %{"id" => activity_id}) do
    user_id = conn.assigns.current_user_id

    case Activities.toggle_favorite(user_id, activity_id) do
      {:ok, _} ->
        json(conn, %{message: "Favorite toggled"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not toggle favorite"})
    end
  end

  def remove_favorite(conn, %{"id" => activity_id}) do
    user_id = conn.assigns.current_user_id

    case Activities.toggle_favorite(user_id, activity_id) do
      {:ok, _} ->
        json(conn, %{message: "Favorite removed"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not remove favorite"})
    end
  end

  def list_favorites(conn, _params) do
    user_id = conn.assigns.current_user_id
    activities = Activities.get_user_favorites(user_id)
    json(conn, %{activities: Enum.map(activities, &serialize_activity/1)})
  end

  def recommendations(conn, _params) do
    user_id = conn.assigns.current_user_id
    activities = Activities.get_recommendations(user_id)
    json(conn, %{activities: Enum.map(activities, &serialize_activity/1)})
  end

  defp serialize_activity(activity) do
    %{
      id: activity.id,
      title: activity.title,
      description: activity.description,
      category: activity.category,
      location: activity.location,
      price: activity.price,
      rating: activity.rating,
      tags: activity.tags
    }
  end
end
