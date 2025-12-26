defmodule NestiApiWeb.CoreComponents do
  @moduledoc """
  Provides core UI components.
  """
  use Phoenix.Component

  @doc """
  Renders a simple error tag for form fields.
  """
  def error(assigns) do
    ~H"""
    <span class="invalid-feedback">
      <%= @message %>
    </span>
    """
  end
end
