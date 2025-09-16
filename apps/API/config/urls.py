from django.contrib import admin
from django.urls import path
from interfaces.api.v1.register import RegisterView
from interfaces.api.v1.login import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/register/', RegisterView.as_view(), name='user-register'),
    path('api/v1/login/', LoginView.as_view(), name='user-login'),
]
