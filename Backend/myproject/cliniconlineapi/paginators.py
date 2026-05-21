from rest_framework import pagination


class ItemPaginator(pagination.PageNumberPagination):
    page_size = 4


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 2

class SpecialtyPaninator(pagination.PageNumberPagination):
    page_size = 7

