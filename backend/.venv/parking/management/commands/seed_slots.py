from django.core.management.base import BaseCommand
from parking.models import Slot

class Command(BaseCommand):
    help = "Seed sample parking slots"

    def handle(self, *args, **options):
        Slot.objects.all().delete()
        sample = [
            {"slot_number":"A1","x":50,"y":50,"w":140,"h":90},
            {"slot_number":"A2","x":220,"y":50,"w":140,"h":90},
            {"slot_number":"A3","x":390,"y":50,"w":140,"h":90},
        ]
        for s in sample:
            Slot.objects.create(**s)
        self.stdout.write(self.style.SUCCESS("Seeded slots"))
