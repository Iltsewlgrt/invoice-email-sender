CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  tax_id TEXT
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS invoice_requests (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES invoice_requests(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  invoice_number TEXT,
  issue_date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pdf_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL
);
