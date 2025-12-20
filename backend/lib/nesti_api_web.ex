defmodule NestiApiWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, components, channels, and so on.

  This can be used in your application as:

      use NestiApiWeb, :controller
      use NestiApiWeb, :channel

  The definitions below will be executed for every controller,
  channel, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define additional modules and import
  those modules here.
  """

  def static_paths, do: ~w(assets fonts images favicon.ico robots.txt)

  def router do
    quote do
      use Phoenix.Router, helpers: false

      # Import common connection and controller functions
      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def controller do
    quote do
      use Phoenix.Controller,
        formats: [:json],
        layouts: []

      import Plug.Conn
      import NestiApiWeb.Gettext

      unquote(verified_routes())
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: NestiApiWeb.Endpoint,
        router: NestiApiWeb.Router,
        statics: NestiApiWeb.static_paths()
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/channel/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
