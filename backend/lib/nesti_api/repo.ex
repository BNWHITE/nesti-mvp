defmodule NestiApi.Repo do
  use Ecto.Repo,
    otp_app: :nesti_api,
    adapter: Ecto.Adapters.Postgres
end
