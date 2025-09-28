from django.contrib import admin
from django.urls import path
from interfaces.api.v1.register import RegisterView
from interfaces.api.v1.login import login_view
from interfaces.api.v1.verify_token import verify_token_view
from interfaces.api.v1.logout import logout_view
from interfaces.api.v1.request_password_reset import request_password_reset_view
from interfaces.api.v1.verify_reset_code import verify_reset_code_view
from interfaces.api.v1.reset_password import reset_password_view
from interfaces.api.v1.profile import profile_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/register/', RegisterView.as_view(), name='user-register'),
    path('api/v1/login/', login_view, name='user-login'),
    path('api/v1/verify-token/', verify_token_view, name='verify-token'),
    path('api/v1/logout/', logout_view, name='user-logout'),
    path('api/v1/request-password-reset/', request_password_reset_view, name='request-password-reset'),
    path('api/v1/verify-reset-code/', verify_reset_code_view, name='verify-reset-code'),
    path('api/v1/reset-password/', reset_password_view, name='reset-password'),
    path('api/v1/profile/', profile_view, name='user-profile'),
]
