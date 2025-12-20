#!/bin/bash

# ============================================
# Security Audit Script for Nesti MVP
# Checks database security configuration
# ============================================

set -e

echo "🔍 Nesti MVP - Security Audit"
echo "=============================="
echo ""

# Configuration
DATABASE_URL="${DATABASE_URL}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check function
check_item() {
    local description=$1
    local sql_query=$2
    local expected=$3
    
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        # Capture both result and errors
        local psql_output
        psql_output=$(psql "$DATABASE_URL" -t -c "$sql_query" 2>&1)
        local psql_exit=$?
        
        # Check for errors
        if [ $psql_exit -ne 0 ]; then
            echo -e "${RED}❌ $description (query failed)${NC}"
            echo "   Error: $psql_output"
            ((FAILED++))
            return
        fi
        
        result=$(echo "$psql_output" | xargs)
        
        if [ "$result" == "$expected" ]; then
            echo -e "${GREEN}✅ $description${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ $description${NC}"
            echo "   Expected: $expected, Got: $result"
            ((FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠️  $description (manual check required)${NC}"
        ((WARNINGS++))
    fi
}

# Run audit
run_audit() {
    echo "🔐 Checking Encryption Configuration..."
    echo "----------------------------------------"
    
    # Check encryption key is set
    check_item "Encryption key configured" \
        "SELECT CASE WHEN current_setting('app.encryption_key', true) IS NOT NULL THEN 'configured' ELSE 'missing' END;" \
        "configured"
    
    # Check pgcrypto extension
    check_item "pgcrypto extension enabled" \
        "SELECT CASE WHEN COUNT(*) > 0 THEN 'enabled' ELSE 'disabled' END FROM pg_extension WHERE extname = 'pgcrypto';" \
        "enabled"
    
    echo ""
    echo "🛡️  Checking Row Level Security..."
    echo "----------------------------------------"
    
    # Check RLS on critical tables
    tables=("users" "families" "family_members" "posts" "comments" "events" "audit_logs" "security_events")
    
    for table in "${tables[@]}"; do
        check_item "RLS enabled on $table" \
            "SELECT CASE WHEN rowsecurity THEN 'enabled' ELSE 'disabled' END FROM pg_tables WHERE tablename = '$table' AND schemaname = 'public';" \
            "enabled"
    done
    
    echo ""
    echo "🔧 Checking Security Functions..."
    echo "----------------------------------------"
    
    # Check critical functions exist
    functions=("encrypt_sensitive" "decrypt_sensitive" "log_audit_event" "log_security_event" "cleanup_expired_data")
    
    for func in "${functions[@]}"; do
        check_item "Function $func exists" \
            "SELECT CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END FROM pg_proc WHERE proname = '$func';" \
            "exists"
    done
    
    echo ""
    echo "⚡ Checking Security Triggers..."
    echo "----------------------------------------"
    
    # Check audit triggers
    triggers=("audit_users_insert" "audit_users_update" "prevent_password_change" "prevent_audit_logs_deletion")
    
    for trigger in "${triggers[@]}"; do
        check_item "Trigger $trigger exists" \
            "SELECT CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END FROM pg_trigger WHERE tgname = '$trigger';" \
            "exists"
    done
    
    echo ""
    echo "📊 Checking Indexes..."
    echo "----------------------------------------"
    
    # Check critical indexes
    check_item "Email hash index exists" \
        "SELECT CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END FROM pg_indexes WHERE indexname = 'idx_users_email_hash';" \
        "exists"
    
    check_item "Posts family index exists" \
        "SELECT CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END FROM pg_indexes WHERE indexname = 'idx_posts_family_id';" \
        "exists"
    
    check_item "Audit logs index exists" \
        "SELECT CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END FROM pg_indexes WHERE indexname = 'idx_audit_logs_created_at';" \
        "exists"
    
    echo ""
    echo "🔍 Checking Data Integrity..."
    echo "----------------------------------------"
    
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        # Check for encrypted data
        encrypted_users=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE email_encrypted IS NOT NULL;" 2>/dev/null | xargs)
        total_users=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
        
        if [ "$encrypted_users" == "$total_users" ] && [ "$total_users" != "0" ]; then
            echo -e "${GREEN}✅ All users have encrypted email ($encrypted_users/$total_users)${NC}"
            ((PASSED++))
        elif [ "$total_users" == "0" ]; then
            echo -e "${YELLOW}⚠️  No users in database (empty database)${NC}"
            ((WARNINGS++))
        else
            echo -e "${RED}❌ Some users missing encrypted email ($encrypted_users/$total_users)${NC}"
            ((FAILED++))
        fi
        
        # Check audit log activity
        audit_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM audit_logs;" 2>/dev/null | xargs)
        echo -e "${BLUE}ℹ️  Audit log entries: $audit_count${NC}"
        
        # Check security events
        security_events=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM security_events;" 2>/dev/null | xargs)
        echo -e "${BLUE}ℹ️  Security events logged: $security_events${NC}"
        
        # Check for recent critical events
        critical_events=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM security_events WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '7 days';" 2>/dev/null | xargs)
        if [ "$critical_events" -gt "0" ]; then
            echo -e "${RED}⚠️  $critical_events critical security events in last 7 days!${NC}"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✅ No critical security events in last 7 days${NC}"
            ((PASSED++))
        fi
    fi
    
    echo ""
    echo "🔒 Checking Password Security..."
    echo "----------------------------------------"
    
    # Check for password-related configurations
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        # Check for users with must_change_password flag
        must_change=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE must_change_password = true;" 2>/dev/null | xargs)
        echo -e "${BLUE}ℹ️  Users requiring password change: $must_change${NC}"
        
        # Check for locked accounts
        locked=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE locked_until > NOW();" 2>/dev/null | xargs)
        if [ "$locked" -gt "0" ]; then
            echo -e "${YELLOW}⚠️  $locked accounts currently locked${NC}"
        else
            echo -e "${GREEN}✅ No locked accounts${NC}"
            ((PASSED++))
        fi
    fi
    
    echo ""
    echo "🚫 Checking IP Blocks..."
    echo "----------------------------------------"
    
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        blocked_ips=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM blocked_ips WHERE permanent = true OR blocked_until > NOW();" 2>/dev/null | xargs)
        echo -e "${BLUE}ℹ️  Currently blocked IPs: $blocked_ips${NC}"
        
        # List reasons for recent blocks
        echo ""
        echo "Recent IP blocks:"
        psql "$DATABASE_URL" -c "SELECT reason, COUNT(*) as count FROM blocked_ips WHERE blocked_at > NOW() - INTERVAL '30 days' GROUP BY reason ORDER BY count DESC LIMIT 5;" 2>/dev/null || echo "No recent blocks"
    fi
    
    echo ""
    echo "📈 Security Metrics (Last 30 Days)..."
    echo "----------------------------------------"
    
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        echo ""
        psql "$DATABASE_URL" -c "
            SELECT 
                severity,
                COUNT(*) as count
            FROM security_events
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY severity
            ORDER BY 
                CASE severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                END;
        " 2>/dev/null || echo "No security events"
    fi
}

# Summary
print_summary() {
    echo ""
    echo "=============================="
    echo "📊 Audit Summary"
    echo "=============================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ Security audit completed successfully!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Security audit found issues that need attention!${NC}"
        exit 1
    fi
}

# Main
main() {
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set${NC}"
        echo "Set it with: export DATABASE_URL='postgresql://user:pass@host:port/db'"
        echo ""
        echo "Continuing with limited checks..."
        echo ""
    fi
    
    run_audit
    print_summary
}

main
