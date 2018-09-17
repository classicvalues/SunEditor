'use strict';

/**
 * @description utility function
 */
const util = {
    /**
     * @description Gets XMLHttpRequest object
     * @returns {Object}
     */
    getXMLHttpRequest: function () {
        /** IE */
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e1) {
                    return null;
                }
            }
        }
        /** netscape */
        else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        /** fail */
        else {
            return null;
        }
    },

    /**
     * @description Copies object
     * @param {Object} obj - Object to be copy
     * @returns {Object}
     */
    copyObj: function (obj) {
        const copy = {};

        for (let attr in obj) {
            copy[attr] = obj[attr];
        }

        return copy;
    },

    /**
     * @description Get the the tag path of the arguments value
     * @param {String} name - File name
     * @param {String} extension - js, css
     * @returns {String}
     */
    getIncludePath: function (name, extension) {
        let path = '';
        const tagName = extension === 'js' ? 'script' : 'link';
        const src = extension === 'js' ? 'src' : 'href';

        const regExp = new RegExp('(^|.*[\\\\\/])' + name + '(\\..+)?\.' + extension + '(?:\\?.*|;.*)?$', 'i');
            
        for (let c = document.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
            let editorTag = c[i][src].match(regExp);
            if (editorTag) {
                path = editorTag[0];
                break;
            }
        }

        -1 === path.indexOf(':/') && '//' !== path.slice(0, 2) && (path = 0 === path.indexOf('/') ? location.href.match(/^.*?:\/\/[^\/]*/)[0] + path : location.href.match(/^[^\?]*\/(?:)/)[0] + path);

        if (!path) throw '[SUNEDITOR.util.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (name: +' + name + ', extension: ' + extension + ')';

        return path;
    },

    /**
     * @description Converts content into a format that can be placed in an editor
     * @param content - content
     * @returns {string}
     */
    convertContentForEditor: function (content) {
        let tag, baseHtml, innerHTML = '';
        tag = document.createRange().createContextualFragment(content.trim()).childNodes;

        for (let i = 0, len = tag.length; i < len; i++) {
            baseHtml = tag[i].outerHTML || tag[i].textContent;
            if (!/^(?:P|TABLE|H[1-6]|DIV)$/i.test(tag[i].tagName)) {
                innerHTML += '<P>' + baseHtml + '</p>';
            } else {
                innerHTML += baseHtml;
            }
        }

        if (innerHTML.length === 0) innerHTML = '<p>&#65279</p>';

        return innerHTML;
    },

    /**
     * @description It is judged whether it is the edit region top div element.
     * @returns {boolean}
     */
    isWysiwygDiv: function (element) {
        if (element && element.nodeType === 1 && this.hasClass(element, 'sun-editor-id-wysiwyg')) return true;
        return false;
    },

    /**
     * @description It is judged whether it is the format element.
     * @returns {boolean}
     */
    isFormatElement: function (element) {
        if (element && element.nodeType === 1 && /^(?:P|DIV|H\\d)$/i.test(element.tagName)) return true;
        return false;
    },

    /**
     * @description Get format element of the argument value (P, DIV, Table, H1, H2, H3, H4, H5, H6...Tag whose parent is the "BODY")
     * @param {element|null} element - Reference element if null or no value, it is relative to the current focus node.
     * @returns {Element}
     */
    getFormatElement: function (element) {
        if (!element) return null;

        if (!element || this.isWysiwygDiv(element)) {
            element = context.element.wysiwyg.firstChild;
        } else {
            while (!this.isWysiwygDiv(element.parentNode)) {
                element = element.parentNode;
            }
        }

        return element;
    },

    /**
     * @description Get the index of the argument value in the element array
     * @param {array} array - element array
     * @param {element} element - Element to find index
     * @returns {Number}
     */
    getArrayIndex: function (array, element) {
        let idx = -1;
        for (let i = 0, len = array.length; i < len; i++) {
            if (array[i] === element) {
                idx = i;
                break;
            }
        }

        return idx;
    },

    /**
     * @description Get the next index of the argument value in the element array
     * @param {array} array - element array
     * @param {element} item - Element to find index
     * @returns {Number}
     */
    nextIdx: function (array, item) {
        let idx = this.getArrayIndex(array, item);
        if (idx === -1) return -1;
        return idx + 1;
    },

    /**
     * @description Get the previous index of the argument value in the element array
     * @param {array} array - element array
     * @param {element} item - Element to find index
     * @returns {Number}
     */
    prevIdx: function (array, item) {
        let idx = this.getArrayIndex(array, item);
        if (idx === -1) return -1;
        return idx - 1;
    },

    /**
     * @description Gets whether the cell is a table
     * @param {element} node - Nodes to scan
     * @returns {Boolean}
     */
    isCell: function (node) {
        return node && /^(?:TD|TH)$/i.test(node.nodeName);
    },

    /**
     * @description Get all child nodes of the argument value element (Without text node)
     * @param {element} element - element to get child node
     * @param {(function|null)} validation - Conditional function
     * @returns {Array}
     */
    getListChildren: function (element, validation) {
        const children = [];
        validation = validation || function () { return true; };

        (function recursionFunc(current) {
            if (element !== current && validation(current)) {
                children.push(current);
            }

            for (let i = 0, len = current.children.length; i < len; i++) {
                recursionFunc(current.children[i]);
            }
        })(element);

        return children;
    },

    /**
     * @description Get all child nodes of the argument value element (Include text nodes)
     * @param {element} element - element to get child node
     * @param {(function|null)} validation - Conditional function
     * @returns {Array}
     */
    getListChildNodes: function (element, validation) {
        const children = [];
        validation = validation || function () { return true; };

        (function recursionFunc(current) {
            if (validation(current)) {
                children.push(current);
            }

            for (let i = 0, len = current.childNodes.length; i < len; i++) {
                recursionFunc(current.childNodes[i]);
            }
        })(element);

        return children;
    },

    /**
     * @description Get the parent element of the argument value.
     * A tag that satisfies the query condition is imported.
     * Returns null if not found.
     * @param {Node} element - Reference element
     * @param {string} query - Query String (tagName, .className, #ID, :name)
     * Not use it like jquery.
     * Only one condition can be entered at a time.
     * @returns {Element|null}
     */
    getParentElement: function (element, query) {
        let attr;

        if (/\./.test(query)) {
            attr = 'className';
            query = query.split('.')[1];
        } else if (/#/.test(query)) {
            attr = 'id';
            query = '^' + query.split('#')[1] + '$';
        } else if (/:/.test(query)) {
            attr = 'name';
            query = '^' + query.split(':')[1] + '$';
        } else {
            attr = 'tagName';
            query = '^' + query + '$';
        }

        const check = new RegExp(query, 'i');
        while (element && (element.nodeType === 3 || !check.test(element[attr]))) {
            if (this.isWysiwygDiv(element)) {
                return null;
            }
            element = element.parentNode;
        }

        return element;
    },

    /**
     * @description Set the text content value of the argument value element
     * @param {element} element - Element to replace text content
     * @param {String} txt - Text to be applied
     */
    changeTxt: function (element, txt) {
        if (!element || !txt) return;
        element.textContent = txt;
    },

    /**
     * @description Determine whether any of the matched elements are assigned the given class
     * @param {element} element - Elements to search class name
     * @param {string} className - Class name to search for
     */
    hasClass: function (element, className) {
        if (!element) return;

        return element.classList.contains(className.trim());
    },

    /**
     * @description Append the className value of the argument value element
     * @param {element} element - Elements to add class name
     * @param {string} className - Class name to be add
     */
    addClass: function (element, className) {
        if (!element) return;

        const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
        if (check.test(element.className)) return;

        element.className += ' ' + className;
    },

    /**
     * @description Delete the className value of the argument value element
     * @param {element} element - Elements to remove class name
     * @param {string} className - Class name to be remove
     */
    removeClass: function (element, className) {
        if (!element) return;

        const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(check, ' ').trim();
    },

    /**
     * @description Argument value If there is no class name, insert it and delete the class name if it exists
     * @param {element} element - Elements to replace class name
     * @param {string} className - Class name to be change
     */
    toggleClass: function (element, className) {
        if (!element) return;

        const check = new RegExp('(\\s|^)' + className + '(\\s|$)');
        if (check.test(element.className)) {
            element.className = element.className.replace(check, ' ').trim();
        }
        else {
            element.className += ' ' + className;
        }
    },

    /**
     * @description Delete argumenu value element
     * @param {element} item - Element to be remove
     */
    removeItem: function (item) {
        try {
            item.remove();
        } catch (e) {
            item.parentNode.removeChild(item);
        }
    }
};

export default util;