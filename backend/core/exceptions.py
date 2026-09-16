"""
Core exception handlers.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for API errors.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code
        }

        if hasattr(exc, 'detail'):
            custom_response_data['details'] = exc.detail

        response.data = custom_response_data

    return response
