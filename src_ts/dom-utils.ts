function appendElement (el : HTMLElement, tagName : string, properties? : any) : HTMLElement {
    var newElement = createElement(tagName, properties);
    el.appendChild(newElement);
    return newElement;
}

function prependElement (el : HTMLElement, tagName : string, properties? : any) : HTMLElement {
    if (!el.childNodes.length)
        return appendElement(el, tagName, properties);

    var newElement = createElement(tagName, properties);
    el.insertBefore(newElement, el.childNodes[0]);
    return newElement;
}

function createElement (tagName : string, properties? : any) {
    var newElement = document.createElement(tagName);
    if (properties)
        Object.keys(properties).forEach(key => newElement[key] = properties[key]);

    return newElement;
}

function appendText (el : HTMLElement, text : string) {
    el.appendChild(document.createTextNode(text));
}

function addClass (el : HTMLElement, className : string) {
    if ('classList' in el) {
        el.classList.add(className);
    } else {
        // Old browsers
        var classList = el.className.split(' ');
        if (!classList.some(function(c) { return c == className; }))
            el.className += ' ' + className;
    }
}

function removeClass (el : HTMLElement, className : string) {
    if ('classList' in el)
        el.classList.remove(className);
    else
        el.className = el.className
            .split(' ')
            .filter(c => c != className)
            .join(' ');
}