from djoser import email

class CustomActivationEmail(email.ActivationEmail):
    template_name = "email/activation.html"