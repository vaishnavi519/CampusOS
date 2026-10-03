
import bcrypt

from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from campusos.models import (
    Users,
    Clubs,
    Events,
    EventRegistrations,
    Attendance,
    ClubMemberships,
)


def check_system_admin(request):
    return request.user.role == "SYSTEM_ADMIN"


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def platform_stats(request):
    if not check_system_admin(request):
        return Response(
            {"message": "System Administrator access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response({
        "total_users": Users.objects.count(),
        "total_clubs": Clubs.objects.count(),
        "total_events": Events.objects.count(),
        "total_registrations": EventRegistrations.objects.exclude(
            status="CANCELLED"
        ).count(),
        "total_attendance": Attendance.objects.count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_users(request):
    if not check_system_admin(request):
        return Response(
            {"message": "System Administrator access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    users = Users.objects.all().order_by("name")
    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "clubs_administered": Clubs.objects.filter(
                admin_id=user.id
            ).count(),
            "memberships": ClubMemberships.objects.filter(
                student_id=user.id
            ).count(),
            "registrations": EventRegistrations.objects.filter(
                student_id=user.id
            ).count(),
        })

    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user(request):
    if not check_system_admin(request):
        return Response(
            {"message": "System Administrator access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    role = request.data.get("role", "").strip().upper()

    allowed_roles = {
        "STUDENT",
        "CLUB_ADMIN",
        "FACULTY_COORDINATOR",
        "SYSTEM_ADMIN",
    }

    if not name or not email or not password or not role:
        return Response(
            {"message": "Name, email, password and role are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 8:
        return Response(
            {"message": "Password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role not in allowed_roles:
        return Response(
            {"message": "Invalid account role."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if Users.objects.filter(email=email).exists():
        return Response(
            {"message": "Email already registered."},
            status=status.HTTP_409_CONFLICT,
        )

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    try:
        user = Users.objects.create(
            name=name,
            email=email,
            password=hashed_password,
            role=role,
        )
    except IntegrityError:
        return Response(
            {"message": "Email already registered."},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {
            "message": "Account created successfully.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reset_user_password(request, user_id):
    if not check_system_admin(request):
        return Response(
            {"message": "System Administrator access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    new_password = request.data.get("new_password", "")
    confirm_password = request.data.get("confirm_password", "")

    if not new_password or not confirm_password:
        return Response(
            {"message": "Both password fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"message": "Password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new_password != confirm_password:
        return Response(
            {"message": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = Users.objects.get(id=user_id)
    except Users.DoesNotExist:
        return Response(
            {"message": "User account not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    user.password = bcrypt.hashpw(
        new_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    user.save(update_fields=["password"])

    return Response({
        "message": f"Password reset successfully for {user.name}.",
        "user_id": user.id,
    })