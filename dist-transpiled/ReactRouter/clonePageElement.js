export function clonePageElement(leavingViewHtml) {
    let html;
    if (typeof leavingViewHtml === 'string') {
        html = leavingViewHtml;
    }
    else {
        html = leavingViewHtml.outerHTML;
    }
    if (document) {
        const newEl = document.createElement('div');
        newEl.innerHTML = html;
        newEl.style.zIndex = '';
        // Remove an existing back button so the new element doesn't get two of them
        const ionBackButton = newEl.getElementsByTagName('ion-back-button');
        if (ionBackButton[0]) {
            ionBackButton[0].remove();
        }
        return newEl.firstChild;
    }
    return undefined;
}
//# sourceMappingURL=clonePageElement.js.map