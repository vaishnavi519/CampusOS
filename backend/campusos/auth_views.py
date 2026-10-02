import bcrypt

from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from campusos.models import Users


def create_tokens(user):
    refresh = RefreshToken()
    refresh["user_id"] = user.id
    refresh["email"] = user.email
    refresh["role"] = user.role

    access = refresh.access_token
    access["user_id"] = user.id
    access["email"] = user.email
    access["role"] = user.role

    return {
        "access": str(access),
        "refresh": str(refresh),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not name or not email or not password:
        return Response(
            {"message": "Name, email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {"message": "Password must be at least 8 characters"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Users.objects.filter(email=email).exists():
        return Response(
            {"message": "Email already registered"},
            status=status.HTTP_409_CONFLICT
        )

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        user = Users.objects.create(
            name=name,
            email=email,
            password=hashed_password,
            role="STUDENT"
        )
    except IntegrityError:
        return Response(
            {"message": "Email already registered"},
            status=status.HTTP_409_CONFLICT
        )

    return Response({
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        "tokens": create_tokens(user)
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    try:
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response(
            {"message": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        valid = bcrypt.checkpw(
            password.encode("utf-8"),
            user.password.encode("utf-8")
        )
    except (ValueError, TypeError):
        valid = False

    if not valid:
        return Response(
            {"message": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        "tokens": create_tokens(user)
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    return Response({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })