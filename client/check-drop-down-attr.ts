/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const setTabIndex = (items, value): void => {
  for (let i = 0; i < items.length; i++) {
    const a = items.item(i);
    a.setAttribute("tabindex", value);
  }
};

export default class DropDownCheck {
  callback(mutationsList: any): void {
    for (let index = 0; index < mutationsList.length; index++) {
      const mutation = mutationsList[index];
      if (mutation.type === "attributes" && mutation.attributeName == "open") {
        const openVal = mutation.target.open ? "0" : "-1";
        setTabIndex(mutation.target.getElementsByTagName("a"), openVal);
      }
    }
  }

  init(): void {
    if (typeof MutationObserver == "function") {
      const observers = [];
      const config = { attributes: true };
      const elementsToCheck = document.getElementsByTagName("details");
      for (let index = 0; index < elementsToCheck.length; index++) {
        const element = elementsToCheck.item(index);
        setTabIndex(element.getElementsByTagName("a"), "-1");
        const observer = new MutationObserver(this.callback);
        observer.observe(element, config);
        observers.push(observer);
      }
      window.addEventListener(
        "beforeunload",
        function () {
          for (let index = 0; index < observers.length; index++) {
            const observer = observers[index];
            observer.disconnect();
          }
        },
        false
      );
    }
  }
}
