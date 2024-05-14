import React, { useState } from 'react';
import moment from 'moment';


const titleStyle = {textTransform: 'capitalize'}

const Title = ({children}) => (
    <span style={titleStyle}>
        {children}
    </span>
)


const RelativeTime = ({from, format}) => {
    let time = null
    if(from){
        time = moment(from).startOf(format).fromNow()
    }
    return time
}

const pagination = ({pageSize, currentPage, totalObjects}) => {
    let endingAt = pageSize * currentPage
    if (endingAt > totalObjects){
        endingAt = totalObjects
    }
    return ({
        endingAt,
        total: totalObjects,
        startingAt: (pageSize * (currentPage - 1)) + 1,
    })
}


const Toggler = ({children}) => {
    const [isActive, toggleStatus] = useState(false)
    return children({
        isActive,
        clickHandler: () => toggleStatus((state) => !state),
    })
}


const PaginationLink = ({link, isActive, children}) => {
    return (
        <li
            className={
                "page-item"
                + (link ? "" : ' disabled')
                + (isActive ? ' active' : '')
            }
        >
            <a className="page-link" href={link}>
                {children}
            </a>
        </li>
    )
}

const ListProduct = (props) => {
    console.log("🚀 ~ props:", props)
    const [titleFilter, setTitleFilter] = useState(
        props.params.title || ''
    )
    const [priceToFilter, setPriceToFilter] = useState(
        props.params.price_to || ''
    )
    const [priceFromFilter, setPriceFromFilter] = useState(
        props.params.price_from || ''
    )
    const [variantFilter, setVariantFilter] = useState(
        props.params.variant || ''
    )
    const [dateFilter, setDateFilter] = useState(
        props.params.date || ''
    )
    const products = props.products.results || []
    const variants = props.variants || []
    const paginator = pagination({
        currentPage: props.products.page.current,
        pageSize: props.products.page_size,
        totalObjects: props.products.count,
    })
    const productCount = paginator.total
    const {startingAt, endingAt} = paginator;
    const previousUrl = props.products.page.links.previous_url
    const nextUrl = props.products.page.links.next_url
    const pageLinks = props.products.page.links.page_links
    return (
        <>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Products</h1>
            </div>
            <div className="card">
                <form action="" method="get" className="card-header">
                    <div className="form-row justify-content-between">
                        <div className="col-md-2">
                            <input
                                value={titleFilter}
                                onChange={e => setTitleFilter(e.target.value)}
                                type="text" name="title" placeholder="Product Title" className="form-control" />
                        </div>
                        <div className="col-md-2">
                            <select
                                style={titleStyle}
                                value={variantFilter}
                                onChange={e => setVariantFilter(e.target.value)}
                                name="variant"
                                className="form-control"
                            >
                                <option value={''}>--Select A Variant--</option>
                                {variants.map(variant => (
                                    <optgroup key={variant.id} label={variant.title}>
                                        {variant.options.map((option, index) => (
                                            <option
                                                key={index}
                                                value={`${variant.id}|${option.title}`}
                                            >
                                                {option.title}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Price Range</span>
                                </div>
                                <input
                                    value={priceFromFilter}
                                    onChange={e => setPriceFromFilter(e.target.value)}
                                    type="text" name="price_from" aria-label="First name" placeholder="From"
                                    className="form-control" />
                                <input
                                    value={priceToFilter}
                                    onChange={e => setPriceToFilter(e.target.value)}
                                    type="text" name="price_to" aria-label="Last name" placeholder="To" className="form-control" />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <input
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                type="date" name="date" placeholder="Date" className="form-control" />
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-primary float-right"><i className="fa fa-search"></i></button>
                        </div>
                    </div>
                </form>

                <div className="card-body">
                    <div className="table-response">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Variant</th>
                                <th width="150px">Action</th>
                            </tr>
                            </thead>

                            <tbody>
                                {products.map((product, index) => {
                                    return (
                                        <tr key={product.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {product.title}&nbsp;
                                                <br/> Created at : <RelativeTime format={'hour'} from={product.created_at}/>
                                            </td>
                                            <td>{product.description}</td>
                                            <td>
                                                <Toggler>
                                                    {(expendProps) => (
                                                        <>
                                                            <dl
                                                                style={{height: "80px", overflow: "hidden"}}
                                                                className={"row mb-0" + (expendProps.isActive ? ' h-auto': '')}
                                                            >
                                                                {product.variants.map(variant => {
                                                                    return (
                                                                        <React.Fragment key={variant.id}>
                                                                            <dt className="col-sm-3 pb-0">
                                                                                <Title>{variant?.product_variant_one?.variant_title}</Title>
                                                                                / <Title>{variant?.product_variant_two?.variant_title}</Title>
                                                                                / <Title>{variant?.product_variant_three?.variant_title}</Title>
                                                                            </dt>
                                                                            <dd className="col-sm-9">
                                                                                <dl className="row mb-0">
                                                                                    <dd className="col-sm-4 pb-0">Price : {variant.price}</dd>
                                                                                    <dd className="col-sm-8 pb-0">InStock : {variant.stock}</dd>
                                                                                </dl>
                                                                            </dd>
                                                                        </ React.Fragment>
                                                                    )
                                                                })}
                                                            </dl>
                                                            <button onClick={expendProps.clickHandler} className="btn btn-sm btn-link">
                                                                Show more
                                                            </button>
                                                        </>
                                                    )}
                                                </Toggler>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <a href="" className="btn btn-success">Edit</a>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>

                        </table>
                    </div>

                </div>

                <div className="card-footer">
                    <div className="row justify-content-between">
                        <div className="col-md-6">
                            <p>Showing {startingAt} to {endingAt} out of {productCount}</p>
                        </div>
                        <div className="col-md-2">
                            <nav aria-label="Page navigation">
                                <ul className="pagination float-right">
                                    <PaginationLink children="<" link={previousUrl} />
                                    {pageLinks.map((link, index) => (
                                        <PaginationLink
                                            key={index}
                                            link={link[0]}
                                            children={link[1]}
                                            isActive={link[2]}
                                        />
                                    ))}
                                    <PaginationLink children=">" link={nextUrl} />
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ListProduct;
