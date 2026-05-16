from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from cliniconlineapi import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('doctors', views.DoctorProfileViewSet, basename='doctors')
router.register('appointments', views.AppointmentViewSet, basename='appointment')
router.register('specialtys', views.SpecialtyViewSet, basename='specialty')
router.register('chatbox',views.GeminiChatViewSet, basename='chatbox')

urlpatterns = [
    path('', include(router.urls)),
]
