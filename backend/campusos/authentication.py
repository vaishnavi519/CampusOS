from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from campusos.models import Users


class CampusOSJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        if not user_id:
            raise AuthenticationFailed("Token does not contain user ID")

        try:
            return Users.objects.get(id=user_id)
        except Users.DoesNotExist:
            raise AuthenticationFailed("User not found")