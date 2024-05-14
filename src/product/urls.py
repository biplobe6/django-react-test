from django.urls import path
from django.views.generic import TemplateView

from product.views import product
from product.views import variant

app_name = "product"

urlpatterns = [
    # Variants URLs
    path('variants/', variant.VariantView.as_view(), name='variants'),
    path('variant/create', variant.VariantCreateView.as_view(), name='create.variant'),
    path('variant/<int:id>/edit', variant.VariantEditView.as_view(), name='update.variant'),

    # Products URLs
    path('create-api/', product.ProductCreateAPIView.as_view(), name='create.product-api'),
    path('create/', product.CreateProductView.as_view(), name='create.product'),
    path('list/', product.ListProductView.as_view(), name='list.product'),
]
