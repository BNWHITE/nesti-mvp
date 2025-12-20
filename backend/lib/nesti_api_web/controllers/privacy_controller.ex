defmodule NestiApiWeb.PrivacyController do
  use NestiApiWeb, :controller

  alias NestiApi.Privacy

  def list_consents(conn, _params) do
    user_id = conn.assigns.current_user_id
    consents = Privacy.list_user_consents(user_id)
    
    json(conn, %{
      consents: Enum.map(consents, fn c ->
        %{
          id: c.id,
          consent_type: c.consent_type,
          granted: c.granted,
          granted_at: c.granted_at
        }
      end)
    })
  end

  def create_consent(conn, %{"consent_type" => consent_type, "granted" => granted}) do
    user_id = conn.assigns.current_user_id

    case Privacy.create_consent(user_id, consent_type, granted) do
      {:ok, consent} ->
        conn
        |> put_status(:created)
        |> json(%{
          consent: %{
            id: consent.id,
            consent_type: consent.consent_type,
            granted: consent.granted,
            granted_at: consent.granted_at
          }
        })

      {:error, changeset} ->
        conn
        |> put_status(:bad_request)
        |> put_view(json: NestiApiWeb.ErrorJSON)
        |> render("400.json", changeset: changeset)
    end
  end

  def delete_consent(conn, %{"type" => consent_type}) do
    user_id = conn.assigns.current_user_id

    case Privacy.delete_consent(user_id, consent_type) do
      {:ok, _} ->
        json(conn, %{message: "Consent deleted"})

      {:error, :not_found} ->
        conn |> put_status(:not_found) |> json(%{error: "Consent not found"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not delete consent"})
    end
  end

  def request_export(conn, _params) do
    user_id = conn.assigns.current_user_id

    case Privacy.create_data_export_request(user_id) do
      {:ok, export} ->
        conn
        |> put_status(:created)
        |> json(%{
          export: %{
            id: export.id,
            status: export.status,
            expires_at: export.expires_at
          }
        })

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not create export request"})
    end
  end

  def download_export(conn, %{"id" => export_id}) do
    user_id = conn.assigns.current_user_id
    
    case Privacy.get_data_export(export_id) do
      nil ->
        conn |> put_status(:not_found) |> json(%{error: "Export not found"})

      export ->
        if export.user_id == user_id && export.status == "completed" do
          # In production, this would stream the file
          json(conn, %{message: "Download ready", file_path: export.file_path})
        else
          conn |> put_status(:forbidden) |> json(%{error: "Not authorized or export not ready"})
        end
    end
  end

  def request_deletion(conn, _params) do
    user_id = conn.assigns.current_user_id

    case Privacy.create_deletion_request(user_id) do
      {:ok, request} ->
        conn
        |> put_status(:created)
        |> json(%{
          deletion_request: %{
            id: request.id,
            requested_at: request.requested_at,
            scheduled_for: request.scheduled_for,
            status: request.status
          },
          message: "Account deletion scheduled. You have 30 days to cancel."
        })

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not create deletion request"})
    end
  end

  def cancel_deletion(conn, _params) do
    user_id = conn.assigns.current_user_id

    case Privacy.cancel_deletion_request(user_id) do
      {:ok, _} ->
        json(conn, %{message: "Deletion request cancelled"})

      {:error, :not_found} ->
        conn |> put_status(:not_found) |> json(%{error: "No pending deletion request"})

      {:error, _} ->
        conn |> put_status(:bad_request) |> json(%{error: "Could not cancel deletion"})
    end
  end
end
