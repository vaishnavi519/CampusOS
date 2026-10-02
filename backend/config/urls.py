from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse


def home(request):
    return HttpResponse("CampusOS Python Backend is running!")


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("campusos.urls")),
]