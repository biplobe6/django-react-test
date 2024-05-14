from django.views import generic
from django.db.models import Prefetch
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from rest_framework.response import Response

from product.models import Variant
from product.models import Product
from product.models import ProductVariant
from product.models import ProductVariantPrice
from product.serializers import ProductSerializer
from product.serializers import VariantSerializer
from product.serializers import ProductListParamsSerializer
from product.serializers import ProductCreatePaloadSerializer


def get_next(iterable, default=None):
    try:
        return next(iterable)
    except StopIteration:
        return default


class ProductCreateAPIView(APIView):
    def post(self, request: Request):
        serializer = ProductCreatePaloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data


        product = Product(
            title=payload.get('name'),
            sku=payload.get('sku'),
            description=payload.get('description'),
        )
        product.save()

        variant_matrix = []

        for tags in payload.get('tags'):
            box = {}
            variant_matrix.append(box)

            for tag in tags.get('tags'):
                variant = ProductVariant(
                    variant_title=tag,
                    variant_id=tags.get('option'),
                    product=product,
                )
                box[tag] = variant
                variant.save()

        for prices in payload.get('prices'):
            price = prices.get('price')
            stock = prices.get('stock')
            tags = prices.get('title')

            product_variants = [None, None, None]
            for index, tag in enumerate(tags):
                variant = variant_matrix[index][tag]
                product_variants[index] = variant

            product_variant_one, product_variant_two, product_variant_three = product_variants
            product_variant_price = ProductVariantPrice(
                product=product,
                price=price,
                stock=stock,
                product_variant_one=product_variant_one,
                product_variant_two=product_variant_two,
                product_variant_three=product_variant_three,
            )
            product_variant_price.save()

        return Response({'message': 'Product Created Successfully.'})



class ListProductView(generic.TemplateView):
    template_name = 'products/app.html'

    def get_product_variant_filter_qs(self, filter_params: dict):
        price_from_filter = filter_params.get('price_from')
        price_to_filter = filter_params.get('price_to')
        date_filter = filter_params.get('date')
        variant_filter = filter_params.get('variant')

        product_variant_filter_qs = ProductVariantPrice.objects.all()

        if variant_filter:
            try:
                variant_type, variant_title = variant_filter.split('|')
                product_variant_filter_qs = product_variant_filter_qs.filter(
                    Q(
                        product_variant_one__variant_id=variant_type,
                        product_variant_one__variant_title=variant_title,
                    ) | Q(
                        product_variant_two__variant_id=variant_type,
                        product_variant_two__variant_title=variant_title,
                    ) | Q(
                        product_variant_three__variant_id=variant_type,
                        product_variant_three__variant_title=variant_title,
                    )
                )
            except ValueError:
                pass

        if date_filter:
            product_variant_filter_qs = product_variant_filter_qs.filter(
                product__created_at__date=date_filter
            )

        if price_from_filter or (price_from_filter == 0):
            product_variant_filter_qs = product_variant_filter_qs.filter(
                price__gte=price_from_filter
            )

        if price_to_filter:
            product_variant_filter_qs = product_variant_filter_qs.filter(
                price__lte=price_to_filter
            )

        return product_variant_filter_qs


    def get_context_data(self, **kwargs):
        request = Request(self.request)
        context = super().get_context_data(**kwargs)
        context['product'] = True

        params = ProductListParamsSerializer(
            data=request.query_params
        )
        params.is_valid()

        filter_params = params.validated_data

        title_filter = filter_params.get('title')

        product_variant_filter_qs = self.get_product_variant_filter_qs(filter_params)

        product_variants = product_variant_filter_qs.select_related(
            'product_variant_one__variant',
            'product_variant_two__variant',
            'product_variant_three__variant',
        )

        products = Product.objects.filter(
            id__in=product_variant_filter_qs.values('product')
        ).prefetch_related(
            Prefetch(
                'productvariantprice_set',
                queryset=product_variants,
                to_attr='variants'
            )
        ).order_by('id')

        if title_filter:
            products = products.filter(
                title__icontains=title_filter
            )


        paginator = PageNumberPagination()
        paginator.page_size = 5
        paginated_products = paginator.paginate_queryset(products, request)


        context['app_context'] = {
            'products': {
                'results': ProductSerializer(paginated_products, many=True).data,
                'count': paginator.page.paginator.count,
                'page_size': paginator.page_size,
                'page': {
                    'current': paginator.page.number,
                    'total': paginator.page.paginator.num_pages,
                    'links': paginator.get_html_context()
                },
            },
            'params': filter_params,
            'variants': self.get_variant_options()
        }
        return context

    def get_variant_options(self):
        variant_hash = {}
        result = []

        variants = Variant.objects.filter(
            active=True
        )

        for variant in variants:
            option = {
                'id': variant.pk,
                'title': variant.title,
                'options': []
            }
            result.append(option)
            variant_hash[variant.pk] = option


        product_variants = ProductVariant.objects.filter(
            variant__in=variants.values('id'),
            variant__active=True
        ).values(
            'variant_title',
            'variant_id',
        ).distinct()

        for product_variant in product_variants:
            option = variant_hash[product_variant['variant_id']]
            options = option['options']
            options.append({
                'title': product_variant['variant_title'],
            })

        return result







class CreateProductView(generic.TemplateView):
    template_name = 'products/create.html'

    def get_context_data(self, **kwargs):
        context = super(CreateProductView, self).get_context_data(**kwargs)
        variants = Variant.objects.filter(active=True)
        context['product'] = True
        context['app_context'] = {
            'all_variants': VariantSerializer(variants, many=True).data
        }
        return context
