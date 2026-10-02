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