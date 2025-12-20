defmodule NestiApiWeb.Plugs.SecureHeaders do
  @moduledoc """
  Security headers plug for RGPD and anti-F12 compliance.
  
  Implements strict security headers:
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    conn
    |> put_resp_header("content-security-policy", csp_header())
    |> put_resp_header("x-frame-options", "DENY")
    |> put_resp_header("x-content-type-options", "nosniff")
    |> put_resp_header("x-xss-protection", "1; mode=block")
    |> put_resp_header("referrer-policy", "strict-origin-when-cross-origin")
    |> put_resp_header("permissions-policy", permissions_policy())
    |> put_resp_header("strict-transport-security", "max-age=31536000; includeSubDomains; preload")
    # Remove server header to hide technology stack
    |> delete_resp_header("server")
    |> delete_resp_header("x-powered-by")
  end

  defp csp_header do
    """
    default-src 'self'; \
    script-src 'self'; \
    style-src 'self' 'unsafe-inline'; \
    img-src 'self' data: https:; \
    font-src 'self'; \
    connect-src 'self' https://api.openai.com; \
    media-src 'self'; \
    object-src 'none'; \
    frame-ancestors 'none'; \
    base-uri 'self'; \
    form-action 'self'
    """
    |> String.replace("\n", "")
    |> String.replace("  ", " ")
  end

  defp permissions_policy do
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  end
end
