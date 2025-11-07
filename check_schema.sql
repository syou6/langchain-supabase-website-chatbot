-- スキーマ確認用SQL

-- 1. documentsテーブルが存在するか確認
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- 2. embeddingカラムの次元数を確認
SELECT 
    pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_catalog.pg_attribute a
JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'documents' 
AND a.attname = 'embedding';

-- 3. match_documents関数が存在するか確認
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'match_documents';

-- 4. match_documents関数の詳細を確認
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'match_documents';

-- 5. インデックスが存在するか確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'documents';

-- 6. データの件数を確認
SELECT COUNT(*) as document_count FROM documents;

-- 7. サンプルデータを確認（最初の1件）
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    metadata
FROM documents 
LIMIT 1;

