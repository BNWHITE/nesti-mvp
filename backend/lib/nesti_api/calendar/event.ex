defmodule NestiApi.Calendar.Event do
  @moduledoc """
  Event schema for family calendar.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "events" do
    field :title, :string
    field :description, :string
    field :start_time, :utc_datetime
    field :end_time, :utc_datetime
    field :location, :string

    belongs_to :family, NestiApi.Families.Family
    belongs_to :creator, NestiApi.Accounts.User
    has_many :participants, NestiApi.Calendar.EventParticipant

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:title, :description, :start_time, :end_time, :location, :family_id, :creator_id])
    |> validate_required([:title, :start_time, :end_time, :family_id, :creator_id])
    |> validate_time_range()
    |> foreign_key_constraint(:family_id)
    |> foreign_key_constraint(:creator_id)
  end

  defp validate_time_range(changeset) do
    start_time = get_field(changeset, :start_time)
    end_time = get_field(changeset, :end_time)

    if start_time && end_time && DateTime.compare(start_time, end_time) != :lt do
      add_error(changeset, :end_time, "must be after start time")
    else
      changeset
    end
  end
end
