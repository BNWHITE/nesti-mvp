defmodule NestiApi.Content do
  @moduledoc """
  The Content context handles posts, comments, and reactions.
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Content.{Post, Comment, Reaction}
  alias NestiApi.Families

  @doc """
  Creates a post with encrypted content.
  """
  def create_post(user_id, attrs) do
    with {:ok, family} <- get_user_family(user_id) do
      attrs = Map.merge(attrs, %{author_id: user_id, family_id: family.id})
      
      %Post{}
      |> Post.changeset(attrs)
      |> Repo.insert()
    end
  end

  defp get_user_family(user_id) do
    case Families.get_user_family(user_id) do
      nil -> {:error, :not_in_family}
      family -> {:ok, family}
    end
  end

  @doc """
  Gets family posts with pagination.
  """
  def get_family_posts(family_id, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    per_page = Keyword.get(opts, :per_page, 20)

    Post
    |> where([p], p.family_id == ^family_id)
    |> order_by([p], desc: p.inserted_at)
    |> preload([:author, :reactions, comments: :user])
    |> paginate(page, per_page)
    |> Repo.all()
  end

  defp paginate(query, page, per_page) do
    offset = (page - 1) * per_page
    query |> limit(^per_page) |> offset(^offset)
  end

  @doc """
  Gets a single post.
  """
  def get_post(id) do
    Post
    |> preload([:author, :reactions, comments: :user])
    |> Repo.get(id)
  end

  @doc """
  Updates a post (author only).
  """
  def update_post(post_id, attrs, user_id) do
    with {:ok, post} <- find_post(post_id),
         :ok <- verify_author(post, user_id) do
      post
      |> Post.changeset(attrs)
      |> Repo.update()
    end
  end

  @doc """
  Deletes a post (author only).
  """
  def delete_post(post_id, user_id) do
    with {:ok, post} <- find_post(post_id),
         :ok <- verify_author(post, user_id) do
      Repo.delete(post)
    end
  end

  defp find_post(post_id) do
    case Repo.get(Post, post_id) do
      nil -> {:error, :post_not_found}
      post -> {:ok, post}
    end
  end

  defp verify_author(post, user_id) do
    if post.author_id == user_id do
      :ok
    else
      {:error, :not_authorized}
    end
  end

  @doc """
  Adds a comment to a post.
  """
  def add_comment(post_id, user_id, content_encrypted) do
    %Comment{}
    |> Comment.changeset(%{
      post_id: post_id,
      user_id: user_id,
      content_encrypted: content_encrypted
    })
    |> Repo.insert()
  end

  @doc """
  Deletes a comment (author only).
  """
  def delete_comment(comment_id, user_id) do
    with {:ok, comment} <- find_comment(comment_id),
         :ok <- verify_comment_author(comment, user_id) do
      Repo.delete(comment)
    end
  end

  defp find_comment(comment_id) do
    case Repo.get(Comment, comment_id) do
      nil -> {:error, :comment_not_found}
      comment -> {:ok, comment}
    end
  end

  defp verify_comment_author(comment, user_id) do
    if comment.user_id == user_id do
      :ok
    else
      {:error, :not_authorized}
    end
  end

  @doc """
  Toggles a reaction on a post. Adds if not exists, removes if exists.
  """
  def toggle_reaction(post_id, user_id, emoji) do
    query =
      from r in Reaction,
        where: r.post_id == ^post_id and r.user_id == ^user_id and r.emoji == ^emoji

    case Repo.one(query) do
      nil -> add_reaction(post_id, user_id, emoji)
      reaction -> Repo.delete(reaction)
    end
  end

  defp add_reaction(post_id, user_id, emoji) do
    %Reaction{}
    |> Reaction.changeset(%{
      post_id: post_id,
      user_id: user_id,
      emoji: emoji
    })
    |> Repo.insert()
  end

  @doc """
  Gets all reactions for a post, grouped by emoji.
  """
  def get_post_reactions(post_id) do
    Reaction
    |> where([r], r.post_id == ^post_id)
    |> preload(:user)
    |> Repo.all()
    |> Enum.group_by(& &1.emoji)
  end
end
