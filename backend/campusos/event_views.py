from django.utils import timezone
from django.db import IntegrityError

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from campusos.models import Events, Clubs


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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def event_list(request):

    if request.method == "GET":

        if request.user.role == "STUDENT":
            events = Events.objects.filter(status="PUBLISHED")

        elif request.user.role == "CLUB_ADMIN":
            club_ids = Clubs.objects.filter(
                admin_id=request.user.id
            ).values_list("id", flat=True)

            events = Events.objects.filter(club_id__in=club_ids)

        elif request.user.role == "FACULTY_COORDINATOR":
            club_ids = Clubs.objects.filter(
                faculty_coordinator_id=request.user.id
            ).values_list("id", flat=True)

            events = Events.objects.filter(
                club_id__in=club_ids,
                status="PENDING_APPROVAL"
            )

        else:
            events = Events.objects.all()

        return Response([
            event_data(event)
            for event in events.order_by("event_date", "event_time")
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
        "capacity"
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
            created_by_id=request.user.id
        )
    except (ValueError, TypeError, IntegrityError):
        return Response(
            {"message": "Invalid event details"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {
            "message": "Event created successfully",
            "event": event_data(event)
        },
        status=status.HTTP_201_CREATED
    )


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


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def submit_event(request, event_id):

    event = Events.objects.filter(id=event_id).first()

    if not event:
        return Response(
            {"message": "Event not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user.role != "CLUB_ADMIN" or not can_manage_event(
        request.user, event
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
        "event": event_data(event)
    })


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
        "approved_at"
    ])

    return Response({
        "message": "Event approved successfully",
        "event": event_data(event)
    })


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
        "rejection_reason"
    ])

    return Response({
        "message": "Event rejected",
        "event": event_data(event)
    })


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
        "event": event_data(event)
    })