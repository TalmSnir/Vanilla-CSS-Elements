// !=============================================
// =            constants            =
// !=============================================
const ELEMENTS_TYPES = [
  ...document.querySelectorAll('link[rel="stylesheet"]'),
].map(sheet => {
  let elementType = sheet.href;
  elementType = elementType.replace(/(https?:\/\/.*\/)/, '');
  elementType = elementType.replace(/\.css/, '');
  return elementType;
});

let CSS_CUSTOM_PROPERTIES = getCustomProperties();

const LIGHT_THEME_COLORS = [
  ['--vce-clr-primary-surface', 'hsl(248, 49%, 46%)'],
  ['--vce-clr-primary-top', 'hsl(0, 100%, 100%)'],
  ['--vce-clr-secondary-surface', 'hsl(206, 54%, 55%)'],
  ['--vce-clr-secondary-top', 'hsl(0, 100%, 100%)'],
  ['--vce-clr-tertiary-surface', 'hsl(177, 90%, 59%)'],
  ['--vce-clr-tertiary-top', ' hsl(0, 100%, 100%)'],
  ['--vce-clr-accent-surface', 'hsl(287, 12%, 40%)'],
  ['--vce-clr-dark', 'hsl(0, 0%, 0%)'],
  ['--vce-clr-modal-background', ' hsl(0, 0%, 0%, 0.7)'],
  ['--vce-clr-container-background', 'hsl(0, 100%, 100%)'],
  ['--vce-clr-shadow-1', 'hsl(0, 0%, 0%, 0.18)'],
  ['--vce-clr-shadow-2', 'hsl(0, 0%, 0%, 0.12)'],
  ['--vce-clr-shadow-3', 'hsl(0, 0%, 0%, 0.04)'],
  ['--vce-clr-container-background-top', 'hsl(240, 23%, 97%)'],
  ['--vce-clr-text', 'hsl(0, 0%, 0%)'],
];

const DARK_THEME_COLORS = [
  ['--vce-clr-primary-surface', 'hsl(247, 49%, 71%)'],
  ['--vce-clr-primary-top', 'hsl(0, 0%, 0%)'],
  ['--vce-clr-secondary-surface', 'hsl(206, 55%, 78%)'],
  ['--vce-clr-secondary-top', ' hsl(0, 0%, 0%)'],
  ['--vce-clr-tertiary-surface', 'hsl(177, 89%, 83%)'],
  ['--vce-clr-tertiary-top', 'hsl(0, 0%, 0%)'],
  ['--vce-clr-accent-surface', 'hsl(286, 12%, 64%)'],
  ['--vce-clr-dark', ' hsl(0, 0%, 0%)'],
  ['--vce-clr-modal-background', ' hsl(240, 23%, 97%,0.3)'],
  ['--vce-clr-container-background', ' hsl(0, 0%, 0%)'],
  ['--vce-clr-shadow-1', 'hsl(0, 100%, 100%, 0.18)'],
  ['--vce-clr-shadow-2', 'hsl(0, 100%, 100%, 0.12)'],
  ['--vce-clr-shadow-3', 'hsl(0, 100%, 100%, 0.04)'],
  ['--vce-clr-container-background-top', 'hsl(240, 23%, 10%)'],
  ['--vce-clr-text', 'hsl(0, 100%, 100%)'],
];

// !=============================================
// =       assigning global variables        =
// !=============================================
const elementsContainers = document.querySelectorAll('.element__container');
const body = document.querySelector('body');
let preferredColorScheme = 'light-theme';
const themeBtn = document.querySelector('.color-scheme');

// !=============================================
// =            functions            =
// !=============================================

// *----------  custom properties  ----------

//gets all the custom properties(css variables) from the mainstyle style sheet.
function getCustomProperties() {
  const cssMainRules = [...document.styleSheets[0].cssRules];
  const cssRootRules = cssMainRules.find(rule => rule.selectorText === ':root');
  const cssRootStyle = [...cssRootRules.style];
  const cssCustomProperties = cssRootStyle.map(rootStyle => [
    rootStyle,
    cssRootRules.style.getPropertyValue(rootStyle),
  ]);
  return cssCustomProperties;
}

// *----------  html and css text  ----------

//gets the text of the element's css. (this is the text without the custom variables)
function getElementCss(element, container) {
  const elementClasses = [...element.classList];
  const elementType = container.dataset.type;
  cssStyleSheetId = ELEMENTS_TYPES.findIndex(type => type === elementType);

  const cssRulesList = document.styleSheets[cssStyleSheetId].cssRules;
  let elementStyle = elementClasses.reduce((elementStyle, elementClass) => {
    for (const rule of cssRulesList) {
      const ruleText = rule.cssText;

      if (ruleText.includes(elementClass)) {
        elementStyle = elementStyle + ' ' + rule.cssText;
      }
    }
    return elementStyle;
  }, '');
  elementStyle = replaceCustomPropertiesWithValue(
    elementStyle,
    CSS_CUSTOM_PROPERTIES
  );
  return elementStyle;
}

//gets the outerHtml of a given element
function getElementHtml(element) {
  const elementOuterHtml = element.outerHTML;
  return elementOuterHtml;
}

//replaces the html greater than and smaller than signs with there entities and strips the unnecessary classes for the end user
function setHtmlAsText(elementOuterHtml) {
  let elementHtmlText = elementOuterHtml.replace(/>/gi, '&gt');
  elementHtmlText = elementHtmlText.replace(/</gi, '&lt');
  elementHtmlText = elementHtmlText.replace(' element', '');

  return elementHtmlText;
}

//replaces the custom properties with their values.
function replaceCustomPropertiesWithValue(elementCss, cssCustomProperties) {
  const elementCssAfterReplacement = cssCustomProperties.reduce(
    (elementCleanCss, cssProperty) => {
      return elementCleanCss.replaceAll(
        `var(${cssProperty[0]})`,
        cssProperty[1]
      );
    },
    elementCss
  );
  return elementCssAfterReplacement;
}

// *----------  finding the necessary functions to run   ----------

//gets the container of the element if the button that was clicked has been copy/watch.
function getElementNode(e) {
  const elementClassList = e.target.classList;
  if (
    elementClassList.contains('copy-to-clipboard') ||
    elementClassList.contains('watch-code')
  ) {
    const container = e.currentTarget;
    const element = container.querySelector('.element');
    const elementCss = getElementCss(element, container);
    const elementHtml = getElementHtml(element);
    elementClassList.contains('copy-to-clipboard')
      ? copyElement(elementCss, elementHtml)
      : createElementModal(elementCss, elementHtml);
  }
}

//sets the element's css and html to the user's clipboard
function copyElement(elementCss, elementHtml) {
  let copyStatus = navigator.clipboard.writeText(elementHtml + elementCss);
  copyStatus = copyStatus ? 'successfully' : 'unsuccessfully';
  const statusModal = document.createElement('div');
  statusModal.classList.add('status-modal');
  copyStatus === 'unsuccessfully'
    ? (statusModal.style.backgroundColor = 'red')
    : '';
  statusModal.innerHTML = `
  <p>the element's html and css have been copied ${copyStatus}</p>
  `;

  body.appendChild(statusModal);
  setTimeout(() => body.removeChild(statusModal), 3000);
}

// *----------  modals  ----------

//creates the watch-code modal with the element's css and html.
function createElementModal(elementCss, elementHtml) {
  const modalContainer = document.createElement('div');
  const elementHtmlText = setHtmlAsText(elementHtml);
  modalContainer.classList.add('modal__container');
  modalContainer.innerHTML = `
  <div class="modal__content">
  <div class="modal__buttons-group buttons-group">
  <button class="copy-to-clipboard" >
  <svg class='icon--copy' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M23.4666 3.2H28.7999V28.8C28.7999 29.9782 27.8448 30.9333 26.6666 30.9333H5.33328C4.15508 30.9333 3.19995 29.9782 3.19995 28.8V3.2H8.53328M9.59995 1.06667H22.4V5.33333C22.4 6.51154 21.4448 7.46667 20.2666 7.46667H11.7333C10.5551 7.46667 9.59995 6.51154 9.59995 5.33333V1.06667Z" stroke="black"/>
  </svg>
      copy
  </button>
  <button class="close-modal" >
  <svg class='icon--close' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.19995 3.2L28.7999 28.8M3.19995 28.8L28.7999 3.2" stroke="black"/>
</svg>

  
close
</button>
</div>
<div class="modal__outputs">
<div >
<h2>html</h2>
<pre>
<code class="language-html">
${elementHtmlText}
</code>
</pre></div>
<div >
<h2>css</h2>
<pre>
<code class="language-css">
${elementCss.replace(/;/gi, ';\n').replace(/{/gi, '{\n').replace(/}/gi, '}\n')} 
</code>
</pre>
</div>
</div>
</div>

  
  `;

  body.appendChild(modalContainer);

  modalContainer
    .querySelectorAll('code')
    .forEach(codeBlock => Prism.highlightElement(codeBlock));

  const modalContent = modalContainer.querySelector('.modal__content');

  setListenersToModal(modalContent, modalContainer, elementCss, elementHtml);
}

//set listeners to the modal's copy and close buttons
function setListenersToModal(
  modalContent,
  modalContainer,
  elementCss,
  elementHtml
) {
  const closeButton = modalContent.querySelector('.close-modal'),
    copyButton = modalContent.querySelector('.copy-to-clipboard');
  closeButton.addEventListener('click', () =>
    closeAndDeleteModal(modalContainer)
  );
  copyButton.addEventListener('click', () =>
    copyElement(elementCss, elementHtml)
  );
}
//closes the modal and deletes it's node from the dom
function closeAndDeleteModal(modalContainer) {
  body.removeChild(modalContainer);
}

// *----------  setting the site on load  ----------

//inserts the buttons group to each and every element's container .
(function () {
  elementsContainers.forEach(container => {
    const buttons = document.createElement('div');
    buttons.classList.add('buttons-group');
    buttons.innerHTML = `<button class="copy-to-clipboard" >
    <svg class='icon--copy' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.4666 3.2H28.7999V28.8C28.7999 29.9782 27.8448 30.9333 26.6666 30.9333H5.33328C4.15508 30.9333 3.19995 29.9782 3.19995 28.8V3.2H8.53328M9.59995 1.06667H22.4V5.33333C22.4 6.51154 21.4448 7.46667 20.2666 7.46667H11.7333C10.5551 7.46667 9.59995 6.51154 9.59995 5.33333V1.06667Z" stroke="black"/>
</svg>

        copy
      </button>
      <button class="watch-code" >
      <svg class='icon--code' width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path  d="M22.0464 22.0464L21.6928 22.4L22.4 23.1071L22.7535 22.7535L22.0464 22.0464ZM28.7999 16L29.1535 16.3535L29.5071 16L29.1535 15.6464L28.7999 16ZM22.7535 9.24644L22.4 8.89289L21.6928 9.6L22.0464 9.95355L22.7535 9.24644ZM9.2464 22.7535L9.59995 23.1071L10.3071 22.4L9.9535 22.0464L9.2464 22.7535ZM3.19995 16L2.8464 15.6464L2.49284 16L2.8464 16.3535L3.19995 16ZM9.9535 9.95355L10.3071 9.6L9.59995 8.89289L9.2464 9.24644L9.9535 9.95355ZM22.7535 22.7535L29.1535 16.3535L28.4464 15.6464L22.0464 22.0464L22.7535 22.7535ZM29.1535 15.6464L22.7535 9.24644L22.0464 9.95355L28.4464 16.3535L29.1535 15.6464ZM9.9535 22.0464L3.5535 15.6464L2.8464 16.3535L9.2464 22.7535L9.9535 22.0464ZM3.5535 16.3535L9.9535 9.95355L9.2464 9.24644L2.8464 15.6464L3.5535 16.3535ZM17.6401 3.1178L13.3734 28.7178L14.3598 28.8822L18.6265 3.2822L17.6401 3.1178Z" stroke="black"/>
      </svg>
        code
      </button>
      `;
    container.appendChild(buttons);
    if (
      container.classList.contains('effect--hover') ||
      container.classList.contains('effect--focus') ||
      container.classList.contains('effect--active') ||
      container.classList.contains('effect--disabled')
    ) {
      const EffectIndicator = document.createElement('div');
      EffectIndicator.classList.add('effect-indicator');
      if (container.classList.contains('effect--hover')) {
        EffectIndicator.innerHTML += createHoverIndicator();
      }
      if (container.classList.contains('effect--focus')) {
        EffectIndicator.innerHTML += createFocusIndicator();
      }
      if (container.classList.contains('effect--active')) {
        EffectIndicator.innerHTML += createActiveIndicator();
      }
      if (container.classList.contains('effect--disabled')) {
        EffectIndicator.innerHTML += createDisabledIndicator();
      }
      container.appendChild(EffectIndicator);
    }
  });
})();

function createHoverIndicator() {
  return `<div class="effect-indicator--hover indicator__container">
<span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 16L16.1373 15.5192C15.9627 15.4694 15.7748 15.518 15.6464 15.6464C15.518 15.7748 15.4693 15.9628 15.5192 16.1374L16 16ZM20.2666 30.9333L19.7859 31.0707C19.844 31.2741 20.0239 31.4189 20.235 31.4323C20.4462 31.4457 20.6429 31.3248 20.7262 31.1303L20.2666 30.9333ZM30.9333 20.2667L31.1303 20.7262C31.3247 20.6429 31.4457 20.4462 31.4323 20.235C31.4189 20.0239 31.2741 19.844 31.0707 19.7859L30.9333 20.2667ZM23.4666 23.4667L23.2697 23.0071C23.1517 23.0577 23.0577 23.1517 23.0071 23.2697L23.4666 23.4667ZM1.06665 1.06667V0.566666H0.56665V1.06667H1.06665ZM28.8 1.06667H29.3V0.566666H28.8V1.06667ZM1.06665 28.8H0.56665V29.3H1.06665V28.8ZM15.5192 16.1374L19.7859 31.0707L20.7474 30.796L16.4807 15.8626L15.5192 16.1374ZM31.0707 19.7859L16.1373 15.5192L15.8626 16.4808L30.796 20.7474L31.0707 19.7859ZM20.7262 31.1303L23.9262 23.6636L23.0071 23.2697L19.8071 30.7364L20.7262 31.1303ZM23.6636 23.9262L31.1303 20.7262L30.7364 19.8071L23.2697 23.0071L23.6636 23.9262ZM1.06665 1.56667H28.8V0.566666H1.06665V1.56667ZM28.3 1.06667V14.9333H29.3V1.06667H28.3ZM0.56665 1.06667V28.8H1.56665V1.06667H0.56665ZM1.06665 29.3H14.9333V28.3H1.06665V29.3Z" fill="black"/>
</svg>
</span>
<span>hover</span></div>`;
}

function createFocusIndicator() {
  return `<div class="effect-indicator--focus indicator__container">
 <span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M9.06663 2.13333H4.11425C3.0202 2.13333 2.1333 3.02023 2.1333 4.11428V9.06666M22.9333 2.13333H27.8857C28.9797 2.13333 29.8666 3.02023 29.8666 4.11428V9.06666M2.1333 22.9333V27.8857C2.1333 28.9798 3.0202 29.8667 4.11425 29.8667H9.06663M29.8666 22.9333V27.8857C29.8666 28.9798 28.9797 29.8667 27.8857 29.8667H22.9333M16 23.4667C11.8762 23.4667 8.5333 20.1237 8.5333 16C8.5333 11.8763 11.8762 8.53333 16 8.53333C20.1237 8.53333 23.4666 11.8763 23.4666 16C23.4666 20.1237 20.1237 23.4667 16 23.4667Z" stroke="black"/>
 </svg>
 
 </span>
 <span>focus</span></div>`;
}
function createActiveIndicator() {
  return `<div class="effect-indicator--focus indicator__container">
 <span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M1.06641 16C1.06641 24.2475 7.75229 30.9333 15.9998 30.9333C24.2472 30.9333 30.9331 24.2475 30.9331 16C30.9331 7.75253 24.2472 1.06665 15.9998 1.06665C7.75229 1.06665 1.06641 7.75253 1.06641 16Z" stroke="black"/>
 </svg>
 
 
 </span>
 <span>active</span></div>`;
}

function createDisabledIndicator() {
  return `<div class="effect-indicator--focus indicator__container">
 <span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M5.35331 5.64642L26.4746 26.7677M1.06641 16C1.06641 24.2475 7.75229 30.9333 15.9998 30.9333C24.2472 30.9333 30.9331 24.2475 30.9331 16C30.9331 7.75253 24.2472 1.06665 15.9998 1.06665C7.75229 1.06665 1.06641 7.75253 1.06641 16Z" stroke="black"/>
 </svg>
 
 
 </span>
 <span>disabled</span></div>`;
}

// *----------  setting color scheme  ----------
//changes the color scheme according to the user's preferences and the theme button on the site.
function changeColorTheme(colorMode) {
  const docElement = document.documentElement;
  const heroImage = document.querySelector('.hero-image');
  if (colorMode === 'dark-theme') {
    heroImage.src = './assets/image-landing-dark-mode.svg';
    LIGHT_THEME_COLORS.forEach((color, id) => {
      docElement.style.setProperty(color[0], DARK_THEME_COLORS[id][1]);
    });
  } else {
    heroImage.src = './assets/image-landing-light-mode.svg';
    DARK_THEME_COLORS.forEach((color, id) => {
      docElement.style.setProperty(color[0], LIGHT_THEME_COLORS[id][1]);
    });
  }
}
//detects the user's os color scheme preference and changes the theme accordingly.
(function isDarkModeEnabled() {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    preferredColorScheme = 'dark-theme';
    themeBtn.classList.add('dark-theme');
    changeColorTheme(preferredColorScheme);
    updateCustomPropertiesColors();
  }
})();

//updates the css properties when color scheme is being set
function updateCustomPropertiesColors() {
  const colorsToInsert = themeBtn.classList.contains('dark-theme')
    ? DARK_THEME_COLORS
    : LIGHT_THEME_COLORS;

  for (let i = 0; i < colorsToInsert.length; i++) {
    CSS_CUSTOM_PROPERTIES[i][1] = colorsToInsert[i][1];
  }
}
// !=============================================
// =           global event listeners            =
// !=============================================

//Event Listeners
elementsContainers.forEach(container =>
  container.addEventListener('click', getElementNode)
);
themeBtn.addEventListener('click', () => {
  themeBtn.blur();
  if (themeBtn.classList.contains('dark-theme')) {
    changeColorTheme('light-theme');
    themeBtn.classList.remove('dark-theme');
  } else {
    changeColorTheme('dark-theme');
    themeBtn.classList.add('dark-theme');
  }
  updateCustomPropertiesColors();
});
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', e => {
    const heroImage = document.querySelector('.hero-image');

    if (e.matches) {
      preferredColorScheme = 'dark-theme';
      themeBtn.classList.add('dark-theme');
    } else {
      preferredColorScheme = 'light-theme';
      themeBtn.classList.remove('dark-theme');
    }

    changeColorTheme(preferredColorScheme);
    updateCustomPropertiesColors();
  });
window
  .matchMedia('(min-width:1240px)')
  .addEventListener('change', e =>
    e.matches ? menuIcon.classList.remove('active') : ''
  );

function toggleMenu() {
  this.classList.toggle('active');

  if (this.classList.contains('active')) {
    document.addEventListener('click', handleClickOutsideMenu);
    menu.addEventListener('click', handleClickInsideMenu);
  }
}
function handleClickOutsideMenu(e) {
  e.stopPropagation();
  if (e.target != menuIcon && !menu.contains(e.target)) {
    document.removeEventListener('click', handleClickOutsideMenu);
    menuIcon.classList.remove('active');
  }
}
function handleClickInsideMenu(e) {
  e.stopPropagation();

  if (e.target !== this && !e.target.classList.contains('color-scheme')) {
    document.removeEventListener('click', handleClickOutsideMenu);
    menu.removeEventListener('click', handleClickInsideMenu);
    menuIcon.classList.remove('active');
  }
}

const menuIcon = document.querySelector('.header__nav__menu-icon');
menu = menuIcon.nextElementSibling;
menuIcon.addEventListener('click', toggleMenu);
