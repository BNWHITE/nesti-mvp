defmodule NestiApiWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :nesti_api

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_nesti_session",
    signing_salt: System.get_env("SESSION_SIGNING_SALT", "default_signing_salt"),
    encryption_salt: System.get_env("SESSION_ENCRYPTION_SALT", "default_encryption_salt"),
    # CRITICAL SECURITY: HttpOnly cookies prevent JavaScript access
    http_only: true,
    # CRITICAL SECURITY: Secure flag requires HTTPS
    secure: true,
    # CRITICAL SECURITY: SameSite=Strict prevents CSRF
    same_site: "Strict",
    # Short session duration (15 minutes)
    max_age: 15 * 60
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]]

  socket "/socket", NestiApiWeb.UserSocket,
    websocket: true,
    longpoll: false

  # Serve at "/" the static files from "priv/static" directory.
  plug Plug.Static,
    at: "/",
    from: :nesti_api,
    gzip: false,
    only: NestiApiWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  
  # CRITICAL SECURITY: Custom security headers plug
  plug NestiApiWeb.Plugs.SecureHeaders
  
  # CRITICAL SECURITY: Rate limiting plug
  plug NestiApiWeb.Plugs.RateLimiter
  
  plug NestiApiWeb.Router
end
