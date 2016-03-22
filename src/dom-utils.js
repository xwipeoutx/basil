function appendElement(el, tagName, properties) {
    var newElement = createElement(tagName, properties);
    el.appendChild(newElement);
    return newElement;
}
function prependElement(el, tagName, properties) {
    if (!el.childNodes.length)
        return appendElement(el, tagName, properties);
    var newElement = createElement(tagName, properties);
    el.insertBefore(newElement, el.childNodes[0]);
    return newElement;
}
function createElement(tagName, properties) {
    var newElement = document.createElement(tagName);
    if (properties)
        Object.keys(properties).forEach(function (key) { return newElement[key] = properties[key]; });
    return newElement;
}
function appendText(el, text) {
    el.appendChild(document.createTextNode(text));
}
function addClass(el, className) {
    if ('classList' in el) {
        el.classList.add(className);
    }
    else {
        // Old browsers
        var classList = el.className.split(' ');
        if (!classList.some(function (c) { return c == className; }))
            el.className += ' ' + className;
    }
}
function removeClass(el, className) {
    if ('classList' in el)
        el.classList.remove(className);
    else
        el.className = el.className
            .split(' ')
            .filter(function (c) { return c != className; })
            .join(' ');
}
