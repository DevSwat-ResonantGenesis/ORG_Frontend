-- =====================================================
-- Database Schema Fix Script
-- Fixes for Hash Sphere database schema issues
-- =====================================================
-- 
-- Issues Fixed:
-- 1. Add anchor_type column to memory_anchors table
-- 2. Rename meta_data to metadata in resonance_clusters table (if needed)
--
-- Run this script on the backend database:
-- psql -h localhost -p 5433 -U postgres -d resonant -f fix_database_schema.sql
-- =====================================================

BEGIN;

-- =====================================================
-- ISSUE #1: Add anchor_type column to memory_anchors
-- =====================================================

-- Check if column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'anchor_type'
    ) THEN
        -- Add the column
        ALTER TABLE memory_anchors 
        ADD COLUMN anchor_type VARCHAR(50) DEFAULT NULL;
        
        RAISE NOTICE 'Added anchor_type column to memory_anchors table';
    ELSE
        RAISE NOTICE 'anchor_type column already exists in memory_anchors table';
    END IF;
END $$;

-- Add index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_memory_anchors_anchor_type 
ON memory_anchors(anchor_type);

-- =====================================================
-- ISSUE #2: Fix meta_data vs metadata naming mismatch
-- =====================================================

-- Check if meta_data column exists (wrong name)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'meta_data'
    ) THEN
        -- Rename meta_data to metadata
        ALTER TABLE resonance_clusters 
        RENAME COLUMN meta_data TO metadata;
        
        RAISE NOTICE 'Renamed meta_data to metadata in resonance_clusters table';
    ELSE
        RAISE NOTICE 'meta_data column does not exist (may already be named metadata)';
    END IF;
END $$;

-- Ensure metadata column exists (if neither exists, create it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'metadata'
    ) THEN
        -- Create metadata column as JSONB
        ALTER TABLE resonance_clusters 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Created metadata column in resonance_clusters table';
    ELSE
        RAISE NOTICE 'metadata column already exists in resonance_clusters table';
    END IF;
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify memory_anchors.anchor_type exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'anchor_type'
    ) THEN
        RAISE NOTICE '✅ VERIFIED: memory_anchors.anchor_type column exists';
    ELSE
        RAISE EXCEPTION '❌ ERROR: memory_anchors.anchor_type column still missing';
    END IF;
END $$;

-- Verify resonance_clusters.metadata exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'metadata'
    ) THEN
        RAISE NOTICE '✅ VERIFIED: resonance_clusters.metadata column exists';
    ELSE
        RAISE EXCEPTION '❌ ERROR: resonance_clusters.metadata column still missing';
    END IF;
END $$;

-- Verify meta_data does NOT exist (should be renamed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'meta_data'
    ) THEN
        RAISE NOTICE '✅ VERIFIED: resonance_clusters.meta_data column does not exist (correctly renamed)';
    ELSE
        RAISE WARNING '⚠️ WARNING: resonance_clusters.meta_data column still exists (should be renamed to metadata)';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- Summary
-- =====================================================
SELECT 
    'Schema fixes applied successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'memory_anchors' AND column_name = 'anchor_type') as anchor_type_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'resonance_clusters' AND column_name = 'metadata') as metadata_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'resonance_clusters' AND column_name = 'meta_data') as meta_data_still_exists;

