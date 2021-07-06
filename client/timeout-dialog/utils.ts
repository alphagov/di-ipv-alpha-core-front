/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */
/* global ActiveXObject */

const { warn } = console;

const utils = {

  nodeListForEach(nodes, callback) {
    if (window.NodeList.prototype.forEach) {
      return nodes.forEach(callback);
    }
    for (let i = 0; i < nodes.length; i += 1) {
      callback.call(window, nodes[i], i, nodes);
    }
  },

  generateDomElementFromString(str) {
    const abc: HTMLElement = document.createElement('div');
    abc.innerHTML = str;
    return abc.firstChild;
  },

  generateDomElementFromStringAndAppendText(str, text) {
    const $tmp: any = utils.generateDomElementFromString(str);
    $tmp.innerText = text;
    return $tmp;
  },

  hasClass(selector, className) {
    return document.querySelector(selector).classList.contains(className);
  },

  addClass(selector, className) {
    const elements = document.querySelectorAll(selector);
    this.nodeListForEach(elements, (i) => { i.classList.add(className); });
  },

  removeClass(selector, className) {
    const elements = document.querySelectorAll(selector);
    this.nodeListForEach(elements, (i) => { i.classList.remove(className); });
  },

  removeElement($elem) {
    const parent = $elem.parentNode;
    if (parent) {
      parent.removeChild($elem);
    } else {
      warn("couldn't find parent for elem", $elem);
    }
  },

  ajaxGet(url, success) {
    const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = () => {
      if (xhr.readyState > 3 && xhr.status === 200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
  },
};

export default utils;
