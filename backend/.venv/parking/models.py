from django.db import models

# Create your models here.

class Slot(models.Model):
    slot_number = models.CharField(max_length=50, unique=True)
    x = models.IntegerField(default=0)
    y = models.IntegerField(default=0)
    w = models.IntegerField(default=120)
    h = models.IntegerField(default=80)
    status = models.CharField(max_length=20, choices=[("free","free"),("occupied","occupied"),("reserved","reserved")], default="free")
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.slot_number} ({self.status})"

class Booking(models.Model):
    user = models.CharField(max_length=100)
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE, related_name="bookings")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[("confirmed","confirmed"),("cancelled","cancelled")], default="confirmed")

    def __str__(self):
        return f"Booking {self.id} - {self.user} - {self.slot.slot_number}"
