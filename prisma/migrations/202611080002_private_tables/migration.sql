-- Defense in depth for Supabase/PostgREST: no direct browser access to domain tables.
-- Server uses a dedicated trusted SQL identity. Never grant BYPASSRLS to client roles.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReportImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReportEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReportConfirmation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModerationDecision" ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: anon/authenticated roles are denied. All access goes through Next API.
DO $$
DECLARE client_role text; table_name text;
BEGIN
  FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = client_role) THEN
      FOREACH table_name IN ARRAY ARRAY['User','Category','Report','ReportImage','ReportEvent','ReportConfirmation','ModerationDecision'] LOOP
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I FROM %I', table_name, client_role);
      END LOOP;
    END IF;
  END LOOP;
END;
$$;
