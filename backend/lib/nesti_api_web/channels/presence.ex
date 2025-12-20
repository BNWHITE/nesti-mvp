defmodule NestiApiWeb.Presence do
  @moduledoc """
  Provides presence tracking to channels and processes.
  """
  use Phoenix.Presence,
    otp_app: :nesti_api,
    pubsub_server: NestiApi.PubSub
end
