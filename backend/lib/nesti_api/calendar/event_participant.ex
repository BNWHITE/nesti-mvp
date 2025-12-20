defmodule NestiApi.Calendar.EventParticipant do
  @moduledoc """
  EventParticipant schema for event attendance tracking.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "event_participants" do
    field :status, :string

    belongs_to :event, NestiApi.Calendar.Event
    belongs_to :user, NestiApi.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(participant, attrs) do
    participant
    |> cast(attrs, [:status, :event_id, :user_id])
    |> validate_required([:status, :event_id, :user_id])
    |> validate_inclusion(:status, ["pending", "accepted", "declined"])
    |> foreign_key_constraint(:event_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint([:event_id, :user_id])
  end
end
