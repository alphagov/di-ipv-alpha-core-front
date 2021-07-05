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

function initMutuallyExclusiveCheckboxes(): void {
  const options: NodeListOf<HTMLInputElement> = document.querySelectorAll(
    'input[data-group="options"][type="checkbox"]'
  );
  const otherCheckBox: HTMLInputElement = document.querySelector(
    'input[data-group="other"][type="checkbox"]'
  );
  if (otherCheckBox && options) {
    otherCheckBox.addEventListener("change", () => {
      if (otherCheckBox.checked) {
        for (let index = 0; index < options.length; index++) {
          const option = options[index];
          option.checked = false;
        }
      }
    });
    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      option.addEventListener("change", () => {
        if (option.checked) {
          otherCheckBox.checked = false;
        }
      });
    }
  }
}

export { initMutuallyExclusiveCheckboxes };
