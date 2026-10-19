-- idx_pps_client was already created by the earlier partial run.
-- Just replace the composite unique key with an endpoint-only one.
ALTER TABLE portal_push_subscriptions
  DROP INDEX      uq_pps_endpoint,
  ADD  UNIQUE KEY uq_pps_endpoint (endpoint(500));
