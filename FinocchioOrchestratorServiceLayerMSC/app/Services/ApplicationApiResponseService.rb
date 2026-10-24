# Global (not feature-specific) singleton used by every controller to render the
# project's standard PascalCase JSON envelope -- see ARCHITECTURE.md Sec8 and
# CODING-RULES.md for why this is explicit here instead of a Rails default.
class ApplicationApiResponseService
  def self.current
    @current ||= new
  end

  def success_envelope(data: {}, message: "Success", status_code: 200)
    {
      Message: message,
      Success: true,
      StatusCode: status_code
    }.merge(pascalize(data))
  end

  def error_envelope(message: "Error", errors: {}, status_code: 500)
    {
      Message: message,
      Success: false,
      StatusCode: status_code,
      Errors: pascalize(errors)
    }
  end

  private

  def pascalize(value)
    return value unless value.is_a?(Hash)

    value.deep_transform_keys { |key| key.to_s.camelize }
  end
end
