//TODO: Make possible to ask. Is it needed to create a zip file
export const crutch = (href) => {
    const a = document.createElement('a')
    a.href = href
    a.download = 'test.zip'
    a.click()
    a.remove()
}
