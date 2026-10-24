require "objspace"

module Features
  module HealthCheck
    module Services
      class HealthCheckService
        SERVER_START_TIME = Time.now.utc

        def self.current
          @current ||= new
        end

        def check_health
          constant = Features::HealthCheck::Constants::HealthCheckConstant
          started_at = monotonic_now

          database = probe_database
          runtime = gather_runtime_info
          subsystems = probe_subsystems

          {
            OverallStatus: compute_overall_status(database, subsystems),
            TotalDurationMs: elapsed_ms(started_at),
            Database: database,
            Runtime: runtime,
            Subsystems: subsystems,
            Timestamp: Time.now.utc.iso8601
          }
        end

        def ping
          {
            Status: "PONG",
            Timestamp: Time.now.utc.iso8601
          }
        end

        private

        def probe_database
          constant = Features::HealthCheck::Constants::HealthCheckConstant
          component = {
            ComponentName: constant::DATABASE_COMPONENT_NAME,
            CheckedAt: Time.now.utc.iso8601
          }
          started_at = monotonic_now

          begin
            # `connection.active?` only reports whether an already-established
            # connection is alive -- it does not itself attempt to connect, so
            # on a fresh process it falsely reports false. A real lightweight
            # query is the only way to actually prove connectivity.
            ActiveRecord::Base.connection.execute("SELECT 1")
            component[:LatencyMs] = elapsed_ms(started_at)
            component[:Status] = constant::HEALTHY
            component[:Details] = "Connected successfully. Latency: #{component[:LatencyMs]}ms"
          rescue StandardError => e
            component[:LatencyMs] = elapsed_ms(started_at)
            component[:Status] = constant::UNHEALTHY
            component[:Details] = "Database connection exception: #{e.message}"
            Rails.logger.error("[HealthCheckService#probe_database] #{e.class}: #{e.message}")
          end

          component
        end

        def gather_runtime_info
          uptime_seconds = (Time.now.utc - SERVER_START_TIME).to_i
          days, remainder = uptime_seconds.divmod(86_400)
          hours, remainder = remainder.divmod(3_600)
          minutes, seconds = remainder.divmod(60)

          {
            EnvironmentName: Rails.env,
            Uptime: "#{days}d #{hours}h #{minutes}m #{seconds}s",
            MemoryAllocatedMB: (ObjectSpace.memsize_of_all.to_f / (1024 * 1024)).round(2),
            ThreadCount: Thread.list.count,
            RuntimeVersion: RUBY_DESCRIPTION
          }
        end

        def probe_subsystems
          [probe_authentication_subsystem]
        end

        # Authentication hasn't been built yet as of HealthCheck's own implementation --
        # this correctly reports Unhealthy ("not yet implemented") until that feature
        # exists, the same way AssetSphere's equivalent probe reports a DI-resolution
        # failure. Not a bug: an honest reflection of what's actually built so far.
        def probe_authentication_subsystem
          constant = Features::HealthCheck::Constants::HealthCheckConstant
          component = {
            ComponentName: constant::AUTHENTICATION_SUBSYSTEM_NAME,
            CheckedAt: Time.now.utc.iso8601
          }
          started_at = monotonic_now

          begin
            resolved = Object.const_defined?("Features::Authentication::AuthenticationController")
            component[:LatencyMs] = elapsed_ms(started_at)

            if resolved
              component[:Status] = constant::HEALTHY
              component[:Details] = "Authentication feature resolved and operational."
            else
              component[:Status] = constant::UNHEALTHY
              component[:Details] = "Authentication feature is not yet implemented."
            end
          rescue StandardError => e
            component[:LatencyMs] = elapsed_ms(started_at)
            component[:Status] = constant::UNHEALTHY
            component[:Details] = "Resolution error: #{e.message}"
          end

          component
        end

        def compute_overall_status(database, subsystems)
          constant = Features::HealthCheck::Constants::HealthCheckConstant
          components = [database, *subsystems]

          return constant::UNHEALTHY if components.any? { |c| c[:Status] == constant::UNHEALTHY }
          return constant::DEGRADED if components.any? { |c| c[:Status] == constant::DEGRADED }

          constant::HEALTHY
        end

        def monotonic_now
          Process.clock_gettime(Process::CLOCK_MONOTONIC)
        end

        def elapsed_ms(started_at)
          ((monotonic_now - started_at) * 1000).round
        end
      end
    end
  end
end
