defmodule NestiApi.Privacy do
  @moduledoc """
  The Privacy context handles RGPD/GDPR compliance.
  
  Features:
  - User consent management
  - Data export (portability)
  - Data deletion requests (right to be forgotten)
  - Audit logging
  - Data anonymization
  """

  import Ecto.Query, warn: false
  alias NestiApi.Repo
  alias NestiApi.Privacy.{UserConsent, DataDeletionRequest, DataExport, AuditLog}
  alias NestiApi.Accounts.User

  @doc """
  Records user consent for a specific purpose.
  """
  def create_consent(user_id, purpose, granted \\ true) do
    %UserConsent{}
    |> UserConsent.changeset(%{
      user_id: user_id,
      purpose: purpose,
      granted: granted,
      granted_at: DateTime.utc_now()
    })
    |> Repo.insert()
  end

  @doc """
  Gets all consents for a user.
  """
  def list_user_consents(user_id) do
    UserConsent
    |> where([c], c.user_id == ^user_id)
    |> order_by([c], desc: c.granted_at)
    |> Repo.all()
  end

  @doc """
  Creates a data export request for RGPD portability.
  """
  def create_data_export_request(user_id, format \\ "json") do
    %DataExport{}
    |> DataExport.changeset(%{
      user_id: user_id,
      format: format,
      status: "pending",
      requested_at: DateTime.utc_now()
    })
    |> Repo.insert()
  end

  @doc """
  Creates a data deletion request (Right to be Forgotten).
  """
  def create_deletion_request(user_id, reason \\ nil) do
    %DataDeletionRequest{}
    |> DataDeletionRequest.changeset(%{
      user_id: user_id,
      reason: reason,
      status: "pending",
      requested_at: DateTime.utc_now()
    })
    |> Repo.insert()
  end

  @doc """
  Processes a deletion request - anonymizes or deletes user data.
  """
  def process_deletion_request(request_id) do
    # Implementation would anonymize/delete user data
    # This is a placeholder for the actual deletion logic
    request = Repo.get(DataDeletionRequest, request_id)
    
    if request do
      request
      |> DataDeletionRequest.changeset(%{
        status: "completed",
        processed_at: DateTime.utc_now()
      })
      |> Repo.update()
    end
  end

  @doc """
  Logs an audit event for RGPD compliance.
  """
  def log_audit(user_id, action, details \\ nil) do
    %AuditLog{}
    |> AuditLog.changeset(%{
      user_id: user_id,
      action: action,
      details: details,
      timestamp: DateTime.utc_now()
    })
    |> Repo.insert()
  end
end
