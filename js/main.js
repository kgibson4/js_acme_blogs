function createElemWithText(element = 'p', textContent = '', className) {
    const createdElement = document.createElement(element);
    createdElement.textContent = textContent;
    if (className) {
        createdElement.className = className;
    }
    return createdElement;
}