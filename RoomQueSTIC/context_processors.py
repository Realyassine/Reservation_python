from django.conf import settings

def site_prefix(request):
    """Add the production prefix to the template context"""
    prefix = getattr(settings, 'PRODUCTION_PREFIX', '')
    return {
        'request_prefix': prefix
    }
