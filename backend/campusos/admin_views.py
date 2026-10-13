
import bcrypt

from django.db import IntegrityError
from django.db.models import Count
from django.utils import timezone

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

    today = timezone.localdate()

    # Existing statistics: keep these keys for compatibility.
    total_users = Users.objects.count()
    total_clubs = Clubs.objects.count()
    total_events = Events.objects.count()
    total_registrations = EventRegistrations.objects.exclude(
        status="CANCELLED"
    ).count()
    total_attendance = Attendance.objects.count()

    # Real database counts.
    total_students = Users.objects.filter(role="STUDENT").count()
    total_club_admins = Users.objects.filter(role="CLUB_ADMIN").count()
    total_faculty = Users.objects.filter(
        role="FACULTY_COORDINATOR"
    ).count()
    total_system_admins = Users.objects.filter(
        role="SYSTEM_ADMIN"
    ).count()

    pending_membership_requests = ClubMemberships.objects.filter(
        status="PENDING"
    ).count()

    approved_memberships = ClubMemberships.objects.filter(
        status="APPROVED"
    ).count()

    upcoming_events = Events.objects.filter(
        event_date__gte=today
    ).count()

    # Group records by their actual stored status values.
    event_statuses = list(
        Events.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    membership_statuses = list(
        ClubMemberships.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    registration_statuses = list(
        EventRegistrations.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )

    # Recent events are read-only and include the related club name.
    recent_events = list(
        Events.objects.select_related("club")
        .order_by("-created_at", "-id")
        .values(
            "id",
            "title",
            "event_date",
            "status",
            "club__name",
        )[:5]
    )

    for event in recent_events:
        event["event_date"] = (
            event["event_date"].isoformat()
            if event["event_date"]
            else None
        )
        event["club_name"] = event.pop("club__name")

    return Response({
        # Existing response fields.
        "total_users": total_users,
        "total_clubs": total_clubs,
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_attendance": total_attendance,

        # New dashboard analytics.
        "total_students": total_students,
        "total_club_admins": total_club_admins,
        "total_faculty_coordinators": total_faculty,
        "total_system_admins": total_system_admins,
        "pending_membership_requests": pending_membership_requests,
        "approved_memberships": approved_memberships,
        "upcoming_events": upcoming_events,
        "event_statuses": event_statuses,
        "membership_statuses": membership_statuses,
        "registration_statuses": registration_statuses,
        "recent_events": recent_events,
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
