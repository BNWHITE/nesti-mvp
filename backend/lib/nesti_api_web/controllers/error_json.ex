defmodule NestiApiWeb.ErrorJSON do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on JSON requests.
  """

  # If you want to customize a particular status code,
  # you may add your own clauses, such as:
  #
  # def render("404.json", _assigns) do
  #   %{errors: %{detail: "Not Found"}}
  # end

  def render("404.json", _assigns) do
    %{
      error: "not_found",
      message: "La ressource demandée n'existe pas",
      status: 404
    }
  end

  def render("401.json", _assigns) do
    %{
      error: "unauthorized",
      message: "Authentification requise",
      status: 401
    }
  end

  def render("403.json", _assigns) do
    %{
      error: "forbidden",
      message: "Accès refusé",
      status: 403
    }
  end

  def render("422.json", %{changeset: changeset}) do
    %{
      error: "unprocessable_entity",
      message: "Données invalides",
      errors: Ecto.Changeset.traverse_errors(changeset, &translate_error/1),
      status: 422
    }
  end

  def render("500.json", _assigns) do
    %{
      error: "internal_server_error",
      message: "Une erreur interne s'est produite",
      status: 500
    }
  end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.json" becomes
  # "Not Found".
  def render(template, _assigns) do
    %{errors: %{detail: Phoenix.Controller.status_message_from_template(template)}}
  end

  defp translate_error({msg, opts}) do
    Enum.reduce(opts, msg, fn {key, value}, acc ->
      String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
    end)
  end
end
