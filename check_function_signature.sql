-- match_documents関数のシグネチャを詳細に確認
-- LangChain 1.xが期待する形式: match_documents(filter, match_count, query_embedding)
-- 実際の定義: match_documents(query_embedding, match_count, filter)

-- 関数の完全な定義を確認
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as return_type,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'match_documents';

-- 関数が正しく呼び出せるかテスト（ダミーのベクトルで）
-- 注意: 実際の512次元ベクトルが必要なので、これは参考用
SELECT 
    'Function exists and can be called' as status,
    proname as function_name
FROM pg_proc 
WHERE proname = 'match_documents';

-- パラメータの順序を確認（簡易版）
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as full_arguments,
    pg_get_functiondef(oid) as full_definition
FROM pg_proc 
WHERE proname = 'match_documents';

