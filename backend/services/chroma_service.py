import chromadb
import uuid
import os
import hashlib

chroma_client = chromadb.PersistentClient(path="./chroma_data")

def get_file_hash(filepath: str) -> str:
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def sync_rule_pdf(form_type: str, text: str, filepath: str):
    """Syncs a PDF into its own collection if it's new or modified."""
    file_hash = get_file_hash(filepath)
    collection_name = form_type.lower().replace(" ", "_").replace("-", "_")
    
    collection = chroma_client.get_or_create_collection(name=collection_name)
    
    # Check if we already indexed this version
    existing = collection.get(where={"file_hash": file_hash})
    if existing and existing["ids"]:
        print(f"Skipping {form_type}, no changes detected.")
        return

    print(f"Indexing new/updated {form_type} rules...")
    # Clear old entries to keep semantics clean
    chroma_client.delete_collection(name=collection_name)
    collection = chroma_client.get_or_create_collection(name=collection_name)
    
    chunks = chunk_text(text, chunk_size=500, overlap=100)
    
    # Insert chunks with metadata
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i+batch_size]
        ids = [str(uuid.uuid4()) for _ in batch_chunks]
        metadatas = [{"source": form_type, "file_hash": file_hash} for _ in batch_chunks]
        collection.add(documents=batch_chunks, metadatas=metadatas, ids=ids)

def query_relevant_rules(form_type: str, query_text: str, n_results: int = 4) -> str:
    collection_name = form_type.lower().replace(" ", "_").replace("-", "_")
    try:
        collection = chroma_client.get_collection(name=collection_name)
        if collection.count() == 0:
            return "No rules available."
            
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        documents = results.get("documents", [[]])[0]
        return "\\n---\\n".join(documents)
    except Exception as e:
        print(f"Error querying Collection {collection_name}: {e}")
        return "Rules vector database not initialized for this form."
