# Test de connexion Supabase
# Usage: mix run test_connection.exs

IO.puts("\n🔍 Test de connexion à Supabase...")

# Charger la configuration
Application.ensure_all_started(:postgrex)

db_url = System.get_env("DATABASE_URL") || 
         "postgresql://postgres.ozlbjohbzaommmtbwues:Nesti1234@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require"

IO.puts("📡 URL: #{String.replace(db_url, ~r/:[^:@]+@/, ":****@")}")

# Parser l'URL
uri = URI.parse(db_url)
[username | _] = String.split(uri.userinfo || "", ":")
password = uri.userinfo |> String.split(":") |> List.last()

opts = [
  hostname: uri.host,
  port: uri.port || 5432,
  database: String.trim_leading(uri.path || "/postgres", "/"),
  username: username,
  password: password,
  pool_size: 1,
  ssl: true,
  ssl_opts: [
    verify: :verify_none
  ]
]

IO.puts("\n⚙️  Configuration:")
IO.puts("  Host: #{opts[:hostname]}")
IO.puts("  Port: #{opts[:port]}")
IO.puts("  Database: #{opts[:database]}")
IO.puts("  Username: #{opts[:username]}")
IO.puts("  SSL: #{opts[:ssl]}")

# Test de connexion
case Postgrex.start_link(opts) do
  {:ok, pid} ->
    IO.puts("\n✅ Connexion réussie!")
    
    # Test de requête simple
    case Postgrex.query(pid, "SELECT version()", []) do
      {:ok, result} ->
        version = result.rows |> List.first() |> List.first()
        IO.puts("✅ PostgreSQL version: #{version}")
        
        # Tester si les tables existent
        case Postgrex.query(pid, "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LIMIT 10", []) do
          {:ok, tables_result} ->
            tables = tables_result.rows |> Enum.map(&List.first/1)
            IO.puts("\n✅ Tables trouvées (#{length(tables)}) :")
            Enum.each(tables, fn table -> IO.puts("  - #{table}") end)
            
            # Vérifier si les tables de sécurité existent
            security_tables = ["user_consents", "audit_logs", "failed_login_attempts"]
            case Postgrex.query(pid, "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1)", [security_tables]) do
              {:ok, security_result} ->
                found_tables = security_result.rows |> Enum.map(&List.first/1)
                if length(found_tables) > 0 do
                  IO.puts("\n✅ Tables de sécurité trouvées: #{inspect(found_tables)}")
                  IO.puts("✅ Migration de sécurité déjà exécutée!")
                else
                  IO.puts("\n⚠️  Tables de sécurité NON trouvées")
                  IO.puts("❌ Vous devez exécuter database/security_hardening.sql dans Supabase SQL Editor")
                end
              {:error, err} ->
                IO.puts("❌ Erreur vérification sécurité: #{inspect(err)}")
            end
            
          {:error, err} ->
            IO.puts("❌ Erreur lecture tables: #{inspect(err)}")
        end
        
      {:error, err} ->
        IO.puts("❌ Erreur requête: #{inspect(err)}")
    end
    
    GenServer.stop(pid)
    
  {:error, error} ->
    IO.puts("\n❌ Échec de connexion!")
    IO.puts("Erreur: #{inspect(error)}")
    IO.puts("\n💡 Solutions possibles:")
    IO.puts("  1. Vérifier que le mot de passe est correct dans Supabase Settings → Database")
    IO.puts("  2. Vérifier que l'IP est autorisée (ou désactiver IP restrictions)")
    IO.puts("  3. Essayer avec l'URL directe (port 5432) au lieu du pooler (6543)")
    IO.puts("  4. Vérifier DATABASE_URL dans backend/.env")
end

IO.puts("\n")
