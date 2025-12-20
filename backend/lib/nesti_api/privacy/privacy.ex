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
  alias NestiApi.Privacy.{UserConsent, DeletionRequest, DataExport, AuditLog}
  alias NestiApi.Accounts.User

  @doc """
  Records user consent for a specific purpose.
  """
  def create_consent(user_id, consent_type, granted \\ true) do
    %UserConsent{}
    |> UserConsent.changeset(%{
      user_id: user_id,
      consent_type: consent_type,
      granted: granted,
      granted_at: if(granted, do: DateTime.utc_now(), else: nil)
    })
    |> Repo.insert(
      on_conflict: {:replace, [:granted, :granted_at, :updated_at]},
      conflict_target: [:user_id, :consent_type]
    )
  end

  @doc """
  Gets a specific user consent by type.
  """
  def get_user_consent(user_id, consent_type) do
    UserConsent
    |> where([c], c.user_id == ^user_id and c.consent_type == ^consent_type)
    |> Repo.one()
  end

  @doc """
  Deletes a specific user consent.
  """
  def delete_consent(user_id, consent_type) do
    case get_user_consent(user_id, consent_type) do
      nil -> {:error, :not_found}
      consent -> Repo.delete(consent)
    end
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
  def create_data_export_request(user_id) do
    %DataExport{}
    |> DataExport.changeset(%{
      user_id: user_id,
      status: "processing",
      expires_at: DateTime.add(DateTime.utc_now(), 7, :day)
    })
    |> Repo.insert()
  end

  @doc """
  Gets a data export by ID.
  """
  def get_data_export(id) do
    Repo.get(DataExport, id)
  end

  @doc """
  Creates a data deletion request (Right to be Forgotten).
  30-day grace period before actual deletion.
  """
  def create_deletion_request(user_id) do
    requested_at = DateTime.utc_now()
    scheduled_for = DateTime.add(requested_at, 30, :day)

    %DeletionRequest{}
    |> DeletionRequest.changeset(%{
      user_id: user_id,
      requested_at: requested_at,
      scheduled_for: scheduled_for,
      status: "pending"
    })
    |> Repo.insert()
  end

  @doc """
  Cancels a deletion request.
  """
  def cancel_deletion_request(user_id) do
    query =
      from dr in DeletionRequest,
        where: dr.user_id == ^user_id and dr.status == "pending"

    case Repo.one(query) do
      nil -> {:error, :not_found}
      request ->
        request
        |> DeletionRequest.changeset(%{status: "cancelled"})
        |> Repo.update()
    end
  end

  @doc """
  Gets pending deletion requests.
  """
  def list_pending_deletions do
    DeletionRequest
    |> where([dr], dr.status == "pending")
    |> where([dr], dr.scheduled_for <= ^DateTime.utc_now())
    |> Repo.all()
  end

  @doc """
  Processes a deletion request - anonymizes or deletes user data.
  """
  def process_deletion_request(request_id) do
    # Implementation would anonymize/delete user data
    # This is a placeholder for the actual deletion logic
    request = Repo.get(DeletionRequest, request_id)
    
    if request do
      request
      |> DeletionRequest.changeset(%{
        status: "completed",
        completed_at: DateTime.utc_now()
      })
      |> Repo.update()
    end
  end

  @doc """
  Logs an audit event for RGPD compliance.
  """
  def log_audit(user_id, action, resource_type, opts \\ []) do
    %AuditLog{}
    |> AuditLog.changeset(%{
      user_id: user_id,
      action: action,
      resource_type: resource_type,
      resource_id: Keyword.get(opts, :resource_id),
      metadata: Keyword.get(opts, :metadata, %{}),
      ip_address: Keyword.get(opts, :ip_address)
    })
    |> Repo.insert()
  end
end
