
from django.utils import timezone
from django.db import connection, transaction

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from campusos.models import (
    Events,
    EventRegistrations,
    Attendance,
    ClubMemberships,
)


def event_data(event):
    return {
        "id": event.id,
        "event_id": event.id,
        "club_id": event.club_id,
        "club_name": event.club.name if event.club_id else None,
        "title": event.title,
        "description": event.description or "",
        "event_date": event.event_date,
        "event_time": event.event_time,
        "venue": event.venue,
        "capacity": event.capacity,
        "eligibility": event.eligibility or "",
        "status": event.status,
    }


# GET /api/my-registrations
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_registrations(request):
    registrations = (
        EventRegistrations.objects
        .filter(student_id=request.user.id)
        .select_related("event", "event__club")
        .order_by("-registered_at")
    )

    result = []

    for registration in registrations:
        item = event_data(registration.event)
        item.update({
            "registration_id": registration.id,
            "registration_status": registration.status,
            "status": registration.status,
            "registered_at": registration.registered_at,
            "cancelled_at": registration.cancelled_at,
        })
        result.append(item)

    return Response(result)


# PATCH /api/registrations/<registration_id>/cancel
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_registration(request, registration_id):
    registration = EventRegistrations.objects.filter(
        id=registration_id,
        student_id=request.user.id,
    ).first()

    if not registration:
        return Response(
            {"message": "Registration not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if registration.status == "CANCELLED":
        return Response(
            {"message": "Registration is already cancelled."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    registration.status = "CANCELLED"
    registration.cancelled_at = timezone.now()
    registration.save(update_fields=["status", "cancelled_at"])

    return Response({
        "message": "Registration cancelled successfully.",
        "registration_id": registration.id,
        "status": registration.status,
    })


# GET /api/reports/my-participation
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_participation(request):
    attendance_records = (
        Attendance.objects
        .filter(student_id=request.user.id)
        .select_related("event", "event__club")
        .order_by("-marked_at")
    )

    result = []

    for record in attendance_records:
        item = event_data(record.event)
        item.update({
            "attendance_id": record.id,
            "attendance_status": record.status,
            "status": record.status,
            "marked_at": record.marked_at,
        })
        result.append(item)

    return Response(result)


# GET /api/recommendations
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommendations(request):
    my_club_ids = set(
        ClubMemberships.objects.filter(
            student_id=request.user.id,
            status="APPROVED",
        ).values_list("club_id", flat=True)
    )

    registered_event_ids = EventRegistrations.objects.filter(
        student_id=request.user.id,
    ).exclude(
        status="CANCELLED"
    ).values_list("event_id", flat=True)

    events = (
        Events.objects
        .filter(
            status="PUBLISHED",
            event_date__gte=timezone.localdate(),
        )
        .exclude(id__in=registered_event_ids)
        .select_related("club")
        .order_by("event_date", "event_time")
    )

    result = []

    for event in events:
        from_my_club = event.club_id in my_club_ids

        result.append({
            "id": event.id,
            "event_id": event.id,
            "title": event.title,
            "club_id": event.club_id,
            "club_name": event.club.name if event.club_id else None,
            "event_date": event.event_date,
            "event_time": event.event_time,
            "venue": event.venue,
            "reason": (
                f"From {event.club.name}, which you are a member of"
                if from_my_club
                else "Open to all students"
            ),
        })

    result.sort(
        key=lambda item: (
            0 if item["club_id"] in my_club_ids else 1,
            str(item["event_date"]),
        )
    )

    return Response(result[:6])


# POST /api/events/<event_id>/register
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_for_event(request, event_id):
    if request.user.role != "STUDENT":
        return Response(
            {"message": "Only students can register for events."},
            status=status.HTTP_403_FORBIDDEN,
        )

    event = Events.objects.filter(
        id=event_id,
        status="PUBLISHED",
    ).first()

    if not event:
        return Response(
            {"message": "Event not found or registration is not open."},
            status=status.HTTP_404_NOT_FOUND,
        )

    with transaction.atomic():
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT status
                FROM event_registrations
                WHERE event_id = %s AND student_id = %s
                FOR UPDATE
                """,
                [event_id, request.user.id],
            )

            existing = cursor.fetchone()

            if existing and existing[0] != "CANCELLED":
                return Response(
                    {"message": "You are already registered for this event."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cursor.execute(
                """
                SELECT COUNT(*)
                FROM event_registrations
                WHERE event_id = %s AND status != 'CANCELLED'
                """,
                [event_id],
            )

            registered_count = cursor.fetchone()[0]

            if registered_count >= event.capacity:
                return Response(
                    {"message": "Sorry, this event is full."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            now = timezone.now()

            if existing:
                cursor.execute(
                    """
                    UPDATE event_registrations
                    SET status = 'REGISTERED',
                        registered_at = %s,
                        cancelled_at = NULL
                    WHERE event_id = %s AND student_id = %s
                    """,
                    [now, event_id, request.user.id],
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO event_registrations
                    (event_id, student_id, status, registered_at)
                    VALUES (%s, %s, 'REGISTERED', %s)
                    """,
                    [event_id, request.user.id, now],
                )

    return Response(
        {"message": "Successfully registered for the event."},
        status=status.HTTP_201_CREATED,
    )