defmodule NestiApi.Calendar do
  @moduledoc """
  The Calendar context handles events and participation.
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Calendar.{Event, EventParticipant}
  alias NestiApi.Families

  @doc """
  Creates an event.
  """
  def create_event(user_id, attrs) do
    with {:ok, family} <- get_user_family(user_id) do
      attrs = Map.merge(attrs, %{creator_id: user_id, family_id: family.id})
      
      %Event{}
      |> Event.changeset(attrs)
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
  Gets family events with optional date filters.
  """
  def get_family_events(family_id, opts \\ []) do
    query = from(e in Event, where: e.family_id == ^family_id)

    query =
      case Keyword.get(opts, :from) do
        nil -> query
        from_date -> where(query, [e], e.start_time >= ^from_date)
      end

    query =
      case Keyword.get(opts, :to) do
        nil -> query
        to_date -> where(query, [e], e.end_time <= ^to_date)
      end

    query
    |> order_by([e], asc: e.start_time)
    |> preload([:creator, :participants])
    |> Repo.all()
  end

  @doc """
  Gets upcoming events (next 30 days).
  """
  def get_upcoming_events(family_id, limit \\ 10) do
    now = DateTime.utc_now()
    thirty_days = DateTime.add(now, 30, :day)

    Event
    |> where([e], e.family_id == ^family_id)
    |> where([e], e.start_time >= ^now and e.start_time <= ^thirty_days)
    |> order_by([e], asc: e.start_time)
    |> limit(^limit)
    |> preload([:creator, :participants])
    |> Repo.all()
  end

  @doc """
  Gets a single event.
  """
  def get_event(id) do
    Event
    |> preload([:creator, :participants])
    |> Repo.get(id)
  end

  @doc """
  Updates an event (creator only).
  """
  def update_event(event_id, attrs, user_id) do
    with {:ok, event} <- find_event(event_id),
         :ok <- verify_creator(event, user_id) do
      event
      |> Event.changeset(attrs)
      |> Repo.update()
    end
  end

  @doc """
  Deletes an event (creator only).
  """
  def delete_event(event_id, user_id) do
    with {:ok, event} <- find_event(event_id),
         :ok <- verify_creator(event, user_id) do
      Repo.delete(event)
    end
  end

  defp find_event(event_id) do
    case Repo.get(Event, event_id) do
      nil -> {:error, :event_not_found}
      event -> {:ok, event}
    end
  end

  defp verify_creator(event, user_id) do
    if event.creator_id == user_id do
      :ok
    else
      {:error, :not_authorized}
    end
  end

  @doc """
  Sets participation status for an event.
  """
  def participate(event_id, user_id, status) do
    query =
      from p in EventParticipant,
        where: p.event_id == ^event_id and p.user_id == ^user_id

    case Repo.one(query) do
      nil -> create_participation(event_id, user_id, status)
      participant -> update_participation(participant, status)
    end
  end

  defp create_participation(event_id, user_id, status) do
    %EventParticipant{}
    |> EventParticipant.changeset(%{
      event_id: event_id,
      user_id: user_id,
      status: status
    })
    |> Repo.insert()
  end

  defp update_participation(participant, status) do
    participant
    |> EventParticipant.changeset(%{status: status})
    |> Repo.update()
  end
end
