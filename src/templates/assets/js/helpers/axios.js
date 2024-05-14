import Axios from 'axios';



export const axios = Axios.create({
    baseURL: '/',
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFTOKEN",
})


export default axios
