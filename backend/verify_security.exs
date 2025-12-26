# Script de vérification de la sécurité de la base de données Supabase
# Usage: cd backend && set -a && source .env && set +a && mix run verify_security.exs

Mix.install([
  {:postgrex, "~> 0.17"}
])

defmodule SecurityVerifier do
  def run do
    IO.puts("\n🔍 VÉRIFICATION DE LA SÉCURITÉ SUPABASE\n")
    IO.puts(String.duplicate("=", 60))

    db_url = System.get_env("DATABASE_URL")
    
    unless db_url do
      IO.puts("❌ DATABASE_URL non définie")
      System.halt(1)
    end

    # Parse l'URL
    uri = URI.parse(db_url)
    [user, password] = String.split(uri.userinfo, ":")
    
    {:ok, pid} = Postgrex.start_link(
      hostname: uri.host,
      port: uri.port || 5432,
      username: user,
      password: URI.decode(password),
      database: String.trim_leading(uri.path, "/"),
      ssl: true,
      ssl_opts: [verify: :verify_none]
    )

    # 1. Vérifier RLS
    check_rls(pid)
    
    # 2. Compter les policies
    check_policies(pid)
    
    # 3. Vérifier les tables de sécurité
    check_security_tables(pid)
    
    # 4. Vérifier les fonctions
    check_security_functions(pid)
    
    # 5. Vérifier les triggers
    check_triggers(pid)

    IO.puts("\n" <> String.duplicate("=", 60))
    IO.puts("✅ VÉRIFICATION TERMINÉE\n")
    
    GenServer.stop(pid)
  end

  defp check_rls(pid) do
    IO.puts("\n1️⃣  Vérification RLS (Row Level Security)...")
    
    query = """
    SELECT COUNT(*) as count
    FROM pg_tables
    WHERE schemaname = 'public' AND rowsecurity = true
    """
    
    case Postgrex.query(pid, query, []) do
      {:ok, %{rows: [[count]]}} ->
        if count >= 35 do
          IO.puts("   ✅ RLS activé sur #{count} tables")
        else
          IO.puts("   ⚠️  RLS activé sur #{count} tables (attendu: 35+)")
        end
      {:error, error} ->
        IO.puts("   ❌ Erreur: #{inspect(error)}")
    end
  end

  defp check_policies(pid) do
    IO.puts("\n2️⃣  Vérification des Policies RLS...")
    
    query = """
    SELECT COUNT(*) as count
    FROM pg_policies
    WHERE schemaname = 'public'
    """
    
    case Postgrex.query(pid, query, []) do
      {:ok, %{rows: [[count]]}} ->
        if count >= 40 do
          IO.puts("   ✅ #{count} policies RLS créées")
        else
          IO.puts("   ⚠️  #{count} policies RLS (attendu: 40+)")
        end
      {:error, error} ->
        IO.puts("   ❌ Erreur: #{inspect(error)}")
    end
  end

  defp check_security_tables(pid) do
    IO.puts("\n3️⃣  Vérification des tables de sécurité RGPD...")
    
    tables = [
      "user_consents",
      "data_export_requests",
      "data_deletion_requests",
      "audit_logs",
      "failed_login_attempts",
      "suspicious_activities"
    ]
    
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY($1)
    """
    
    case Postgrex.query(pid, query, [tables]) do
      {:ok, %{rows: rows}} ->
        found_tables = Enum.map(rows, fn [name] -> name end)
        
        Enum.each(tables, fn table ->
          if table in found_tables do
            IO.puts("   ✅ #{table}")
          else
            IO.puts("   ❌ #{table} - MANQUANTE")
          end
        end)
        
        if length(found_tables) == length(tables) do
          IO.puts("   ✅ Toutes les tables RGPD sont présentes")
        end
      {:error, error} ->
        IO.puts("   ❌ Erreur: #{inspect(error)}")
    end
  end

  defp check_security_functions(pid) do
    IO.puts("\n4️⃣  Vérification des fonctions de sécurité...")
    
    functions = [
      "is_family_admin",
      "is_family_member",
      "is_adult_user",
      "anonymize_deleted_users",
      "generate_family_encryption_key",
      "update_updated_at_column",
      "log_sensitive_changes"
    ]
    
    query = """
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = ANY($1)
    """
    
    case Postgrex.query(pid, query, [functions]) do
      {:ok, %{rows: rows}} ->
        found_functions = Enum.map(rows, fn [name] -> name end)
        
        Enum.each(functions, fn func ->
          if func in found_functions do
            IO.puts("   ✅ #{func}()")
          else
            IO.puts("   ❌ #{func}() - MANQUANTE")
          end
        end)
        
        if length(found_functions) == length(functions) do
          IO.puts("   ✅ Toutes les fonctions de sécurité sont présentes")
        end
      {:error, error} ->
        IO.puts("   ❌ Erreur: #{inspect(error)}")
    end
  end

  defp check_triggers(pid) do
    IO.puts("\n5️⃣  Vérification des triggers...")
    
    query = """
    SELECT COUNT(*) as count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    """
    
    case Postgrex.query(pid, query, []) do
      {:ok, %{rows: [[count]]}} ->
        if count >= 4 do
          IO.puts("   ✅ #{count} triggers actifs")
        else
          IO.puts("   ⚠️  #{count} triggers (attendu: 4+)")
        end
      {:error, error} ->
        IO.puts("   ❌ Erreur: #{inspect(error)}")
    end
  end
end

SecurityVerifier.run()
