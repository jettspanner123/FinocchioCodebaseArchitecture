# Global (not feature-specific) singleton: resolves the current user id from a
# request's Authorization header. Lives here, not inside Features/Authentication/,
# because every future feature's controllers need this, not just Authentication's own.
class ApplicationAuthenticationService
  def self.current
    @current ||= new
  end

  def resolve_user_id(request)
    token = bearer_token(request)
    return nil if token.blank?

    decoded = Features::Authentication::Services::JSONWebTokenService.current.decode(token)
    decoded && decoded["sub"]
  end

  private

  def bearer_token(request)
    header = request.headers["Authorization"]
    return nil if header.blank?

    header.split(" ").last
  end
end
