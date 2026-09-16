"""
Core permissions for API views.
"""
from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view/edit it.
    """

    def has_object_permission(self, request, view, obj):
        """
        Check if user is the owner of the object.
        """
        return obj.user == request.user
