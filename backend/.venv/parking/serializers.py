from rest_framework import serializers
from .models import Slot, Booking

class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = "__all__"

class BookingSerializer(serializers.ModelSerializer):
    slot = SlotSerializer(read_only=True)
    slot_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Slot.objects.all(), source="slot")
    class Meta:
        model = Booking
        fields = ["id", "user", "slot", "slot_id", "start_time", "end_time", "status"]
