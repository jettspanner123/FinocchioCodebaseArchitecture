module Features
  module HealthCheck
    module Constants
      class HealthCheckConstant
        HEALTHY = "Healthy"
        DEGRADED = "Degraded"
        UNHEALTHY = "Unhealthy"

        DATABASE_COMPONENT_NAME = "PostgreSQL Database"
        AUTHENTICATION_SUBSYSTEM_NAME = "Authentication Subsystem"
      end
    end
  end
end
