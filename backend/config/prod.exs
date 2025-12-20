import Config

# Do not print debug messages in production
config :logger, level: :info

# Runtime configuration (from environment variables)
# This file is executed when the release starts
# and loads configuration from environment variables
if config_env() == :prod do
  # The runtime.exs file in this directory handles all
  # production configuration through environment variables
  import_config "runtime.exs"
end
