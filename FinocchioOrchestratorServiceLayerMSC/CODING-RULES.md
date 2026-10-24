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
  Services/{Name}Service.rb               → Features::{FeatureName}::Services::{Name}Service
  Models/{Name}Model.rb                   → Features::{FeatureName}::Models::{Name}Model
  Constants/{Name}Constant.rb             → Features::{FeatureName}::Constants::{Name}Constant
  Configuration/{Name}Configuration.rb    → Features::{FeatureName}::Configuration::{Name}Configuration (only if a feature genuinely needs one)
```

A model/service/constant that only one feature needs lives inside that feature's own folder, fully namespaced under `Features::{FeatureName}::...`.

### Global (`app/Models/`, `app/Services/`, `app/Helpers/`, `app/Utilities/`, `app/Constants/`)

The moment something is needed by more than one feature, it's promoted out of `Features/{X}/` into the matching global folder — same "promote once a second feature needs it" rule as the frontend's `Types/` folder.

```
app/Models/{Name}Model.rb       → {Name}Model        (no namespace prefix)
app/Services/{Name}Service.rb   → {Name}Service
app/Helpers/{Name}Helper.rb     → {Name}Helper
app/Utilities/{Name}Utility.rb  → {Name}Utility
app/Constants/{Name}Constant.rb → {Name}Constant
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

### File names are PascalCase, matching the class name exactly

Every file we author (`UserModel.rb`, `JSONWebTokenService.rb`, `AuthenticationController.rb`) is named identically to the class it defines — no snake_case filenames in this project's own code.

**This needs a custom inflector, not just acronym registration.** Zeitwerk's default inflector uses Ruby's `String#capitalize`, which doesn't just capitalize the first letter — it *lowercases everything after it* (`"JSONWebTokenService".capitalize` → `"Jsonwebtokenservice"`). Left on defaults, Zeitwerk would mangle any PascalCase filename with internal capitals. The fix is a small custom inflector that passes an already-PascalCase basename through unchanged, and only falls back to default snake_case-to-CamelCase behavior for anything that isn't (i.e. Rails' own generated files, which stay untouched — see below):

```ruby
# app/lib/finocchio_inflector.rb
class FinocchioInflector < Zeitwerk::Inflector
  def camelize(basename, abspath)
    return basename if basename =~ /\A[A-Z]/

    super
  end
end
```

```ruby
# config/initializers/finocchio_inflector.rb
Rails.autoloaders.main.inflector = FinocchioInflector.new
```

With this in place, acronym registration (`inflect.acronym "JSON"`) becomes unnecessary for *our own* files — since the filename already spells out `JSONWebTokenService` exactly, there's no snake_case-to-CamelCase inflection step happening for it to get wrong. Acronym registration in `config/initializers/inflections.rb` would only still matter for any snake_case file Rails itself generates and we don't rename (see below) — add one there only if that situation actually comes up.

**Rails' own generated files are left exactly as Rails made them** — `app/models/application_record.rb` (`ApplicationRecord`), `app/controllers/application_controller.rb` (`ApplicationController`), and anything else `rails new`/`rails generate` scaffolds before we touch it. These aren't renamed to PascalCase filenames; they're framework-owned, not part of this project's own authored code, and leaving them alone avoids any friction with future Rails upgrades or generator expectations.

## Naming Suffixes

| Category | Class suffix | File suffix |
|---|---|---|
| Model | `*Model` | `*Model.rb` |
| Service | `*Service` | `*Service.rb` |
| Controller | `*Controller` | `*Controller.rb` |
| Utility | `*Utility` | `*Utility.rb` |
| Helper | `*Helper` | `*Helper.rb` |
| Constant | `*Constant` | `*Constant.rb` |
| Configuration | `*Configuration` | `*Configuration.rb` |

The suffix is baked into both the file name and the actual class name — never stripped. E.g. `UserModel`, file `UserModel.rb`.

## Database Tables

Every table name strictly follows `FN_{SingularPascalCaseModelName}TBL` — a pure 1:1 rename from the model's core name (strip the `Model` suffix, keep it singular, wrap in `FN_...TBL`). E.g. `UserModel` → table `FN_UserTBL`; `RefreshTokenModel` → table `FN_RefreshTokenTBL`.

This doesn't match Rails' automatic pluralization-based table inference, so **every model requires an explicit override**:

```ruby
class UserModel < ApplicationRecord
  self.table_name = "FN_UserTBL"
end
```
