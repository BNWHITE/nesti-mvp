# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     NestiApi.Repo.insert!(%NestiApi.SomeSchema{})

alias NestiApi.Repo
alias NestiApi.{Accounts, Families, Content, Calendar, Activities, Privacy}

# Clean up existing data (for development only)
if Mix.env() == :dev do
  Repo.delete_all(Activities.Activity)
  Repo.delete_all(Calendar.EventParticipant)
  Repo.delete_all(Calendar.Event)
  Repo.delete_all(Content.Reaction)
  Repo.delete_all(Content.Comment)
  Repo.delete_all(Content.Post)
  Repo.delete_all(Families.FamilyMember)
  Repo.delete_all(Families.Family)
  Repo.delete_all(Accounts.User)
end

# Create sample users
IO.puts("Creating sample users...")

{:ok, user1} = Accounts.create_user(%{
  email: "jean@example.com",
  password: "Password123!",
  first_name: "Jean",
  last_name: "Dupont",
  date_of_birth: ~D[1985-06-15],
  parental_consent_given: false
})

{:ok, user2} = Accounts.create_user(%{
  email: "marie@example.com",
  password: "Password123!",
  first_name: "Marie",
  last_name: "Dupont",
  date_of_birth: ~D[1987-03-22],
  parental_consent_given: false
})

{:ok, user3} = Accounts.create_user(%{
  email: "sophie@example.com",
  password: "Password123!",
  first_name: "Sophie",
  last_name: "Dupont",
  date_of_birth: ~D[2010-09-10],
  parental_consent_given: true
})

IO.puts("✅ Created 3 users")

# Create a family
IO.puts("Creating family...")

{:ok, family} = Families.create_family(user1.id, %{
  family_name: "Famille Dupont",
  description: "Notre belle famille unie",
  emoji: "👨‍👩‍👧",
  subscription_type: "free"
})

# Add other family members
Families.join_by_code(user2.id, family.invite_code)
Families.join_by_code(user3.id, family.invite_code)

IO.puts("✅ Created family with 3 members")
IO.puts("   Invite code: #{family.invite_code}")

# Create sample posts
IO.puts("Creating sample posts...")

{:ok, _post1} = Content.create_post(user1.id, %{
  content_encrypted: "Bonjour la famille ! Comment allez-vous aujourd'hui ?",
  type: "text"
})

{:ok, _post2} = Content.create_post(user2.id, %{
  content_encrypted: "Magnifique journée pour une sortie en famille ! 🌞",
  type: "text"
})

IO.puts("✅ Created 2 posts")

# Create sample events
IO.puts("Creating sample events...")

{:ok, _event1} = Calendar.create_event(user1.id, %{
  title: "Dîner de famille",
  description: "Tous ensemble pour un bon repas !",
  start_time: DateTime.add(DateTime.utc_now(), 3, :day),
  end_time: DateTime.add(DateTime.utc_now(), 3, :day) |> DateTime.add(2, :hour),
  location: "Chez Grand-mère"
})

{:ok, _event2} = Calendar.create_event(user2.id, %{
  title: "Sortie au parc",
  description: "Pique-nique et jeux",
  start_time: DateTime.add(DateTime.utc_now(), 7, :day),
  end_time: DateTime.add(DateTime.utc_now(), 7, :day) |> DateTime.add(4, :hour),
  location: "Parc de la Tête d'Or"
})

IO.puts("✅ Created 2 events")

# Create sample activities
IO.puts("Creating sample activities...")

Repo.insert!(%Activities.Activity{
  title: "Parc Astérix",
  description: "Parc d'attractions avec manèges et spectacles",
  category: "entertainment",
  location: "Plailly, France",
  price: Decimal.new("45.00"),
  rating: Decimal.new("4.5"),
  tags: ["parc", "attractions", "famille"],
  is_public: true
})

Repo.insert!(%Activities.Activity{
  title: "Musée du Louvre",
  description: "Le plus grand musée d'art au monde",
  category: "culture",
  location: "Paris, France",
  price: Decimal.new("17.00"),
  rating: Decimal.new("4.8"),
  tags: ["musée", "art", "culture"],
  is_public: true
})

Repo.insert!(%Activities.Activity{
  title: "Accrobranche",
  description: "Parcours aventure dans les arbres",
  category: "outdoor",
  location: "Fontainebleau, France",
  price: Decimal.new("25.00"),
  rating: Decimal.new("4.3"),
  tags: ["sport", "nature", "aventure"],
  is_public: true
})

IO.puts("✅ Created 3 activities")

# Create consents
IO.puts("Creating privacy consents...")

Privacy.create_consent(user1.id, "data_processing", true)
Privacy.create_consent(user1.id, "ai_usage", true)
Privacy.create_consent(user2.id, "data_processing", true)

IO.puts("✅ Created privacy consents")

IO.puts("\n🎉 Database seeded successfully!")
IO.puts("\nTest Users:")
IO.puts("  - jean@example.com / Password123!")
IO.puts("  - marie@example.com / Password123!")
IO.puts("  - sophie@example.com / Password123! (minor with parental consent)")
IO.puts("\nFamily:")
IO.puts("  - Name: Famille Dupont")
IO.puts("  - Invite code: #{family.invite_code}")
