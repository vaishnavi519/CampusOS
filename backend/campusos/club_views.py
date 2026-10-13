
from django.db import IntegrityError
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from campusos.models import Clubs, ClubMemberships, Users


def club_data(club):
    return {
        "id": club.id,
        "name": club.name,
        "description": club.description,
        "category": club.category,
        "admin_id": club.admin_id,
        "faculty_coordinator_id": club.faculty_coordinator_id,
        "status": club.status,
        "created_at": club.created_at,
    }


def membership_data(membership):
    try:
        student = Users.objects.get(id=membership.student_id)
        student_name = student.name
        student_email = student.email
    except Users.DoesNotExist:
        student_name = "Unknown student"
        student_email = ""

    return {
        "id": membership.id,
        "membership_id": membership.id,
        "club_id": membership.club_id,
        "student_id": membership.student_id,
        "student_name": student_name,
        "student_email": student_email,
        "status": membership.status,
        "applied_at": membership.applied_at,
        "reviewed_at": membership.reviewed_at,
        "reviewed_by": membership.reviewed_by_id,
    }


def can_manage_club(user, club):
    return (
        user.role == "SYSTEM_ADMIN"
        or user.id == club.admin_id
        or user.id == club.faculty_coordinator_id
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_coordinators(request):
    if request.user.role not in ["CLUB_ADMIN", "SYSTEM_ADMIN"]:
        return Response(
            {"message": "Only club admins or system admins can view faculty coordinators"},
            status=status.HTTP_403_FORBIDDEN,
        )

    coordinators = Users.objects.filter(
        role="FACULTY_COORDINATOR"
    ).order_by("name")

    return Response([
        {
            "id": person.id,
            "name": person.name,
            "email": person.email,
        }
        for person in coordinators
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def club_list(request):
    user = request.user

    if user.role == "SYSTEM_ADMIN":
        clubs = Clubs.objects.all()
    elif user.role == "CLUB_ADMIN":
        clubs = Clubs.objects.filter(admin_id=user.id)
    elif user.role == "FACULTY_COORDINATOR":
        clubs = Clubs.objects.filter(faculty_coordinator_id=user.id)
    else:
        clubs = Clubs.objects.filter(status="ACTIVE")

    clubs = clubs.order_by("name")
    return Response([club_data(club) for club in clubs])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def club_detail(request, club_id):
    try:
        club = Clubs.objects.get(id=club_id)
    except Clubs.DoesNotExist:
        return Response(
            {"message": "Club not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if club.status != "ACTIVE" and not can_manage_club(request.user, club):
        return Response(
            {"message": "You are not allowed to view this club"},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(club_data(club))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_club(request):
    user = request.user

    if user.role not in ["CLUB_ADMIN", "SYSTEM_ADMIN"]:
        return Response(
            {"message": "Only club admins or system admins can create clubs"},
            status=status.HTTP_403_FORBIDDEN,
        )

    name = request.data.get("name", "")
    category = request.data.get("category", "")
    description = request.data.get("description") or ""
    faculty_id = request.data.get("faculty_coordinator_id")

    if not isinstance(name, str) or not isinstance(category, str):
        return Response(
            {"message": "Name and category must be text"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    name = name.strip()
    category = category.strip()

    if not name or not category or not faculty_id:
        return Response(
            {"message": "Name, category and faculty_coordinator_id are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        faculty = Users.objects.get(
            id=faculty_id,
            role="FACULTY_COORDINATOR",
        )
    except (Users.DoesNotExist, ValueError, TypeError):
        return Response(
            {"message": "Valid faculty coordinator not found"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    admin_id = user.id

    if user.role == "SYSTEM_ADMIN":
        requested_admin_id = request.data.get("admin_id")

        if requested_admin_id:
            try:
                club_admin = Users.objects.get(
                    id=requested_admin_id,
                    role="CLUB_ADMIN",
                )
                admin_id = club_admin.id
            except (Users.DoesNotExist, ValueError, TypeError):
                return Response(
                    {"message": "Valid club admin not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

    try:
        club = Clubs.objects.create(
            name=name,
            description=description,
            category=category,
            admin_id=admin_id,
            faculty_coordinator_id=faculty.id,
            status="PENDING",
        )
    except IntegrityError:
        return Response(
            {"message": "Could not create club"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Club created and submitted for approval",
            "club": club_data(club),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_membership(request, club_id):
    if request.user.role != "STUDENT":
        return Response(
            {"message": "Only students can apply for club membership"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        club = Clubs.objects.get(id=club_id, status="ACTIVE")
    except Clubs.DoesNotExist:
        return Response(
            {"message": "Active club not found. The club may still be awaiting approval."},
            status=status.HTTP_404_NOT_FOUND,
        )

    existing = ClubMemberships.objects.filter(
        club_id=club.id,
        student_id=request.user.id,
    ).first()

    if existing:
        if existing.status in ["PENDING", "APPROVED"]:
            return Response(
                {"message": "You already have a pending or approved membership"},
                status=status.HTTP_409_CONFLICT,
            )

        existing.status = "PENDING"
        existing.applied_at = timezone.now()
        existing.reviewed_at = None
        existing.reviewed_by_id = None
        existing.save(
            update_fields=[
                "status",
                "applied_at",
                "reviewed_at",
                "reviewed_by",
            ]
        )
        membership = existing
    else:
        try:
            membership = ClubMemberships.objects.create(
                club_id=club.id,
                student_id=request.user.id,
                status="PENDING",
            )
        except IntegrityError:
            return Response(
                {"message": "Membership application already exists"},
                status=status.HTTP_409_CONFLICT,
            )

    return Response(
        {
            "message": "Membership application submitted",
            "membership": membership_data(membership),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_memberships(request):
    memberships = ClubMemberships.objects.filter(
        student_id=request.user.id,
    ).order_by("-applied_at")

    return Response([
        membership_data(item) for item in memberships
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def club_memberships(request, club_id):
    try:
        club = Clubs.objects.get(id=club_id)
    except Clubs.DoesNotExist:
        return Response(
            {"message": "Club not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not can_manage_club(request.user, club):
        return Response(
            {"message": "You are not allowed to view these applications"},
            status=status.HTTP_403_FORBIDDEN,
        )

    memberships = ClubMemberships.objects.filter(
        club_id=club.id
    ).order_by("-applied_at")

    return Response([
        membership_data(item) for item in memberships
    ])


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def review_membership(request, membership_id):
    try:
        membership = ClubMemberships.objects.get(id=membership_id)
        club = Clubs.objects.get(id=membership.club_id)
    except (ClubMemberships.DoesNotExist, Clubs.DoesNotExist):
        return Response(
            {"message": "Membership application not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not can_manage_club(request.user, club):
        return Response(
            {"message": "You are not allowed to review this application"},
            status=status.HTTP_403_FORBIDDEN,
        )

    decision = request.data.get("status", "").upper()

    if decision not in ["APPROVED", "REJECTED"]:
        return Response(
            {"message": "Status must be APPROVED or REJECTED"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if membership.status != "PENDING":
        return Response(
            {"message": "This application has already been reviewed"},
            status=status.HTTP_409_CONFLICT,
        )

    membership.status = decision
    membership.reviewed_at = timezone.now()
    membership.reviewed_by_id = request.user.id
    membership.save(
        update_fields=[
            "status",
            "reviewed_at",
            "reviewed_by",
        ]
    )

    return Response({
        "message": f"Membership {decision.lower()}",
        "membership": membership_data(membership),
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_club(request, club_id):
    user = request.user

    if user.role not in ["FACULTY_COORDINATOR", "SYSTEM_ADMIN"]:
        return Response(
            {"message": "Only faculty coordinators or system admins can approve clubs"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        club = Clubs.objects.get(id=club_id)
    except Clubs.DoesNotExist:
        return Response(
            {"message": "Club not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if (
        user.role == "FACULTY_COORDINATOR"
        and club.faculty_coordinator_id != user.id
    ):
        return Response(
            {"message": "You are not assigned to this club"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if club.status != "PENDING":
        return Response(
            {"message": "Only pending clubs can be approved"},
            status=status.HTTP_409_CONFLICT,
        )

    decision = request.data.get("status", "APPROVED").upper()

    if decision not in ["APPROVED", "REJECTED"]:
        return Response(
            {"message": "Status must be APPROVED or REJECTED"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    club.status = "ACTIVE" if decision == "APPROVED" else "INACTIVE"
    club.save(update_fields=["status"])

    return Response({
        "message": f"Club {decision.lower()} successfully",
        "club": club_data(club),
    })
