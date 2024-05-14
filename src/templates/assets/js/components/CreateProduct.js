import React, {useState} from 'react';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import Dropzone from 'react-dropzone'
import APIHelper from '../helpers/APIhelper';


// combination algorithm
function getCombn(arr, pre) {
    pre = pre || '';
    if (!arr.length) {
        return pre;
    }
    let ans = arr[0].reduce(function (ans, value) {
        return ans.concat(getCombn(arr.slice(1), pre + value + '/'));
    }, []);
    return ans;
}




const CreateProduct = (props) => {
    const allVariants = props.all_variants

    const [errors, setErrors] = useState({})
    const [productName, setProductName] = useState('')
    const [productSKU, setProductSKU] = useState('')
    const [productDescription, setProductDescription] = useState('')

    const [productVariantPrices, setProductVariantPrices] = useState([])
    const updateProductVariantPrice = (value, index) => {
        const variant = {
            ...(productVariantPrices[index]),
            price: parseFloat(value)
        }
        const variants = [...productVariantPrices]
        variants[index] = variant
        setProductVariantPrices(variants)
    }
    const updateProductVariantStock = (value, index) => {
        const variant = {
            ...(productVariantPrices[index]),
            stock: parseFloat(value)
        }
        const variants = [...productVariantPrices]
        variants[index] = variant
        setProductVariantPrices(variants)
    }

    const [productVariants, setProductVariant] = useState([
        {
            option: allVariants[0].id,
            tags: []
        }
    ])

    // handle click event of the Add button
    const handleAddClick = () => {
        let all_variants = allVariants.map(el => el.id)
        let selected_variants = productVariants.map(el => el.option);
        let available_variants = all_variants.filter(entry1 => !selected_variants.some(entry2 => entry1 == entry2))
        setProductVariant([...productVariants, {
            option: available_variants[0],
            tags: []
        }])
    };

    // handle input change on tag input
    const handleInputTagOnChange = (value, index) => {
        let product_variants = [...productVariants]
        product_variants[index].tags = value
        setProductVariant(product_variants)

        checkVariant()
    }

    // remove product variant
    const removeProductVariant = (index) => {
        let product_variants = [...productVariants]
        product_variants.splice(index, 1)
        setProductVariant(product_variants)
        updateProductVariantPrices(product_variants)
    }

    const updateProductVariantPrices = (productVariants) => {
        let tags = []
        productVariants.forEach(item => {
            tags.push(item.tags)
        })

        setProductVariantPrices([])

        getCombn(tags).forEach(item => {
            setProductVariantPrices(productVariantPrice => [...productVariantPrice, {
                title: item,
                price: 0,
                stock: 0
            }])
        })

    }

    // check the variant and render all the combination
    const checkVariant = () => {
        updateProductVariantPrices(productVariants)
    }


    // Save product
    let saveProduct = (event) => {
        event.preventDefault();
        const payload = {
            name: productName,
            sku: productSKU,
            description: productDescription,
            tags: productVariants,
            prices: productVariantPrices,
        }
        APIHelper
            .createProduct(payload)
            .then(e => {
                setErrors({})
                APIHelper.gotoListProduct()
            })
            .catch(e => {
                setErrors(e.response.data)
            })
    }


    return (
        <div>
            <section>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card shadow mb-4">
                            <div className="card-body">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        value={productName}
                                        onChange={e => setProductName(e.target.value)}
                                        type="text" placeholder="Product Name" className="form-control"/>
                                    {errors.name && errors.name.map(error => (
                                        <div key={error} className="invalid-feedback d-block">
                                            {error}
                                        </div>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label>Product SKU</label>
                                    <input
                                        value={productSKU}
                                        onChange={e => setProductSKU(e.target.value)}
                                        type="text" placeholder="Product SKU" className="form-control"/>
                                    {errors.sku && errors.sku.map(error => (
                                        <div key={error} className="invalid-feedback d-block">
                                            {error}
                                        </div>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={productDescription}
                                        onChange={e => setProductDescription(e.target.value)}
                                        id="" cols="30" rows="4" className="form-control"></textarea>
                                    {errors.description && errors.description.map(error => (
                                        <div key={error} className="invalid-feedback d-block">
                                            {error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Media</h6>
                            </div>
                            <div className="card-body border">
                                <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                                    {({getRootProps, getInputProps}) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p>Drag 'n' drop some files here, or click to select files</p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow mb-4">
                            <div
                                className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 font-weight-bold text-primary">Variants</h6>
                            </div>
                            <div className="card-body">

                                {
                                    productVariants.map((element, index) => {
                                        return (
                                            <div className="row" key={index}>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Option</label>
                                                        <select className="form-control" defaultValue={element.option}>
                                                            {
                                                                allVariants.map((variant, index) => {
                                                                    return (
                                                                        <option key={index} value={variant.id}>
                                                                            {variant.title}
                                                                        </option>
                                                                    )
                                                                })
                                                            }

                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-md-8">
                                                    <div className="form-group">
                                                        {
                                                            productVariants.length > 1
                                                                ? <label className="float-right text-primary"
                                                                         style={{marginTop: "-30px"}}
                                                                         onClick={() => removeProductVariant(index)}>remove</label>
                                                                : ''
                                                        }

                                                        <section style={{marginTop: "30px"}}>
                                                            <TagsInput value={element.tags}
                                                                       style="margin-top:30px"
                                                                       onChange={(value) => handleInputTagOnChange(value, index)}/>
                                                        </section>

                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }


                            </div>
                            <div className="card-footer">
                                {productVariants.length !== 3
                                    ? <button className="btn btn-primary" onClick={handleAddClick}>Add another
                                        option</button>
                                    : ''
                                }

                            </div>

                            <div className="card-header text-uppercase">Preview</div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <td>Variant</td>
                                            <td>Price</td>
                                            <td>Stock</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            productVariantPrices.map((productVariantPrice, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{productVariantPrice.title}</td>
                                                        <td>
                                                            <input
                                                                value={productVariantPrice.price}
                                                                onChange={e => updateProductVariantPrice(e.target.value, index)}
                                                                className="form-control" type="number"/>
                                                        </td>
                                                        <td>
                                                        <input
                                                            value={productVariantPrice.stock}
                                                            onChange={e => updateProductVariantStock(e.target.value, index)}
                                                            className="form-control" type="number"/>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" onClick={saveProduct} className="btn btn-lg btn-primary">Save</button>
                <button type="button" className="btn btn-secondary btn-lg">Cancel</button>
            </section>
        </div>
    );
};

export default CreateProduct;
