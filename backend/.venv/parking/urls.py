from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SlotViewSet, BookingViewSet

router = DefaultRouter()
router.register(r"slots", SlotViewSet)
router.register(r"bookings", BookingViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
