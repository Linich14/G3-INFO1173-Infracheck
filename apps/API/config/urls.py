from django.contrib import admin
from django.urls import path
from interfaces.api.v1.register import RegisterView
from interfaces.api.v1.login import login_view
from interfaces.api.v1.verify_token import verify_token_view
from interfaces.api.v1.logout import logout_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/register/', RegisterView.as_view(), name='user-register'),
    path('api/v1/login/', login_view, name='user-login'),
    path('api/v1/verify-token/', verify_token_view, name='verify-token'),
    path('api/v1/logout/', logout_view, name='user-logout'),
]
