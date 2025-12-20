defmodule NestiApiWeb.CommentController do
  use NestiApiWeb, :controller

  alias NestiApi.Content

  def index(conn, %{"post_id" => post_id}) do
    # In production, would load comments for the post
    # For now, return empty array as comments are preloaded with posts
    json(conn, %{comments: []})
  end

  def create(conn, %{"post_id" => post_id, "content_encrypted" => content_encrypted}) do
    user_id = conn.assigns.current_user_id

    case Content.add_comment(post_id, user_id, content_encrypted) do
      {:ok, comment} ->
        conn
        |> put_status(:created)
        |> json(%{
          comment: %{
            id: comment.id,
            content_encrypted: comment.content_encrypted,
            user_id: comment.user_id,
            post_id: comment.post_id,
            inserted_at: comment.inserted_at
          }
        })

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  def delete(conn, %{"post_id" => _post_id, "id" => comment_id}) do
    user_id = conn.assigns.current_user_id

    case Content.delete_comment(comment_id, user_id) do
      {:ok, _} ->
        json(conn, %{message: "Comment deleted"})

      {:error, :not_authorized} ->
        conn |> put_status(:forbidden) |> json(%{error: "Not authorized"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not delete comment"})
    end
  end
end
