# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Announcements(models.Model):
    club = models.ForeignKey('Clubs', models.DO_NOTHING)
    created_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='created_by')
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'announcements'


class Attendance(models.Model):
    event = models.ForeignKey('Events', models.DO_NOTHING)
    student = models.ForeignKey('Users', models.DO_NOTHING)
    status = models.CharField(max_length=7)
    marked_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='marked_by', related_name='attendance_marked_by_set')
    marked_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attendance'
        unique_together = (('event', 'student'),)


class ClubMemberships(models.Model):
    club = models.ForeignKey('Clubs', models.DO_NOTHING)
    student = models.ForeignKey('Users', models.DO_NOTHING)
    status = models.CharField(max_length=8)
    applied_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='reviewed_by', related_name='clubmemberships_reviewed_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'club_memberships'
        unique_together = (('club', 'student'),)


class Clubs(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    admin = models.ForeignKey('Users', models.DO_NOTHING)
    faculty_coordinator = models.ForeignKey('Users', models.DO_NOTHING, related_name='clubs_faculty_coordinator_set')
    status = models.CharField(max_length=8)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'clubs'


class EventRegistrations(models.Model):
    event = models.ForeignKey('Events', models.DO_NOTHING)
    student = models.ForeignKey('Users', models.DO_NOTHING)
    status = models.CharField(max_length=10)
    registered_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'event_registrations'
        unique_together = (('event', 'student'),)


class Events(models.Model):
    club = models.ForeignKey(Clubs, models.DO_NOTHING)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    event_date = models.DateField()
    event_time = models.TimeField()
    venue = models.CharField(max_length=200)
    capacity = models.IntegerField()
    eligibility = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=16)
    rejection_reason = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='created_by')
    approved_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='approved_by', related_name='events_approved_by_set', blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'events'


class Notifications(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING)
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20)
    is_read = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notifications'


class Users(models.Model):
    ROLE_CHOICES = [
        ("STUDENT", "Student"),
        ("CLUB_ADMIN", "Club Admin"),
        ("FACULTY_COORDINATOR", "Faculty Coordinator"),
        ("SYSTEM_ADMIN", "System Admin"),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=19, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "users"

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return True

    def __str__(self):
        return self.email