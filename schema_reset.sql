-- 既存のテーブルと関数を削除（既に存在する場合）
drop index if exists documents_embedding_idx;
drop function if exists match_documents(vector, int, jsonb);
drop function if exists match_documents(jsonb, int, vector);
drop function if exists match_documents(vector, int);
drop table if exists documents;

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents (512 dimensions for text-embedding-3-small)
create table documents (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector(512) -- 512 dimensions for text-embedding-3-small
);

-- Create a function to search for documents (LangChain 1.x compatible)
create function match_documents (
  query_embedding vector(512),
  match_count int default 10,
  filter jsonb default '{}'::jsonb
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create an index to be used by the search function
create index on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

