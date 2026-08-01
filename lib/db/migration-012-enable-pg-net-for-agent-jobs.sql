-- Enables asynchronous HTTP requests for controlled QA and future scheduled
-- task dispatch. No cron job, trigger, or outbound request is created here.
create extension if not exists pg_net with schema extensions;
