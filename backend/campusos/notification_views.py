from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from campusos.models import Notifications


def notification_data(notification):
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "body": notification.message,
        "type": notification.type,
        "is_read": bool(notification.is_read),
        "read": bool(notification.is_read),
        "created_at": notification.created_at,
        "link": notification.link,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifications = Notifications.objects.filter(
        user_id=request.user.id
    ).order_by("-created_at")

    return Response([
        notification_data(item)
        for item in notifications
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notifications.objects.filter(
        user_id=request.user.id,
        is_read=0
    ).count()

    return Response({"count": count})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    notification = Notifications.objects.filter(
        id=notification_id,
        user_id=request.user.id
    ).first()

    if not notification:
        return Response(
            {"message": "Notification not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = 1
    notification.save(update_fields=["is_read"])

    return Response({
        "message": "Notification marked as read",
        "notification": notification_data(notification)
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    updated = Notifications.objects.filter(
        user_id=request.user.id,
        is_read=0
    ).update(is_read=1)

    return Response({
        "message": "All notifications marked as read",
        "updated": updated
    })