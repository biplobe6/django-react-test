from rest_framework import serializers
from product import models



class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Variant
        fields = [
            'id',
            'title',
        ]





class VariantOptionsSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='variant__id')
    title = serializers.CharField(source='variant_title')
    type = serializers.CharField(source='variant__title')




class ProductVariantSerializer(serializers.Serializer):
    variant_title = serializers.CharField()
    variant = VariantSerializer()



class ProductVariantPriceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    price = serializers.FloatField()
    stock = serializers.FloatField()
    product_variant_one = ProductVariantSerializer()
    product_variant_two = ProductVariantSerializer()
    product_variant_three = ProductVariantSerializer()




class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantPriceSerializer(many=True)

    class Meta:
        model = models.Product
        fields = '__all__'



class ProductListParamsSerializer(serializers.Serializer):
    date = serializers.DateField(
        required=False
    )
    variant = serializers.CharField(
        allow_blank=True,
        required=False
    )
    title = serializers.CharField(
        allow_blank=True,
        required=False
    )
    price_from = serializers.FloatField(
        required=False
    )
    price_to = serializers.FloatField(
        required=False
    )



class ProductCreatePaloadPricesSerializer(serializers.Serializer):
    title = serializers.CharField()
    price = serializers.FloatField()
    stock = serializers.FloatField()

    def validate_title(self, value: str):
        tags = value.split('/')
        # return tags
        result = []
        for tag in tags:
            if tag != '':
                result.append(tag)
        return result



class ProductCreatePaloadTagsSerializer(serializers.Serializer):
    option = serializers.IntegerField()
    tags = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )



class ProductCreatePaloadSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    # sku = serializers.SlugField()
    # description = serializers.CharField(
    #     allow_blank=True
    # )
    tags = ProductCreatePaloadTagsSerializer(many=True)
    prices = ProductCreatePaloadPricesSerializer(many=True)

    class Meta:
        model = models.Product
        fields = [
            'name',
            'sku',
            'description',
            'tags',
            'prices',
        ]


