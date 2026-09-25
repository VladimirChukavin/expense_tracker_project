import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db

REGISTER_URL = '/api/auth/register/'
LOGIN_URL = '/api/auth/login/'
ME_URL = '/api/auth/me/'
LOGOUT_URL = '/api/auth/logout/'
DELETE_URL = '/api/auth/delete-account/'


@pytest.fixture
def register_payload():
    return {
        'email': 'new@example.com',
        'password': 'Str0ng-Passw0rd!',
        'password2': 'Str0ng-Passw0rd!',
        'first_name': 'New',
        'last_name': 'User',
    }


class TestRegister:
    def test_register_returns_tokens_and_user(self, api_client, register_payload):
        response = api_client.post(REGISTER_URL, register_payload)

        assert response.status_code == 201
        data = response.data
        assert data['access']
        assert data['refresh']
        assert data['user']['email'] == register_payload['email']
        assert 'password' not in data['user']
        assert User.objects.filter(email=register_payload['email']).exists()

    def test_register_password_mismatch(self, api_client, register_payload):
        register_payload['password2'] = 'different'
        response = api_client.post(REGISTER_URL, register_payload)

        assert response.status_code == 400

    def test_register_duplicate_email(self, api_client, user, register_payload):
        register_payload['email'] = user.email
        response = api_client.post(REGISTER_URL, register_payload)

        assert response.status_code == 400


class TestLogin:
    def test_login_returns_tokens_and_user(self, api_client, user):
        response = api_client.post(
            LOGIN_URL,
            {'email': user.email, 'password': 'testpass123'},
        )

        assert response.status_code == 200
        assert response.data['access']
        assert response.data['refresh']
        assert response.data['user']['email'] == user.email

    def test_login_wrong_password(self, api_client, user):
        response = api_client.post(
            LOGIN_URL,
            {'email': user.email, 'password': 'wrong-password'},
        )

        assert response.status_code == 401


class TestProfile:
    def test_me_requires_auth(self, api_client):
        response = api_client.get(ME_URL)
        assert response.status_code == 401

    def test_me_returns_current_user(self, authenticated_client, user):
        response = authenticated_client.get(ME_URL)

        assert response.status_code == 200
        assert response.data['email'] == user.email


class TestLogout:
    def test_logout_blacklists_refresh_token(self, api_client, user):
        login = api_client.post(
            LOGIN_URL,
            {'email': user.email, 'password': 'testpass123'},
        )
        refresh = login.data['refresh']
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

        response = api_client.post(LOGOUT_URL, {'refresh': refresh})
        assert response.status_code == 200

        refresh_response = api_client.post(
            '/api/auth/token/refresh/', {'refresh': refresh}
        )
        assert refresh_response.status_code == 401

    def test_logout_without_token(self, authenticated_client):
        response = authenticated_client.post(LOGOUT_URL, {})
        assert response.status_code == 400

    def test_logout_with_garbage_token(self, authenticated_client):
        response = authenticated_client.post(LOGOUT_URL, {'refresh': 'not-a-token'})
        assert response.status_code == 400


class TestDeleteAccount:
    def test_delete_account_wrong_password(self, authenticated_client, user):
        response = authenticated_client.delete(
            DELETE_URL, {'password': 'wrong-password'}
        )

        assert response.status_code == 400
        assert User.objects.filter(pk=user.pk).exists()

    def test_delete_account_success(self, authenticated_client, user):
        response = authenticated_client.delete(
            DELETE_URL, {'password': 'testpass123'}
        )

        assert response.status_code == 204
        assert not User.objects.filter(pk=user.pk).exists()

    def test_delete_account_requires_auth(self, api_client):
        response = api_client.delete(DELETE_URL, {'password': 'x'})
        assert response.status_code == 401
