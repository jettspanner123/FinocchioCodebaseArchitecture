class ApplicationController < ActionController::API
  private

  # Call as a before_action in any controller that needs auth-gating -- not
  # applied globally here, since e.g. HealthCheck and Authentication's own
  # sign_up/login/refresh actions are intentionally public.
  def authenticate_request!
    @current_user_id = ApplicationAuthenticationService.current.resolve_user_id(request)

    return if @current_user_id.present?

    render(
      json: ApplicationApiResponseService.current.error_envelope(message: "Unauthorized.", status_code: 401),
      status: 401
    )
  end

  attr_reader :current_user_id
end
