export const getCSRFToken = () => {
    const csrf = document.querySelector('[name="csrfmiddlewaretoken"]')
    if (csrf) {
        return csrf.value
    }
}
