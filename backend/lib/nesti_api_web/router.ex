defmodule NestiApiWeb.Router do
  use NestiApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug NestiApiWeb.Plugs.RateLimiter
  end

  pipeline :authenticated do
    plug NestiApiWeb.Plugs.AuthPipeline
  end

  scope "/api/v1", NestiApiWeb do
    pipe_through :api

    # Public auth endpoints
    post "/auth/register", AuthController, :register
    post "/auth/login", AuthController, :login
    post "/auth/forgot-password", AuthController, :forgot_password
    post "/auth/reset-password", AuthController, :reset_password
    post "/auth/oauth/google", AuthController, :google_oauth
  end

  scope "/api/v1", NestiApiWeb do
    pipe_through [:api, :authenticated]

    # Auth endpoints (authenticated)
    post "/auth/logout", AuthController, :logout
    post "/auth/refresh", AuthController, :refresh_token
    get "/auth/me", AuthController, :me

    # Family management
    post "/families", FamilyController, :create
    get "/families/me", FamilyController, :show_my_family
    put "/families/:id", FamilyController, :update
    post "/families/join", FamilyController, :join
    get "/families/members", FamilyController, :list_members
    put "/families/members/:id/role", FamilyController, :update_member_role
    delete "/families/members/:id", FamilyController, :remove_member
    post "/families/invite-code/regenerate", FamilyController, :regenerate_invite_code

    # Posts and content
    get "/posts", PostController, :index
    post "/posts", PostController, :create
    put "/posts/:id", PostController, :update
    delete "/posts/:id", PostController, :delete
    post "/posts/:id/reactions", PostController, :toggle_reaction
    delete "/posts/:id/reactions/:emoji", PostController, :remove_reaction

    # Comments
    get "/posts/:post_id/comments", CommentController, :index
    post "/posts/:post_id/comments", CommentController, :create
    delete "/posts/:post_id/comments/:id", CommentController, :delete

    # Events and calendar
    get "/events", EventController, :index
    post "/events", EventController, :create
    get "/events/:id", EventController, :show
    put "/events/:id", EventController, :update
    delete "/events/:id", EventController, :delete
    post "/events/:id/participate", EventController, :participate

    # Activities discovery
    get "/activities", ActivityController, :search
    get "/activities/:id", ActivityController, :show
    post "/activities/:id/favorite", ActivityController, :toggle_favorite
    delete "/activities/:id/favorite", ActivityController, :remove_favorite
    get "/activities/favorites", ActivityController, :list_favorites
    get "/activities/recommendations", ActivityController, :recommendations

    # Nesti AI
    post "/nesti/chat", NestiAIController, :chat
    get "/nesti/history", NestiAIController, :history
    delete "/nesti/history", NestiAIController, :clear_history
    get "/nesti/suggestions", NestiAIController, :suggestions

    # Privacy and RGPD
    get "/privacy/consents", PrivacyController, :list_consents
    post "/privacy/consents", PrivacyController, :create_consent
    delete "/privacy/consents/:type", PrivacyController, :delete_consent
    post "/privacy/export", PrivacyController, :request_export
    get "/privacy/export/:id/download", PrivacyController, :download_export
    post "/privacy/delete-account", PrivacyController, :request_deletion
    delete "/privacy/delete-account", PrivacyController, :cancel_deletion
  end

  # Enable LiveDashboard in development
  if Application.compile_env(:nesti_api, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]
      live_dashboard "/dashboard", metrics: NestiApiWeb.Telemetry
    end
  end
end
