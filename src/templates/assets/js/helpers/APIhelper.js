import axios from "./axios";


export const APIHelper = {
    createProduct: (data) => axios.post('/product/create-api/', data),
    gotoListProduct: () => location.assign('/product/list/')
}


export default APIHelper
