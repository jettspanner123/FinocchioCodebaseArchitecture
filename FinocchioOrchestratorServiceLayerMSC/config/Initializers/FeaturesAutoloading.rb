# Registers "Features" as a real Zeitwerk namespace, so
# app/Features/{FeatureName}/... produces Features::{FeatureName}::... constants
# instead of Rails' default behavior of treating app/Features as its own silent,
# unnamespaced autoload root (the same way app/Services or app/Models are).
#
# config/application.rb already excludes app/Features from the default
# autoload_paths glob so this doesn't get registered twice.
module Features; end

Rails.autoloaders.main.push_dir(Rails.root.join("app/Features"), namespace: Features)
