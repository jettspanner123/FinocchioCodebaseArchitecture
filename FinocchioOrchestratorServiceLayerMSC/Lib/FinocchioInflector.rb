# This project's files are named PascalCase, identical to the class they define
# (UserModel.rb -> UserModel, JSONWebTokenService.rb -> JSONWebTokenService).
# Zeitwerk's default inflector uses Ruby's String#capitalize, which lowercases
# everything after the first letter -- "JSONWebTokenService".capitalize produces
# "Jsonwebtokenservice", destroying internal capitals and acronyms. This inflector
# passes an already-PascalCase basename through unchanged, and only falls back to
# default snake_case-to-CamelCase behavior for anything that isn't (Rails' own
# generated files, e.g. application_record.rb, which are left untouched).
#
# See FinocchioOrchestratorServiceLayerMSC/CODING-RULES.md for the full rationale.
class FinocchioInflector < Zeitwerk::Inflector
  def camelize(basename, abspath)
    return basename if basename =~ /\A[A-Z]/

    super
  end
end
