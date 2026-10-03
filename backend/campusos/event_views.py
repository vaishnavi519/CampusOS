from django.utils import timezone
from django.db import IntegrityError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from campusos.models import (
    Events,
    Clubs,
    Attendance,
    EventRegistrations,
    Users,
)


def event_data(event):
    club = Clubs.objects.filter(id=event.club_id).first()

    return {
        "id": event.id,
        "club_id": event.club_id,
        "club_name": club.name if club else "Unknown club",
        "club_logo_url": None,
        "title": event.title,
        "description": event.description,
        "event_date": event.event_date,
        "event_time": event.event_time,
        "venue": event.venue,
        "capacity": event.capacity,
        "eligibility": event.eligibility,
        "status": event.status,
        "rejection_reason": event.rejection_reason,
        "created_by": event.created_by_id,
        "approved_by": event.approved_by_id,
        "approved_at": event.approved_at,
        "created_at": event.created_at,
    }


def can_manage_event(user, event):
    club = Clubs.objects.filter(id=event.club_id).first()

    if not club:
        return False

    return (
        user.role == "SYSTEM_ADMIN"
        or (
            user.role == "CLUB_ADMIN"
            and club.admin_id == user.id
        )
        or (
            user.role == "FACULTY_COORDINATOR"
            and club.faculty_coordinator_id == user.id
        )
    )


# GET /api/events
# POST /api/events
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def event_list(request):

    if request.method == "GET":

        if request.user.role == "STUDENT":
            events = Events.objects.filter(
                status="PUBLISHED"
            )

        elif request.user.role == "CLUB_ADMIN":
            club_ids = Clubs.objects.filter(
                admin_id=request.user.id
            ).values_list("id", flat=True)

            events = Events.objects.filter(
                club_id__in=club_ids
            )

        elif request.user.role == "FACULTY_COORDINATOR":
            club_ids = Clubs.objects.filter(
                faculty_coordinator_id=request.user.id
            ).values_list("id", flat=True)

            events = Events.objects.filter(
                club_id__in=club_ids,
                status__in=[
                    "PENDING_APPROVAL",
                    "APPROVED",
                    "PUBLISHED",
                ]
            )

        else:
            events = Events.objects.all()

        return Response([
            event_data(event)
            for event in events.order_by(
                "event_date",
                "event_time"
            )
        ])

    # CREATE EVENT
    if request.user.role not in ["CLUB_ADMIN", "SYSTEM_ADMIN"]:
        return Response(
            {"message": "Only club admins can create events"},
            status=status.HTTP_403_FORBIDDEN
        )

    club_id = request.data.get("club_id")

    try:
        club = Clubs.objects.get(id=club_id)
    except (Clubs.DoesNotExist, ValueError, TypeError):
        return Response(
            {"message": "Club not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if (
        request.user.role == "CLUB_ADMIN"
        and club.admin_id != request.user.id
    ):
        return Response(
            {"message": "You cannot create events for this club"},
            status=status.HTTP_403_FORBIDDEN
        )

    required = [
        "title",
        "event_date",
        "event_time",
        "venue",
        "capacity",
    ]

    for field in required:
        if not request.data.get(field):
            return Response(
                {"message": f"{field} is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

    try:
        event = Events.objects.create(
            club_id=club.id,
            title=request.data["title"],
            description=request.data.get("description"),
            event_date=request.data["event_date"],
            event_time=request.data["event_time"],
            venue=request.data["venue"],
            capacity=int(request.data["capacity"]),
            eligibility=request.data.get("eligibility"),
            status="DRAFT",
            created_by_id=request.user.id,
        )
    except (ValueError, TypeError, IntegrityError):
        return Response(
            {"message": "Invalid event details"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {
            "message": "Event created successfully",
            "event": event_data(event),
        },
        status=status.HTTP_201_CREATED
    )


# GET /api/events/<event_id>
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def event_detail(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if (
        event.status != "PUBLISHED"
        and not can_manage_event(request.user, event)
    ):
        return Response(
            {"message": "You cannot view this event"},
            status=status.HTTP_403_FORBIDDEN
        )

    return Response(event_data(event))


# GET /api/my-events
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_events(request):

    if request.user.role != "CLUB_ADMIN":
        return Response(
            {"message": "Only club admins can view their events"},
            status=status.HTTP_403_FORBIDDEN
        )

    club_ids = Clubs.objects.filter(
        admin_id=request.user.id
    ).values_list("id", flat=True)

    events = Events.objects.filter(
        club_id__in=club_ids
    ).order_by("event_date", "event_time")

    return Response([
        event_data(event)
        for event in events
    ])


# GET /api/events/pending
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_events(request):

    if request.user.role != "FACULTY_COORDINATOR":
        return Response(
            {"message": "Faculty coordinator access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    club_ids = Clubs.objects.filter(
        faculty_coordinator_id=request.user.id
    ).values_list("id", flat=True)

    events = Events.objects.filter(
        club_id__in=club_ids,
        status="PENDING_APPROVAL"
    )

    return Response([
        event_data(event)
        for event in events
    ])


# GET /api/events/approved
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def approved_events(request):

    if request.user.role != "SYSTEM_ADMIN":
        return Response(
            {"message": "System admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    events = Events.objects.filter(
        status="APPROVED"
    )

    return Response([
        event_data(event)
        for event in events
    ])


# PATCH /api/events/<event_id>/submit
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def submit_event(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if (
        request.user.role != "CLUB_ADMIN"
        or not can_manage_event(request.user, event)
    ):
        return Response(
            {"message": "Club admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    if event.status != "DRAFT":
        return Response(
            {"message": "Only draft events can be submitted"},
            status=status.HTTP_400_BAD_REQUEST
        )

    event.status = "PENDING_APPROVAL"
    event.rejection_reason = None
    event.save(update_fields=["status", "rejection_reason"])

    return Response({
        "message": "Event submitted for faculty approval",
        "event": event_data(event),
    })


# PATCH /api/events/<event_id>/approve
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_event(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    club = Clubs.objects.filter(id=event.club_id).first()

    if (
        request.user.role != "FACULTY_COORDINATOR"
        or not club
        or club.faculty_coordinator_id != request.user.id
    ):
        return Response(
            {"message": "Faculty coordinator access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    if event.status != "PENDING_APPROVAL":
        return Response(
            {"message": "Only pending events can be approved"},
            status=status.HTTP_400_BAD_REQUEST
        )

    event.status = "APPROVED"
    event.approved_by_id = request.user.id
    event.approved_at = timezone.now()

    event.save(update_fields=[
        "status",
        "approved_by",
        "approved_at",
    ])

    return Response({
        "message": "Event approved successfully",
        "event": event_data(event),
    })


# PATCH /api/events/<event_id>/reject
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reject_event(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if (
        request.user.role != "FACULTY_COORDINATOR"
        or not can_manage_event(request.user, event)
    ):
        return Response(
            {"message": "Faculty coordinator access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    if event.status != "PENDING_APPROVAL":
        return Response(
            {"message": "Only pending events can be rejected"},
            status=status.HTTP_400_BAD_REQUEST
        )

    event.status = "REJECTED"
    event.rejection_reason = request.data.get("reason", "")

    event.save(update_fields=[
        "status",
        "rejection_reason",
    ])

    return Response({
        "message": "Event rejected",
        "event": event_data(event),
    })


# PATCH /api/events/<event_id>/publish
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def publish_event(request, event_id):

    if request.user.role != "SYSTEM_ADMIN":
        return Response(
            {"message": "System admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if event.status != "APPROVED":
        return Response(
            {"message": "Only approved events can be published"},
            status=status.HTTP_400_BAD_REQUEST
        )

    event.status = "PUBLISHED"
    event.save(update_fields=["status"])

    return Response({
        "message": "Event published successfully",
        "event": event_data(event),
    })


# GET /api/events/<event_id>/attendance
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_attendance(request, event_id):

    if request.user.role != "CLUB_ADMIN":
        return Response(
            {"message": "Only club admins can view attendance."},
            status=status.HTTP_403_FORBIDDEN
        )

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club = Clubs.objects.filter(id=event.club_id).first()

    if not club or club.admin_id != request.user.id:
        return Response(
            {"message": "You do not administer this event."},
            status=status.HTTP_403_FORBIDDEN
        )

    records = Attendance.objects.filter(
        event_id=event_id
    ).order_by("student_id")

    return Response([
        {
            "student_id": record.student_id,
            "status": record.status,
            "marked_at": record.marked_at,
        }
        for record in records
    ])


# POST /api/events/<event_id>/attendance/mark
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_attendance(request, event_id):

    if request.user.role != "CLUB_ADMIN":
        return Response(
            {"message": "Only club admins can mark attendance."},
            status=status.HTTP_403_FORBIDDEN
        )

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    club = Clubs.objects.filter(id=event.club_id).first()

    if not club or club.admin_id != request.user.id:
        return Response(
            {"message": "You do not administer this event."},
            status=status.HTTP_403_FORBIDDEN
        )

    student_id = request.data.get("student_id")
    attendance_status = request.data.get("status")

    if not student_id:
        return Response(
            {"message": "student_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if attendance_status not in ["PRESENT", "ABSENT"]:
        return Response(
            {"message": "Status must be PRESENT or ABSENT."},
            status=status.HTTP_400_BAD_REQUEST
        )

    registered = EventRegistrations.objects.filter(
        event_id=event_id,
        student_id=student_id
    ).exclude(status="CANCELLED").exists()

    if not registered:
        return Response(
            {"message": "This student is not registered for the event."},
            status=status.HTTP_400_BAD_REQUEST
        )

    record, created = Attendance.objects.update_or_create(
        event_id=event_id,
        student_id=student_id,
        defaults={
            "status": attendance_status,
            "marked_by_id": request.user.id,
            "marked_at": timezone.now(),
        }
    )

    return Response(
        {
            "message": "Attendance marked successfully.",
            "attendance": {
                "student_id": record.student_id,
                "status": record.status,
                "marked_at": record.marked_at,
            },
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )
    )


# GET /api/events/<event_id>/registrations
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_event_registrations(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if not can_manage_event(request.user, event):
        return Response(
            {"message": "You are not allowed to view these registrations."},
            status=status.HTTP_403_FORBIDDEN
        )

    registrations = EventRegistrations.objects.filter(
        event_id=event_id
    ).order_by("-registered_at")

    student_ids = [
        registration.student_id
        for registration in registrations
    ]

    students = Users.objects.filter(
        id__in=student_ids
    ).in_bulk()

    registration_list = []

    for registration in registrations:
        student = students.get(registration.student_id)

        registration_list.append({
            "registration_id": registration.id,
            "student_id": registration.student_id,
            "student_name": student.name if student else "Unknown Student",
            "student_email": student.email if student else "",
            "status": registration.status,
            "registered_at": registration.registered_at,
        })

    return Response({
        "event": event_data(event),
        "registrations": registration_list,
    })