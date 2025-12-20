#!/bin/bash

# ============================================
# Supabase Security Setup Script
# Initializes security features for Nesti MVP
# ============================================

set -e  # Exit on error

echo "🛡️  Nesti MVP - Security Setup Script"
echo "======================================"
echo ""

# Configuration
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD}"
DATABASE_URL="${DATABASE_URL}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        echo -e "${RED}❌ SUPABASE_PROJECT_ID not set${NC}"
        echo "   Set it with: export SUPABASE_PROJECT_ID=your-project-id"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set (optional if using Supabase CLI)${NC}"
    fi
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠️  psql not found. Install PostgreSQL client or use Supabase SQL Editor${NC}"
        echo "   On Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo "   On macOS: brew install postgresql"
    fi
    
    echo -e "${GREEN}✅ Prerequisites check complete${NC}"
    echo ""
}

# Run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo "🔧 $description..."
    
    if [ -f "$file" ]; then
        if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
            psql "$DATABASE_URL" < "$file"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ $description - SUCCESS${NC}"
            else
                echo -e "${RED}❌ $description - FAILED${NC}"
                return 1
            fi
        else
            echo -e "${YELLOW}⚠️  Please run this SQL manually in Supabase SQL Editor:${NC}"
            echo "   File: $file"
            echo "   Press Enter when done..."
            read
        fi
    else
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi
}

# Generate encryption key
generate_encryption_key() {
    echo "🔐 Generating encryption key..."
    
    # Generate a secure 32-byte (256-bit) key
    ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    echo ""
    echo "======================================"
    echo "⚠️  IMPORTANT: SAVE THIS ENCRYPTION KEY"
    echo "======================================"
    echo ""
    echo "Encryption Key: $ENCRYPTION_KEY"
    echo ""
    echo "Add this to your Supabase Dashboard:"
    echo "1. Go to Settings > Database"
    echo "2. Scroll to 'Custom Postgres Config'"
    echo "3. Add: app.encryption_key = '$ENCRYPTION_KEY'"
    echo ""
    echo "Or run this SQL command:"
    echo "ALTER DATABASE postgres SET app.encryption_key = '$ENCRYPTION_KEY';"
    echo ""
    echo "======================================"
    echo ""
    echo "Press Enter when you've saved this key..."
    read
}

# Main installation
main() {
    echo "Starting Supabase security setup..."
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Generate encryption key
    generate_encryption_key
    
    # Run SQL files in order
    echo "📦 Installing database security..."
    echo ""
    
    run_sql_file "database/schema_v2_secure.sql" "Creating secure schema"
    run_sql_file "database/functions_security.sql" "Creating security functions"
    run_sql_file "database/rls_policies.sql" "Setting up RLS policies"
    run_sql_file "database/triggers_security.sql" "Installing security triggers"
    run_sql_file "database/indexes.sql" "Creating optimized indexes"
    
    echo ""
    echo "🎉 Security setup complete!"
    echo ""
    
    # Optional: Run migration
    echo "Would you like to migrate data from v1 to v2? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "⚠️  IMPORTANT: Backup your database first!"
        echo "Press Enter to continue with migration..."
        read
        run_sql_file "database/migrate_v1_to_v2.sql" "Migrating data to v2"
    fi
    
    # Optional: Seed test data
    echo ""
    echo "Would you like to seed test data? (development only) (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        run_sql_file "database/seed_v2.sql" "Seeding test data"
    fi
    
    # Verification
    echo ""
    echo "🔍 Running verification checks..."
    
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        # Check RLS
        echo "Checking RLS status..."
        psql "$DATABASE_URL" -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" -q
        
        # Check functions
        echo ""
        echo "Checking security functions..."
        psql "$DATABASE_URL" -c "SELECT proname FROM pg_proc WHERE proname IN ('encrypt_sensitive', 'decrypt_sensitive', 'log_audit_event', 'log_security_event');" -q
        
        # Check triggers
        echo ""
        echo "Checking triggers..."
        psql "$DATABASE_URL" -c "SELECT tgname FROM pg_trigger WHERE tgname LIKE 'audit_%' OR tgname LIKE 'prevent_%' LIMIT 5;" -q
    fi
    
    echo ""
    echo "======================================"
    echo "✅ Setup Complete!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. ✅ Verify encryption key is set in Supabase dashboard"
    echo "2. ✅ Test encryption: SELECT decrypt_sensitive(encrypt_sensitive('test'));"
    echo "3. ✅ Review RLS policies in Supabase dashboard"
    echo "4. ✅ Configure environment variables in frontend"
    echo "5. ✅ Run security audit: ./scripts/security_audit.sh"
    echo ""
    echo "📚 Documentation:"
    echo "   - SECURITY.md - Complete security guide"
    echo "   - docs/DATABASE_SECURITY.md - Database details"
    echo "   - docs/INCIDENT_RESPONSE.md - Incident procedures"
    echo ""
}

# Run main function
main
