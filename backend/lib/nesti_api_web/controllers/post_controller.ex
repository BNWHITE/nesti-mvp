defmodule NestiApiWeb.PostController do
  use NestiApiWeb, :controller

  alias NestiApi.Content

  def index(conn, params) do
    user_id = conn.assigns.current_user_id
    
    with {:ok, family} <- get_user_family(user_id) do
      page = Map.get(params, "page", "1") |> String.to_integer()
      per_page = Map.get(params, "per_page", "20") |> String.to_integer()
      
      posts = Content.get_family_posts(family.id, page: page, per_page: per_page)
      json(conn, %{posts: Enum.map(posts, &serialize_post/1)})
    else
      {:error, :not_in_family} ->
        conn |> put_status(:not_found) |> json(%{error: "Not in a family"})
    end
  end

  def create(conn, params) do
    user_id = conn.assigns.current_user_id

    case Content.create_post(user_id, params) do
      {:ok, post} ->
        conn |> put_status(:created) |> json(%{post: serialize_post(post)})

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  def update(conn, %{"id" => post_id} = params) do
    user_id = conn.assigns.current_user_id

    case Content.update_post(post_id, params, user_id) do
      {:ok, post} ->
        json(conn, %{post: serialize_post(post)})

      {:error, :not_authorized} ->
        conn |> put_status(:forbidden) |> json(%{error: "Not authorized"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not update post"})
    end
  end

  def delete(conn, %{"id" => post_id}) do
    user_id = conn.assigns.current_user_id

    case Content.delete_post(post_id, user_id) do
      {:ok, _} ->
        json(conn, %{message: "Post deleted"})

      {:error, :not_authorized} ->
        conn |> put_status(:forbidden) |> json(%{error: "Not authorized"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not delete post"})
    end
  end

  def toggle_reaction(conn, %{"id" => post_id, "emoji" => emoji}) do
    user_id = conn.assigns.current_user_id

    case Content.toggle_reaction(post_id, user_id, emoji) do
      {:ok, _} ->
        reactions = Content.get_post_reactions(post_id)
        json(conn, %{reactions: serialize_reactions(reactions)})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not toggle reaction"})
    end
  end

  def remove_reaction(conn, %{"id" => post_id, "emoji" => emoji}) do
    user_id = conn.assigns.current_user_id

    case Content.toggle_reaction(post_id, user_id, emoji) do
      {:ok, _} ->
        json(conn, %{message: "Reaction removed"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not remove reaction"})
    end
  end

  defp get_user_family(user_id) do
    case NestiApi.Families.get_user_family(user_id) do
      nil -> {:error, :not_in_family}
      family -> {:ok, family}
    end
  end

  defp serialize_post(post) do
    %{
      id: post.id,
      content_encrypted: post.content_encrypted,
      type: post.type,
      media_url: post.media_url,
      author_id: post.author_id,
      inserted_at: post.inserted_at
    }
  end

  defp serialize_reactions(reactions_map) do
    Enum.map(reactions_map, fn {emoji, reactions} ->
      %{emoji: emoji, count: length(reactions)}
    end)
  end
end
