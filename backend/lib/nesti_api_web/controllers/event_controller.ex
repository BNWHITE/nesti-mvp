defmodule NestiApiWeb.EventController do
  use NestiApiWeb, :controller

  alias NestiApi.Calendar

  def index(conn, params) do
    user_id = conn.assigns.current_user_id

    with {:ok, family} <- get_user_family(user_id) do
      from = Map.get(params, "from")
      to = Map.get(params, "to")
      
      opts = []
      opts = if from, do: Keyword.put(opts, :from, from), else: opts
      opts = if to, do: Keyword.put(opts, :to, to), else: opts
      
      events = Calendar.get_family_events(family.id, opts)
      json(conn, %{events: Enum.map(events, &serialize_event/1)})
    else
      {:error, :not_in_family} ->
        conn |> put_status(:not_found) |> json(%{error: "Not in a family"})
    end
  end

  def create(conn, params) do
    user_id = conn.assigns.current_user_id

    case Calendar.create_event(user_id, params) do
      {:ok, event} ->
        conn |> put_status(:created) |> json(%{event: serialize_event(event)})

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  def show(conn, %{"id" => event_id}) do
    case Calendar.get_event(event_id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Event not found"})

      event ->
        json(conn, %{event: serialize_event(event)})
    end
  end

  def update(conn, %{"id" => event_id} = params) do
    user_id = conn.assigns.current_user_id

    case Calendar.update_event(event_id, params, user_id) do
      {:ok, event} ->
        json(conn, %{event: serialize_event(event)})

      {:error, :not_authorized} ->
        conn |> put_status(:forbidden) |> json(%{error: "Not authorized"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not update event"})
    end
  end

  def delete(conn, %{"id" => event_id}) do
    user_id = conn.assigns.current_user_id

    case Calendar.delete_event(event_id, user_id) do
      {:ok, _} ->
        json(conn, %{message: "Event deleted"})

      {:error, :not_authorized} ->
        conn |> put_status(:forbidden) |> json(%{error: "Not authorized"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not delete event"})
    end
  end

  def participate(conn, %{"id" => event_id, "status" => status}) do
    user_id = conn.assigns.current_user_id

    case Calendar.participate(event_id, user_id, status) do
      {:ok, _} ->
        json(conn, %{message: "Participation updated"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not update participation"})
    end
  end

  defp get_user_family(user_id) do
    case NestiApi.Families.get_user_family(user_id) do
      nil -> {:error, :not_in_family}
      family -> {:ok, family}
    end
  end

  defp serialize_event(event) do
    %{
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      creator_id: event.creator_id,
      inserted_at: event.inserted_at
    }
  end
end
