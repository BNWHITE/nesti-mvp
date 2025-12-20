defmodule NestiApiWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :nesti_api

  @session_options [
    store: :cookie,
    key: "_nesti_api_key",
    signing_salt: "default_salt",
    same_site: "Lax"
  ]

  plug Plug.Static,
    at: "/",
    from: :nesti_api,
    gzip: false,
    only: ~w(assets fonts images favicon.ico robots.txt)

  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug NestiApiWeb.Router
end
