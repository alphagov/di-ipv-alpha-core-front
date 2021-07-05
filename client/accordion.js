/*
  TranslatableAccordion

  This allows a collection of sections to be collapsed by default,
  showing only their headers. Sections can be exanded or collapsed
  individually by clicking their headers. An "Open all" button is
  also added to the top of the accordion, which switches to "Close all"
  when all the sections are expanded.

  The state of each section is saved to the DOM via the `aria-expanded`
  attribute, which also provides accessibility.

  Added ability to use translated text

*/

/* eslint-disable */

function nodeListForEach(nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback);
  }
  for (var i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes);
  }
}

function TranslatableAccordion($module) {
  this.$module = $module;
  this.moduleId = $module.getAttribute("id");
  this.$sections = $module.querySelectorAll(".govuk-accordion__section");
  this.$openAllButton = $module.querySelector(".govuk-accordion__open-all");
  this.browserSupportsSessionStorage = helper.checkForSessionStorage();

  this.controlsClass = "govuk-accordion__controls";
  this.openAllClass = "govuk-accordion__open-all";
  this.iconClass = "govuk-accordion__icon";

  this.sectionHeaderClass = "govuk-accordion__section-header";
  this.sectionHeaderFocusedClass = "govuk-accordion__section-header--focused";
  this.sectionHeadingClass = "govuk-accordion__section-heading";
  this.sectionSummaryClass = "govuk-accordion__section-summary";
  this.sectionButtonClass = "govuk-accordion__section-button";
  this.sectionExpandedClass = "govuk-accordion__section--expanded";
}

// Initialize component
TranslatableAccordion.prototype.init = function () {
  // Check for module
  if (!this.$module) {
    return;
  }

  this.initControls();

  this.initSectionHeaders();

  // See if "Open all" button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen();
  this.updateOpenAllButton(areAllSectionsOpen);
};

// Initialise controls and set attributes
TranslatableAccordion.prototype.initControls = function () {
  // Handle events for the controls
  this.$openAllButton.addEventListener(
    "click",
    this.onOpenOrCloseAllToggle.bind(this)
  );
};

// Initialise section headers
TranslatableAccordion.prototype.initSectionHeaders = function () {
  // Loop through section headers
  nodeListForEach(
    this.$sections,
    function ($section, i) {
      // Set header attributes
      var header = $section.querySelector("." + this.sectionHeaderClass);
      this.initHeaderAttributes(header, i);

      this.setExpanded(this.isExpanded($section), $section);

      // Handle events
      header.addEventListener(
        "click",
        this.onSectionToggle.bind(this, $section)
      );

      // See if there is any state stored in sessionStorage and set the sections to
      // open or closed.
      this.setInitialState($section);
    }.bind(this)
  );
};

// Set individual header attributes
TranslatableAccordion.prototype.initHeaderAttributes = function (
  $headerWrapper,
  index
) {
  var $module = this;
  var $span = $headerWrapper.querySelector("." + this.sectionButtonClass);
  var $heading = $headerWrapper.querySelector("." + this.sectionHeadingClass);
  var $summary = $headerWrapper.querySelector("." + this.sectionSummaryClass);

  // Copy existing span element to an actual button element, for improved accessibility.
  var $button = document.createElement("button");
  $button.setAttribute("type", "button");
  $button.setAttribute("id", this.moduleId + "-heading-" + (index + 1));
  $button.setAttribute(
    "aria-controls",
    this.moduleId + "-content-" + (index + 1)
  );

  // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
  for (var i = 0; i < $span.attributes.length; i++) {
    var attr = $span.attributes.item(i);
    $button.setAttribute(attr.nodeName, attr.nodeValue);
  }

  $button.addEventListener("focusin", function (e) {
    if (!$headerWrapper.classList.contains($module.sectionHeaderFocusedClass)) {
      $headerWrapper.className += " " + $module.sectionHeaderFocusedClass;
    }
  });

  $button.addEventListener("blur", function (e) {
    $headerWrapper.classList.remove($module.sectionHeaderFocusedClass);
  });

  if (typeof $summary !== "undefined" && $summary !== null) {
    $button.setAttribute(
      "aria-describedby",
      this.moduleId + "-summary-" + (index + 1)
    );
  }

  // $span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
  $button.innerHTML = $span.innerHTML;

  $heading.removeChild($span);
  $heading.appendChild($button);

  // Add "+/-" icon
  var icon = document.createElement("span");
  icon.className = this.iconClass;
  icon.setAttribute("aria-hidden", "true");

  $button.appendChild(icon);
};

// When section toggled, set and store state
TranslatableAccordion.prototype.onSectionToggle = function ($section) {
  var expanded = this.isExpanded($section);
  this.setExpanded(!expanded, $section);

  // Store the state in sessionStorage when a change is triggered
  this.storeState($section);
};

// When Open/Close All toggled, set and store state
TranslatableAccordion.prototype.onOpenOrCloseAllToggle = function () {
  var $module = this;
  var $sections = this.$sections;

  var nowExpanded = !this.checkIfAllSectionsOpen();

  nodeListForEach($sections, function ($section) {
    $module.setExpanded(nowExpanded, $section);
    // Store the state in sessionStorage when a change is triggered
    $module.storeState($section);
  });

  $module.updateOpenAllButton(nowExpanded);
};

// Set section attributes when opened/closed
TranslatableAccordion.prototype.setExpanded = function (expanded, $section) {
  var $button = $section.querySelector("." + this.sectionButtonClass);
  $button.setAttribute("aria-expanded", expanded);

  if (expanded) {
    $section.classList.add(this.sectionExpandedClass);
  } else {
    $section.classList.remove(this.sectionExpandedClass);
  }

  // See if "Open all" button text should be updated
  var areAllSectionsOpen = this.checkIfAllSectionsOpen();
  this.updateOpenAllButton(areAllSectionsOpen);
};

// Get state of section
TranslatableAccordion.prototype.isExpanded = function ($section) {
  return $section.classList.contains(this.sectionExpandedClass);
};

// Check if all sections are open
TranslatableAccordion.prototype.checkIfAllSectionsOpen = function () {
  // Get a count of all the TranslatableAccordion sections
  var sectionsCount = this.$sections.length;
  // Get a count of all TranslatableAccordion sections that are expanded
  var expandedSectionCount = this.$module.querySelectorAll(
    "." + this.sectionExpandedClass
  ).length;
  var areAllSectionsOpen = sectionsCount === expandedSectionCount;

  return areAllSectionsOpen;
};

// Update "Open all" button
TranslatableAccordion.prototype.updateOpenAllButton = function (expanded) {
  this.$openAllButton.querySelector("#" + this.moduleId + "-closed").className =
    "govuk-accordion__open-all-toggle" + (expanded ? " hidden" : "");
  this.$openAllButton.querySelector("#" + this.moduleId + "-open").className =
    "govuk-accordion__open-all-toggle" + (expanded ? "" : " hidden");
  this.$openAllButton.setAttribute("aria-expanded", expanded);
};

// Check for `window.sessionStorage`, and that it actually works.
var helper = {
  checkForSessionStorage: function () {
    var testString = "this is the test string";
    var result;
    try {
      window.sessionStorage.setItem(testString, testString);
      result =
        window.sessionStorage.getItem(testString) === testString.toString();
      window.sessionStorage.removeItem(testString);
      return result;
    } catch (exception) {
      if (
        typeof console === "undefined" ||
        typeof console.log === "undefined"
      ) {
        console.log("Notice: sessionStorage not available.");
      }
    }
  },
};

// Set the state of the accordions in sessionStorage
TranslatableAccordion.prototype.storeState = function ($section) {
  if (this.browserSupportsSessionStorage) {
    // We need a unique way of identifying each content in the accordion. Since
    // an `#id` should be unique and an `id` is required for `aria-` attributes
    // `id` can be safely used.
    var $button = $section.querySelector("." + this.sectionButtonClass);

    if ($button) {
      var contentId = $button.getAttribute("aria-controls");
      var contentState = $button.getAttribute("aria-expanded");

      if (
        typeof contentId === "undefined" &&
        (typeof console === "undefined" || typeof console.log === "undefined")
      ) {
        console.error(
          new Error("No aria controls present in accordion section heading.")
        );
      }

      if (
        typeof contentState === "undefined" &&
        (typeof console === "undefined" || typeof console.log === "undefined")
      ) {
        console.error(
          new Error("No aria expanded present in accordion section heading.")
        );
      }

      // Only set the state when both `contentId` and `contentState` are taken from the DOM.
      if (contentId && contentState) {
        window.sessionStorage.setItem(contentId, contentState);
      }
    }
  }
};

// Read the state of the accordions from sessionStorage
TranslatableAccordion.prototype.setInitialState = function ($section) {
  if (this.browserSupportsSessionStorage) {
    var $button = $section.querySelector("." + this.sectionButtonClass);

    if ($button) {
      var contentId = $button.getAttribute("aria-controls");
      var contentState = contentId
        ? window.sessionStorage.getItem(contentId)
        : null;

      if (contentState !== null) {
        this.setExpanded(contentState === "true", $section);
      }
    }
  }
};

const Accordions = {
  initAll: function () {
    const $accordions = document.querySelectorAll(
      '[data-module="govuk-accordion-i18n"]'
    );
    nodeListForEach($accordions, function ($accordion) {
      new TranslatableAccordion($accordion).init();
    });
  },
};

module.exports = {
  Accordions,
};
