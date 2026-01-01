-- =====================================================
-- Complete Database Schema Fix Script
-- Fixes ALL Hash Sphere database schema issues
-- =====================================================
-- 
-- Issues Fixed:
-- 1. Add anchor_type column to memory_anchors table ✅ (already done)
-- 2. Add missing columns to memory_anchors: file_path, function_name, language, line_range, code_snippet
-- 3. Ensure metadata column exists (not meta_data) in both tables
--
-- Run this script on the backend database:
-- psql -h localhost -p 5433 -U postgres -d resonant -f fix_database_schema_complete.sql
-- =====================================================

BEGIN;

-- =====================================================
-- Add missing columns to memory_anchors table
-- =====================================================

-- Add file_path column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'file_path'
    ) THEN
        ALTER TABLE memory_anchors 
        ADD COLUMN file_path VARCHAR(500) DEFAULT NULL;
        
        RAISE NOTICE 'Added file_path column to memory_anchors table';
    ELSE
        RAISE NOTICE 'file_path column already exists in memory_anchors table';
    END IF;
END $$;

-- Add function_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'function_name'
    ) THEN
        ALTER TABLE memory_anchors 
        ADD COLUMN function_name VARCHAR(255) DEFAULT NULL;
        
        RAISE NOTICE 'Added function_name column to memory_anchors table';
    ELSE
        RAISE NOTICE 'function_name column already exists in memory_anchors table';
    END IF;
END $$;

-- Add language column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE memory_anchors 
        ADD COLUMN language VARCHAR(50) DEFAULT NULL;
        
        RAISE NOTICE 'Added language column to memory_anchors table';
    ELSE
        RAISE NOTICE 'language column already exists in memory_anchors table';
    END IF;
END $$;

-- Add line_range column (stored as JSONB for start/end line numbers)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'line_range'
    ) THEN
        ALTER TABLE memory_anchors 
        ADD COLUMN line_range JSONB DEFAULT NULL;
        
        RAISE NOTICE 'Added line_range column to memory_anchors table';
    ELSE
        RAISE NOTICE 'line_range column already exists in memory_anchors table';
    END IF;
END $$;

-- Add code_snippet column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'code_snippet'
    ) THEN
        ALTER TABLE memory_anchors 
        ADD COLUMN code_snippet TEXT DEFAULT NULL;
        
        RAISE NOTICE 'Added code_snippet column to memory_anchors table';
    ELSE
        RAISE NOTICE 'code_snippet column already exists in memory_anchors table';
    END IF;
END $$;

-- Add meta_data column as alias (for backward compatibility with code that uses meta_data)
-- Note: This is a workaround - the backend code should be updated to use 'metadata' instead
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memory_anchors' 
        AND column_name = 'meta_data'
    ) THEN
        -- Create a view or add column that references metadata
        -- Since we can't create computed columns easily, we'll add meta_data as a separate JSONB column
        -- The backend should be updated to use 'metadata' instead
        ALTER TABLE memory_anchors 
        ADD COLUMN meta_data JSONB DEFAULT NULL;
        
        -- Copy existing metadata to meta_data for backward compatibility
        UPDATE memory_anchors 
        SET meta_data = metadata 
        WHERE meta_data IS NULL AND metadata IS NOT NULL;
        
        RAISE NOTICE 'Added meta_data column to memory_anchors table (backward compatibility)';
    ELSE
        RAISE NOTICE 'meta_data column already exists in memory_anchors table';
    END IF;
END $$;

-- =====================================================
-- Fix resonance_clusters meta_data vs metadata
-- =====================================================

-- Add meta_data column to resonance_clusters (for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'meta_data'
    ) THEN
        ALTER TABLE resonance_clusters 
        ADD COLUMN meta_data JSONB DEFAULT NULL;
        
        -- Copy existing metadata to meta_data for backward compatibility
        UPDATE resonance_clusters 
        SET meta_data = metadata 
        WHERE meta_data IS NULL AND metadata IS NOT NULL;
        
        RAISE NOTICE 'Added meta_data column to resonance_clusters table (backward compatibility)';
    ELSE
        RAISE NOTICE 'meta_data column already exists in resonance_clusters table';
    END IF;
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify all memory_anchors columns exist
DO $$
DECLARE
    missing_columns TEXT[];
    required_columns TEXT[] := ARRAY['anchor_type', 'file_path', 'function_name', 'language', 'line_range', 'code_snippet', 'meta_data', 'metadata'];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'memory_anchors' 
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION '❌ Missing columns in memory_anchors: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ VERIFIED: All required columns exist in memory_anchors';
    END IF;
END $$;

-- Verify resonance_clusters has both metadata and meta_data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'metadata'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'resonance_clusters' 
        AND column_name = 'meta_data'
    ) THEN
        RAISE NOTICE '✅ VERIFIED: resonance_clusters has both metadata and meta_data columns';
    ELSE
        RAISE WARNING '⚠️ WARNING: resonance_clusters missing metadata or meta_data column';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- Summary
-- =====================================================
SELECT 
    'Complete schema fixes applied!' as status,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'memory_anchors' 
     AND column_name IN ('anchor_type', 'file_path', 'function_name', 'language', 'line_range', 'code_snippet', 'meta_data', 'metadata')) as memory_anchors_columns,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'resonance_clusters' 
     AND column_name IN ('metadata', 'meta_data')) as resonance_clusters_columns;

