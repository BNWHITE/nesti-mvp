defmodule NestiApiWeb.FamilyChannel do
  use NestiApiWeb, :channel

  alias NestiApi.{Families, Content}
  alias Phoenix.PubSub

  @impl true
  def join("family:" <> family_id, _payload, socket) do
    user_id = socket.assigns.current_user_id

    # Verify user is member of this family
    case verify_family_member(user_id, family_id) do
      :ok ->
        send(self(), :after_join)
        {:ok, assign(socket, :family_id, family_id)}

      {:error, :not_authorized} ->
        {:error, %{reason: "Not authorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    family_id = socket.assigns.family_id
    user_id = socket.assigns.current_user_id

    # Track presence
    {:ok, _} = NestiApiWeb.Presence.track(socket, user_id, %{
      online_at: DateTime.utc_now() |> DateTime.to_unix()
    })

    # Push presence state
    push(socket, "presence_state", NestiApiWeb.Presence.list(socket))

    {:noreply, socket}
  end

  @impl true
  def handle_in("new_message", %{"content_encrypted" => content_encrypted, "type" => type}, socket) do
    user_id = socket.assigns.current_user_id
    family_id = socket.assigns.family_id

    attrs = %{
      content_encrypted: content_encrypted,
      type: type,
      author_id: user_id,
      family_id: family_id
    }

    case Content.create_post(user_id, attrs) do
      {:ok, post} ->
        broadcast!(socket, "new_message", %{
          post: %{
            id: post.id,
            content_encrypted: post.content_encrypted,
            type: post.type,
            author_id: post.author_id,
            inserted_at: post.inserted_at
          }
        })
        {:reply, :ok, socket}

      {:error, _changeset} ->
        {:reply, {:error, %{reason: "Could not create post"}}, socket}
    end
  end

  @impl true
  def handle_in("typing", _payload, socket) do
    user_id = socket.assigns.current_user_id
    
    broadcast_from!(socket, "user_typing", %{user_id: user_id})
    {:noreply, socket}
  end

  @impl true
  def handle_in("react", %{"post_id" => post_id, "emoji" => emoji}, socket) do
    user_id = socket.assigns.current_user_id

    case Content.toggle_reaction(post_id, user_id, emoji) do
      {:ok, _} ->
        reactions = Content.get_post_reactions(post_id)
        
        broadcast!(socket, "reaction_updated", %{
          post_id: post_id,
          reactions: serialize_reactions(reactions)
        })
        {:reply, :ok, socket}

      {:error, _} ->
        {:reply, {:error, %{reason: "Could not toggle reaction"}}, socket}
    end
  end

  # Intercept presence_diff to broadcast
  @impl true
  def handle_info(%{event: "presence_diff"} = diff, socket) do
    push(socket, "presence_diff", diff.payload)
    {:noreply, socket}
  end

  defp verify_family_member(user_id, family_id) do
    case Families.get_user_family(user_id) do
      nil ->
        {:error, :not_authorized}

      family ->
        if family.id == family_id do
          :ok
        else
          {:error, :not_authorized}
        end
    end
  end

  defp serialize_reactions(reactions_map) do
    Enum.map(reactions_map, fn {emoji, reactions} ->
      %{emoji: emoji, count: length(reactions)}
    end)
  end
end
