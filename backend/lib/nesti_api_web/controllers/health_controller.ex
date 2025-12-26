defmodule NestiApiWeb.HealthController do
  use NestiApiWeb, :controller

  def index(conn, _params) do
    json(conn, %{status: "ok", message: "Nesti API is running"})
  end
end
