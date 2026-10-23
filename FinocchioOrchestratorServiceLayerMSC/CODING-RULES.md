# Coding Rules (Backend)

Finocchio's backend is Ruby on Rails. This is its own, independent convention — it does **not** mirror the frontend's `CODING-RULES.md` (that file is a different stack with different constraints). Where this file says something different from idiomatic Rails, this file wins, with the reasoning for the deviation recorded here so it isn't mysterious later.

**Ask before creating any file, folder, class, or constant — every name, no exceptions, no silent defaults.** This applies with full force even to things that feel trivial. If this file doesn't already answer a naming question, stop and ask.

## General

- Services, Helpers, Utilities, and Constants are singleton classes, exposed via a `.current` class-level instance — same discipline as the frontend, applied where Ruby/Rails allows it.
- Controllers are plain Rails `ActionController` classes — Rails itself requires this, not a project-specific choice.
- Models are ActiveRecord classes.
- Everything else (plain Ruby OOP: explicit classes over loose module functions, no stray top-level methods) — prefer a class even where Ruby would allow a bare function.

## Folder Structure

### Feature-wise (`app/Features/`)

```
app/Features/{FeatureName}/
  {FeatureName}Controller.rb              → Features::{FeatureName}::{FeatureName}Controller
  Services/{name}_service.rb              → Features::{FeatureName}::Services::{Name}Service
  Models/{name}_model.rb                  → Features::{FeatureName}::Models::{Name}Model
  Constants/{name}_constant.rb            → Features::{FeatureName}::Constants::{Name}Constant
  Configuration/{name}_configuration.rb   → Features::{FeatureName}::Configuration::{Name}Configuration (only if a feature genuinely needs one)
```

A model/service/constant that only one feature needs lives inside that feature's own folder, fully namespaced under `Features::{FeatureName}::...`.

### Global (`app/Models/`, `app/Services/`, `app/Helpers/`, `app/Utilities/`, `app/Constants/`)

The moment something is needed by more than one feature, it's promoted out of `Features/{X}/` into the matching global folder — same "promote once a second feature needs it" rule as the frontend's `Types/` folder.

```
app/Models/{name}_model.rb       → {Name}Model        (no namespace prefix)
app/Services/{name}_service.rb   → {Name}Service
app/Helpers/{name}_helper.rb     → {Name}Helper
app/Utilities/{name}_utility.rb  → {Name}Utility
app/Constants/{name}_constant.rb → {Name}Constant
```

`app/Models/` is a deliberate rename of Rails' own default `app/models/` (capitalized for consistency with the other global folders) — accepted even though it means `rails generate model` would need its output manually moved/recased, since Rails doesn't itself care about the directory's casing for autoloading purposes. `app/controllers/`, `app/jobs/`, `app/mailers/`, `app/channels/`, `app/views/` stay as Rails' own lowercase defaults — untouched, since nothing in this project's convention needs to claim them.

## Required Zeitwerk Configuration

Left to Rails' defaults, **`Features::` would silently disappear** from every namespace — Rails automatically treats every folder directly under `app/` as its own unnamespaced autoload root (this is exactly why `app/Services/foo_service.rb` → plain `FooService`, no prefix, which is what we want for the global folders). To make `Features::{FeatureName}::...` actually appear as real namespace segments instead of being silently collapsed:

```ruby
# config/application.rb, inside class Application < Rails::Application
config.autoload_paths.delete("#{config.root}/app/Features")

# config/initializers/features_autoloading.rb (after the above)
module Features; end
Rails.autoloaders.main.push_dir(Rails.root.join("app/Features"), namespace: Features)
```

This is standard, documented Zeitwerk/Rails configuration for isolating a namespace — not a workaround.

Acronyms must stay fully capitalized inside PascalCase names (`JSONWebTokenService`, not `JsonWebTokenService`). Register each one Rails' standard way, in `config/initializers/inflections.rb`:

```ruby
ActiveSupport::Inflector.inflections(:en) do |inflect|
  inflect.acronym "JSON"
  inflect.acronym "JWT"
end
```

Add new acronyms here as they come up — ask before adding one, same as any other naming decision.

## Naming Suffixes

| Category | Class suffix | File suffix |
|---|---|---|
| Model | `*Model` | `*_model.rb` |
| Service | `*Service` | `*_service.rb` |
| Controller | `*Controller` | `*_controller.rb` |
| Utility | `*Utility` | `*_utility.rb` |
| Helper | `*Helper` | `*_helper.rb` |
| Constant | `*Constant` | `*_constant.rb` |
| Configuration | `*Configuration` | `*_configuration.rb` |

The suffix is baked into both the file name and the actual class name — never stripped. E.g. `UserModel` (not `User`), file `user_model.rb`.

## Database Tables

Every table name strictly follows `FN_{SingularPascalCaseModelName}TBL` — a pure 1:1 rename from the model's core name (strip the `Model` suffix, keep it singular, wrap in `FN_...TBL`). E.g. `UserModel` → table `FN_UserTBL`; `RefreshTokenModel` → table `FN_RefreshTokenTBL`.

This doesn't match Rails' automatic pluralization-based table inference, so **every model requires an explicit override**:

```ruby
class UserModel < ApplicationRecord
  self.table_name = "FN_UserTBL"
end
```
