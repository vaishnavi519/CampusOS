from django.urls import path

from campusos import (
    auth_views,
    club_views,
    event_views,
    notification_views,
    student_views,
    admin_views,
)

urlpatterns = [
    # Authentication
    path("auth/register", auth_views.register),
    path("auth/login", auth_views.login),
    path("auth/profile", auth_views.profile),

   # Administrator
   path("stats/platform", admin_views.platform_stats),
   path("users", admin_views.list_users),
   path("users/create", admin_views.create_user),
   path(
    "users/<int:user_id>/reset-password",
    admin_views.reset_user_password,
),

    # Clubs
    path("clubs", club_views.club_list),
    path("clubs/create", club_views.create_club),
    path("clubs/<int:club_id>", club_views.club_detail),
    path("clubs/<int:club_id>/approval", club_views.approve_club),
    path("clubs/<int:club_id>/apply", club_views.apply_membership),
    path("clubs/<int:club_id>/memberships", club_views.club_memberships),
    path("memberships/my", club_views.my_memberships),
    path(
        "memberships/<int:membership_id>/review",
        club_views.review_membership,
    ),

      # Events
    path("events", event_views.event_list),
    path("events/pending", event_views.pending_events),
    path("events/approved", event_views.approved_events),
    path("events/<int:event_id>/submit", event_views.submit_event),
    path("events/<int:event_id>/approve", event_views.approve_event),
    path("events/<int:event_id>/reject", event_views.reject_event),
    path("events/<int:event_id>/publish", event_views.publish_event),
    path("events/<int:event_id>/register", student_views.register_for_event),
    path("events/<int:event_id>", event_views.event_detail),
    path("my-events", event_views.my_events),
    path("events/<int:event_id>/attendance", event_views.list_attendance),
    path("events/<int:event_id>/attendance/mark", event_views.mark_attendance),

    path(
    "events/<int:event_id>/registrations",
    event_views.list_event_registrations
),

    # Student registrations and participation
    path("my-registrations", student_views.my_registrations),
    path(
        "registrations/<int:registration_id>/cancel",
        student_views.cancel_registration,
    ),
    path("reports/my-participation", student_views.my_participation),
    path("recommendations", student_views.recommendations),

    # Notifications
    path("notifications", notification_views.notification_list),
    path("notifications/unread-count", notification_views.unread_count),
    path("notifications/read-all", notification_views.mark_all_notifications_read),
    path(
        "notifications/<int:notification_id>/read",
        notification_views.mark_notification_read,
    ),
]