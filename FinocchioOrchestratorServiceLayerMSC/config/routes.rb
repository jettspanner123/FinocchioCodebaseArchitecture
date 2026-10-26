Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get "Api/V1/HealthCheck", to: "features/health_check/health_check#index"
  get "Api/V1/HealthCheck/Ping", to: "features/health_check/health_check#ping"

  post "Api/V1/Authentication/SignUp", to: "features/authentication/authentication#sign_up"
  post "Api/V1/Authentication/Login", to: "features/authentication/authentication#login"
  post "Api/V1/Authentication/Refresh", to: "features/authentication/authentication#refresh"
  post "Api/V1/Authentication/Logout", to: "features/authentication/authentication#logout"
  post "Api/V1/Authentication/GoogleSignIn", to: "features/authentication/authentication#google_sign_in"

  # Defines the root path route ("/")
  # root "posts#index"
end
