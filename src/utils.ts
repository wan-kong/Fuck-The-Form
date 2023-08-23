export const output = (...args: any[]) => console.log(new Date().toLocaleString() + '[FUCK_THE_FORM]：', ...args)

export const getCssSelector = (element: any) => {
    if (!(element instanceof Element)) return;
    const path = [];
    while (element && element !== document) {
        let selector = element.tagName.toLowerCase();
        // element-plus每次都会自动生成id，不可取。。
        if (element.className) {
            const classes = element.className.trim().split(/\s+/);
            if (classes.lenth > 0)
                selector += `.${classes[0]}`
        }
        let index = 1;
        let sibling = element;
        while (sibling = sibling.previousElementSibling) {
            if (sibling.tagName === element.tagName) {
                index++;
            }
        }
        if (index !== 1) {
            selector += `:nth-child(${index})`;
        }
        path.unshift(selector);
        element = element.parentElement;
    }

    return path.join(' > ');
}
