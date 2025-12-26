alias NestiApi.Repo

IO.puts("Création d'un utilisateur de test...")

now_naive = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

# Vérifier si l'utilisateur existe déjà
check_result = Repo.query("SELECT id::text, email FROM public.users WHERE email = 'test@nesti.fr'")

case check_result do
  {:ok, %{rows: []}} ->
    # L'utilisateur n'existe pas, le créer avec gen_random_uuid()
    result = Repo.query!("""
      INSERT INTO public.users (id, email, first_name, role, created_at)
      VALUES (gen_random_uuid(), 'test@nesti.fr', 'Utilisateur Test', 'parent', $1)
      RETURNING id::text, email, first_name
    """, [now_naive])
    
    [[id, email, name]] = result.rows
    
    IO.puts("\n✅ Utilisateur créé dans public.users!")
    IO.puts("   ID: #{id}")
    IO.puts("   Email: #{email}")
    IO.puts("   Nom: #{name}")
    
  {:ok, %{rows: [[existing_id, email] | _]}} ->
    IO.puts("\n✅ Utilisateur existe déjà!")
    IO.puts("   ID: #{existing_id}")
    IO.puts("   Email: #{email}")
    
  {:error, error} ->
    IO.puts("\n❌ Erreur:")
    IO.inspect(error)
end

IO.puts("\n" <> String.duplicate("=", 50))
IO.puts("📱 IDENTIFIANTS DE CONNEXION")
IO.puts(String.duplicate("=", 50))
IO.puts("   Email: test@nesti.fr")
IO.puts("   Mot de passe: Test1234!")
IO.puts(String.duplicate("=", 50))
IO.puts("\n⚠️  IMPORTANT: Pour que l'authentification fonctionne,")
IO.puts("   vous devez AUSSI créer cet utilisateur dans Supabase Auth:")
IO.puts("   1. Allez dans Supabase Dashboard → Authentication → Users")
IO.puts("   2. Cliquez 'Add user' → 'Create new user'")
IO.puts("   3. Email: test@nesti.fr")
IO.puts("   4. Password: Test1234!")
IO.puts("   5. Cochez 'Auto confirm user'")
