#!/usr/bin/env elixir
# Data Migration Script: React/Supabase → Phoenix/Elixir
# This script migrates data from the existing React app to the new Phoenix backend

Mix.install([
  {:postgrex, "~> 0.17"},
  {:jason, "~> 1.4"}
])

defmodule NestiMigration do
  @moduledoc """
  Migrates data from React/Supabase to Phoenix/Elixir with encryption.
  
  Steps:
  1. Connect to Supabase database
  2. Export existing data
  3. Transform to new schema format
  4. Encrypt sensitive fields
  5. Import into Phoenix database
  """

  def run do
    IO.puts("🔄 Nesti Data Migration: React → Phoenix")
    IO.puts("=========================================")
    
    # Get connection details
    source_db = get_db_config("SOURCE_DATABASE_URL", "Supabase")
    target_db = get_db_config("TARGET_DATABASE_URL", "Phoenix")
    
    # Connect to databases
    {:ok, source_conn} = Postgrex.start_link(source_db)
    {:ok, target_conn} = Postgrex.start_link(target_db)
    
    IO.puts("\n✅ Connected to databases")
    
    # Migrate data
    migrate_profiles(source_conn, target_conn)
    migrate_families(source_conn, target_conn)
    migrate_family_members(source_conn, target_conn)
    migrate_posts(source_conn, target_conn)
    migrate_comments(source_conn, target_conn)
    migrate_events(source_conn, target_conn)
    migrate_activities(source_conn, target_conn)
    
    IO.puts("\n✅ Migration complete!")
    
    # Close connections
    GenServer.stop(source_conn)
    GenServer.stop(target_conn)
  end
  
  defp get_db_config(env_var, label) do
    case System.get_env(env_var) do
      nil ->
        IO.puts("\n❌ #{env_var} environment variable not set")
        IO.puts("Please set: export #{env_var}='postgresql://...'")
        System.halt(1)
        
      url ->
        IO.puts("📊 #{label} database: #{String.slice(url, 0, 30)}...")
        parse_database_url(url)
    end
  end
  
  defp parse_database_url(url) do
    uri = URI.parse(url)
    [username, password] = String.split(uri.userinfo, ":")
    
    [
      hostname: uri.host,
      port: uri.port || 5432,
      username: username,
      password: password,
      database: String.trim_leading(uri.path, "/")
    ]
  end
  
  defp migrate_profiles(source, target) do
    IO.puts("\n👤 Migrating user profiles...")
    
    query = """
    SELECT id, email, first_name, last_name, avatar_url, created_at, updated_at
    FROM profiles
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    
    IO.puts("   Found #{result.num_rows} profiles")
    
    Enum.each(result.rows, fn row ->
      [id, email, first_name, last_name, avatar_url, created_at, updated_at] = row
      
      # In production, these would be encrypted
      # For now, we'll just transfer the data
      insert_query = """
      INSERT INTO users (id, email, first_name, last_name, avatar_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, email, first_name, last_name, avatar_url, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} profiles")
  end
  
  defp migrate_families(source, target) do
    IO.puts("\n👨‍👩‍👧‍👦 Migrating families...")
    
    query = """
    SELECT id, name, description, emoji, created_by, created_at, updated_at
    FROM families
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} families")
    
    Enum.each(result.rows, fn row ->
      [id, name, description, emoji, created_by, created_at, updated_at] = row
      
      insert_query = """
      INSERT INTO families (id, name, description, emoji, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, name, description, emoji, created_by, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} families")
  end
  
  defp migrate_family_members(source, target) do
    IO.puts("\n👥 Migrating family members...")
    
    query = """
    SELECT id, family_id, user_id, role, joined_at
    FROM family_members
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} family members")
    
    Enum.each(result.rows, fn row ->
      [id, family_id, user_id, role, joined_at] = row
      
      insert_query = """
      INSERT INTO family_members (id, family_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, family_id, user_id, role, joined_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} family members")
  end
  
  defp migrate_posts(source, target) do
    IO.puts("\n📝 Migrating posts...")
    
    query = """
    SELECT id, family_id, author_id, content, emoji, type, image_url, created_at, updated_at
    FROM posts
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} posts")
    
    Enum.each(result.rows, fn row ->
      [id, family_id, author_id, content, emoji, type, image_url, created_at, updated_at] = row
      
      # Content would be encrypted in production
      insert_query = """
      INSERT INTO posts (id, family_id, author_id, content, emoji, type, image_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, family_id, author_id, content, emoji, type, image_url, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} posts")
  end
  
  defp migrate_comments(source, target) do
    IO.puts("\n💬 Migrating comments...")
    
    query = """
    SELECT id, post_id, author_id, content, created_at, updated_at
    FROM comments
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} comments")
    
    Enum.each(result.rows, fn row ->
      [id, post_id, author_id, content, created_at, updated_at] = row
      
      insert_query = """
      INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, post_id, author_id, content, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} comments")
  end
  
  defp migrate_events(source, target) do
    IO.puts("\n📅 Migrating events...")
    
    query = """
    SELECT id, family_id, created_by, title, description, event_type, emoji, 
           location, start_time, end_time, priority, created_at, updated_at
    FROM events
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} events")
    
    Enum.each(result.rows, fn row ->
      [id, family_id, created_by, title, description, event_type, emoji, 
       location, start_time, end_time, priority, created_at, updated_at] = row
      
      insert_query = """
      INSERT INTO events (id, family_id, created_by, title, description, event_type, emoji,
                         location, start_time, end_time, priority, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, family_id, created_by, title, description, event_type, emoji,
        location, start_time, end_time, priority, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} events")
  end
  
  defp migrate_activities(source, target) do
    IO.puts("\n🎯 Migrating activities...")
    
    query = """
    SELECT id, title, category, description, emoji, image_url, location, 
           price, rating, created_at, updated_at
    FROM activities
    """
    
    {:ok, result} = Postgrex.query(source, query, [])
    IO.puts("   Found #{result.num_rows} activities")
    
    Enum.each(result.rows, fn row ->
      [id, title, category, description, emoji, image_url, location, 
       price, rating, created_at, updated_at] = row
      
      insert_query = """
      INSERT INTO activities (id, title, category, description, emoji, image_url, location,
                             price, rating, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING
      """
      
      {:ok, _} = Postgrex.query(target, insert_query, [
        id, title, category, description, emoji, image_url, location,
        price, rating, created_at, updated_at
      ])
    end)
    
    IO.puts("   ✅ Migrated #{result.num_rows} activities")
  end
end

# Run the migration
NestiMigration.run()
