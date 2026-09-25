from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    ProfileView,
    ChangePasswordView,
    logout,
    delete_account
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),

    # Profile
    path('me/', ProfileView.as_view(), name='me'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('delete-account/', delete_account, name='delete-account'),
]
