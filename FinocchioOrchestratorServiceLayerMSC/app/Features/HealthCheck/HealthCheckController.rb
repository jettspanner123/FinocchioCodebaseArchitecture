module Features
  module HealthCheck
    class HealthCheckController < ApplicationController
      def index
        begin
          constant = Features::HealthCheck::Constants::HealthCheckConstant
          report = Features::HealthCheck::Services::HealthCheckService.current.check_health

          status_code = report[:OverallStatus] == constant::UNHEALTHY ? 503 : 200
          message =
            case report[:OverallStatus]
            when constant::HEALTHY
              "All systems operational and healthy."
            when constant::DEGRADED
              "Systems operational with degraded performance."
            else
              "One or more critical subsystems are unhealthy."
            end
        rescue StandardError => e
          Rails.logger.error("[HealthCheckController#index] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during health check diagnosis.",
              status_code: 500
            ),
            status: 500
          )
        else
          render(
            json: ApplicationApiResponseService.current.success_envelope(
              data: report,
              message: message,
              status_code: status_code
            ),
            status: status_code
          )
        ensure
          # No cleanup required for this action -- present to satisfy this
          # project's rule that every action use the full begin/rescue/else/
          # ensure/end shape, not because there's work to do here.
        end
      end

      def ping
        begin
          result = Features::HealthCheck::Services::HealthCheckService.current.ping
        rescue StandardError => e
          Rails.logger.error("[HealthCheckController#ping] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred.",
              status_code: 500
            ),
            status: 500
          )
        else
          render(
            json: ApplicationApiResponseService.current.success_envelope(
              data: result,
              message: "Liveness probe succeeded.",
              status_code: 200
            ),
            status: 200
          )
        ensure
          # No cleanup required for this action -- see note in #index.
        end
      end
    end
  end
end
