from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Slot, Booking
from .serializers import SlotSerializer, BookingSerializer

class SlotViewSet(viewsets.ModelViewSet):
    queryset = Slot.objects.all().order_by("slot_number")
    serializer_class = SlotSerializer

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        slot = self.get_object()
        status_val = request.data.get("status")
        if status_val not in ("free","occupied","reserved"):
            return Response({"error":"invalid status"}, status=400)
        slot.status = status_val
        slot.save()
        return Response(SlotSerializer(slot).data)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by("-start_time")
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        slot = serializer.validated_data["slot"]
        if slot.status != "free":
            return Response({"error":"Slot not free"}, status=400)
        slot.status = "reserved"
        slot.save()
        booking = serializer.save()
        return Response(BookingSerializer(booking).data, status=201)
