/* eslint-disable prettier/prettier */
import utils from "./utils";

function displayDialog($elementToDisplay: any): any {
  const $dialog = utils.generateDomElementFromString("<div id='hmrc-timeout-dialog' tabindex='-1' role='dialog' class='hmrc-timeout-dialog'>");
  const $overlay = utils.generateDomElementFromString('<div id="hmrc-timeout-overlay" class="hmrc-timeout-overlay">');
  const $preparedElementToDisplay = typeof $elementToDisplay === 'string' ? utils.generateDomElementFromString($elementToDisplay) : $elementToDisplay;
  const resetElementsFunctionList = [];
  const closeCallbacks = [];

  $dialog.appendChild($preparedElementToDisplay);

  if (!utils.hasClass('html', 'noScroll')) {
    utils.addClass('html', 'noScroll');
    resetElementsFunctionList.push(() => {
      utils.removeClass('html', 'noScroll');
    });
  }
  document.body.appendChild($dialog);
  document.body.appendChild($overlay);

  resetElementsFunctionList.push(() => {
    utils.removeElement($dialog);
    utils.removeElement($overlay);
  });

  const setupFocusHandlerAndFocusDialog = () => {
    function keepFocus(event) {
      const modalFocus = document.getElementById('hmrc-timeout-dialog');
      if (modalFocus) {
        if (event.target !== modalFocus && !modalFocus.contains(event.target)) {
          event.stopPropagation();
          modalFocus.focus();
        }
      }
    }

    const elemToFocusOnReset = document.activeElement;
    if ($dialog instanceof HTMLElement) {
      $dialog.focus();
    }

    document.addEventListener('focus', keepFocus, true);

    resetElementsFunctionList.push(() => {
      document.removeEventListener('focus', keepFocus);
      if (elemToFocusOnReset instanceof HTMLElement) {
        elemToFocusOnReset.focus();
      }
    });
  };

  // disable the non-dialog page to prevent confusion for VoiceOver users
  const selectors = [
    '#skiplink-container',
    'body > header',
    '#global-cookie-message',
    'main[role=main]',
    'body > footer',
  ];
  const elements = document.querySelectorAll(selectors.join(', '));
  const close = () => {
    while (resetElementsFunctionList.length > 0) {
      const fn = resetElementsFunctionList.shift();
      fn();
    }
  };
  const closeAndInform = () => {
    closeCallbacks.forEach((fn) => { fn(); });
    close();
  };
  const setupKeydownHandler = () => {
    function keydownListener(e) {
      if (e.keyCode === 27) {
        closeAndInform();
      }
    }

    document.addEventListener('keydown', keydownListener);

    resetElementsFunctionList.push(() => {
      document.removeEventListener('keydown', keydownListener);
    });
  };
  const preventMobileScrollWhileAllowingPinchZoom = () => {
    const handleTouch = (e) => {
      const touches = e.touches || e.changedTouches || [];

      if (touches.length === 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouch, true);

    resetElementsFunctionList.push(() => {
      document.removeEventListener('touchmove', handleTouch, true);
    });
  };

  utils.nodeListForEach(elements, ($elem) => {
    const value = $elem.getAttribute('aria-hidden');
    $elem.setAttribute('aria-hidden', 'true');
    resetElementsFunctionList.push(() => {
      if (value) {
        $elem.setAttribute('aria-hidden', value);
      } else {
        $elem.removeAttribute('aria-hidden');
      }
    });
  });

  setupFocusHandlerAndFocusDialog();
  setupKeydownHandler();
  preventMobileScrollWhileAllowingPinchZoom();

  return {
    closeDialog() {
      close();
    },
    setAriaLabelledBy(value) {
      if (value) {
        if ($dialog instanceof HTMLElement) {
          $dialog.setAttribute('aria-labelledby', value);
        }
      } else {
        if ($dialog instanceof HTMLElement) {
          $dialog.removeAttribute('aria-labelledby');
        }
      }
    },
    addCloseHandler(closeHandler) {
      closeCallbacks.push(closeHandler);
    },
  };
}

export default { displayDialog };
