require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Loaded via plain `require`, not Zeitwerk autoload: this class configures the
# autoloader itself, so it can't depend on the autoloader to find it first.
require_relative "../Lib/FinocchioInflector"

module FinocchioOrchestratorServiceLayerMsc
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets Tasks])

    # This project's own files (Models, Services, Controllers, Constants, etc.)
    # are PascalCase, matching their class name exactly -- see
    # Lib/FinocchioInflector.rb and CODING-RULES.md for why this is necessary.
    Rails.autoloaders.main.inflector = FinocchioInflector.new

    # app/Features is excluded from Rails' default per-directory autoload
    # rooting so "Features::" can be registered as a real namespace instead
    # (see config/Initializers/FeaturesAutoloading.rb), rather than silently
    # collapsing the way every other app/* folder does by default.
    config.autoload_paths.delete("#{config.root}/app/Features")
    config.eager_load_paths.delete("#{config.root}/app/Features")

    # This project renames Rails' own conventional folders to PascalCase
    # (config/Initializers, Lib/Tasks) -- see CODING-RULES.md for the
    # case-sensitivity caveat this required on this Windows dev machine.
    config.paths["config/initializers"] = "config/Initializers"
    config.paths["lib/tasks"] = "Lib/Tasks"

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true
  end
end
