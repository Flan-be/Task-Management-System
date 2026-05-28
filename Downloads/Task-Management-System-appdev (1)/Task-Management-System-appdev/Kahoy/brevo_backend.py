import requests
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class BrevoEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        sent = 0
        for message in email_messages:
            try:
                response = requests.post(
                    'https://api.brevo.com/v3/smtp/email',
                    headers={
                        'api-key': settings.BREVO_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    json={
                        'sender': {'email': settings.DEFAULT_FROM_EMAIL},
                        'to': [{'email': to} for to in message.to],
                        'subject': message.subject,
                        'htmlContent': message.body,
                    }
                )
                logger.warning(f"Brevo response: {response.status_code} {response.text}")
                if response.status_code == 201:
                    sent += 1
            except Exception as e:
                logger.error(f"Brevo error: {e}")
                if not self.fail_silently:
                    raise
        return sent