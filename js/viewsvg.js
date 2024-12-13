/// <reference path="common.js" />
/* global Settings, saveSettings, StoreName, getStringBetween, getFiltersCss,
   getModalInputText, showModalDialog, exportSvg, exportPng, setupModal,
   createElementFromHtml, Colours, Mouse, backOrHome */

// Constants
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const STYLE_ID = 'm365MapsHighlights';
const SELECT_CLASS = "m365maps-select";
const DRAW_CLASS = 'm365maps-draw';
const TEXT_CLASS = 'm365maps-text';
const IMAGE_CLASS = 'm365maps-image';
const HIGH_CLASS_1 = 'highlight1';
const HIGH_CLASS_2 = 'highlight2';
const HIGH_CLASS_3 = 'highlight3';
const HIGH_CLASS_4 = 'highlight4';
const SCROLL_STEP_SIZE = 0.05;
const ZOOM_STEP_SIZE = 20;

/** Image gallery of clip art for inserting image. */
const IMAGE_GALLERY = [
  { label: 'Tick', value: '/media/sprites.svg#tick(32x32)' },
  { label: 'Cross', value: '/media/sprites.svg#cross(32x32)' },
  { label: 'Star', value: '/media/sprites.svg#star(32x32)' },
  { label: 'Priority: High', value: '/media/sprites.svg#label-priority-high(96x15)' },
  { label: 'Priority: Medium', value: '/media/sprites.svg#label-priority-medium(96x15)' },
  { label: 'Priority: Low', value: '/media/sprites.svg#label-priority-low(96x15)' },
  { label: 'Priority: Must Have', value: '/media/sprites.svg#label-mscw-m(32x32)' },
  { label: 'Priority: Should Have', value: '/media/sprites.svg#label-mscw-s(32x32)' },
  { label: 'Priority: Could Have', value: '/media/sprites.svg#label-mscw-c(32x32)' },
  { label: 'Priority: Won\'t Have', value: '/media/sprites.svg#label-mscw-w(32x32)' },
  { label: 'Label: Will', value: '/media/sprites.svg#label-will(96x15)' },
  { label: 'Label: In progress', value: '/media/sprites.svg#label-in-progress(96x15)' },
  { label: 'Label: Testing', value: '/media/sprites.svg#label-testing(96x15)' },
  { label: 'Label: Purchasing', value: '/media/sprites.svg#label-purchasing(96x15)' },
  { label: 'Label: Purchased', value: '/media/sprites.svg#label-purchased(96x15)' },
  { label: 'Label: On hold', value: '/media/sprites.svg#label-on-hold(96x15)' },
  { label: 'Label: Not yet', value: '/media/sprites.svg#label-not-yet(96x15)' },
  { label: 'Label: Done', value: '/media/sprites.svg#label-done(96x15)' },
  { label: 'Completion: 0%', value: '/media/sprites.svg#percent-0(32x32)' },
  { label: 'Completion: 25%', value: '/media/sprites.svg#percent-1(32x32)' },
  { label: 'Completion: 50%', value: '/media/sprites.svg#percent-2(32x32)' },
  { label: 'Completion: 75%', value: '/media/sprites.svg#percent-3(32x32)' },
  { label: 'Completion: 100%', value: '/media/sprites.svg#percent-4(32x32)' },
  { label: 'Phase: 1', value: '/media/sprites.svg#label-phase-1(96x15)' },
  { label: 'Phase: 2', value: '/media/sprites.svg#label-phase-2(96x15)' },
  { label: 'Phase: 3', value: '/media/sprites.svg#label-phase-3(96x15)' },
  { label: 'Status: Green', value: '/media/sprites.svg#status-green(32x32)' },
  { label: 'Status: Yellow', value: '/media/sprites.svg#status-yellow(32x32)' },
  { label: 'Status: Red', value: '/media/sprites.svg#status-red(32x32)' },
  { label: 'Traffic Light: Green', value: '/media/sprites.svg#light-green(30x80)' },
  { label: 'Traffic Light: Yellow', value: '/media/sprites.svg#light-yellow(30x80)' },
  { label: 'Traffic Light: Red', value: '/media/sprites.svg#light-red(30x80)' },
  { label: 'Arrow: Up', value: '/media/sprites.svg#arrow-up(32x32)' },
  { label: 'Arrow: Down', value: '/media/sprites.svg#arrow-down(32x32)' },
  { label: 'Arrow: Left', value: '/media/sprites.svg#arrow-left(32x32)' },
  { label: 'Arrow: Right', value: '/media/sprites.svg#arrow-right(32x32)' },
];

/** Colours to cycle through for the drawing ink. */
const Colours = [
  // Old Colours:
  // 'Red',
  // 'Orange',
  // 'Yellow',
  // 'Green',
  // 'Blue',
  // 'Purple',
  // 'Black',
  // New Colours:
  'Red',
  // 'Maroon',
  'Orange',
  'Yellow',
  'Lime',
  'Green',
  // 'Olive',
  'Navy',
  'Blue',
  // 'Teal',
  'Aqua',
  'Fuchsia',
  'Purple',
  'Black',
  // 'Silver',
  'Gray',
  'White',
];

/** Edit Modes. */
const EditModes = {
  Off: 0,
  Highlight: 1,
  Draw: 2,
  Text: 3,
  Image: 4,
  Link: 5,
  Notes: 6,
}

/** Edit Mode Actions. */
const Actions = {
  None: 0, // No action
  Add: 1, // Click
  Move: 2, // Click + Drag
  Erase: 3, // Right-Click + Drag
  Resize: 4, // Ctrl
  Rotate: 5, // Shift
  Scroll: 6, // Click + Drag
}

/** Page Data. */
const Data = {
  Action: {
    Active: false,
    Type: Actions.None,
  },
  Controls: {
    Brightness: undefined,
    Contrast: undefined,
    Hue: undefined,
    Open: false,
    Saturation: undefined,
  },
  Edit: {
    HasEdits: false,
    Open: false,
    Mode: EditModes.Off,
    LastMode: EditModes.Highlight,
    Node: undefined,
    // Centre: {
    //   X: 0,
    //   Y: 0,
    // },
    Transform: {
      Rotate: 0,
      Scale: 1,
      Translate: {
        X: 0,
        Y: 0,
      },
      StartScale: 1,
    },
  },
  Filename: '',
  Flags: [],
  IgnoreClick: false,
  IsComparing: false,
  IsSavedDiagram: false,
  Menu: {
    Open: false,
  },
  PinchZoom: {
    Distance: 0,
    X1: 0,
    Y1: 0,
    X2: 0,
    Y2: 0,
  },
  Pointer: {
    IgnoreMove: true,
    Moved: false,
    TouchCount: 0,
    X: 0,
    Y: 0,
  },
  SavedDiagramTitle: 'untitled',
  Scroll: {
    StartLeft: 0,
    StartTop: 0,
  },
  Svg: {
    Node: undefined,
    StartWidth: 0,
    StartHeight: 0,
    NativeWidth: 0,
    NativeHeight: 0,
    RatioX: 0,
    RatioY: 0,
  },
  Zoom: {
    Level: 100,
    Trigger: false,
  },
};

/** Sets the Data.Edit.HasEdits flag based on the state variable and updates
 *  the menu-save button and document.title. */
function hasEdits(state) {
  if (!Data.Edit.HasEdits && state) {
    Data.Edit.HasEdits = true;
    document.getElementById('menu-save').classList.add('active');
    document.title += ' *';
  } else if (Data.Edit.HasEdits && !state) {
    Data.Edit.HasEdits = false;
    document.getElementById('menu-save').classList.remove('active');
    if (document.title.endsWith(' *')) {
      document.title = document.title.slice(0, -2);
    }
  }
}

/** Converts the SVG Tag into XML. */
function getSvgXml() {
  return new XMLSerializer().serializeToString(Data.Svg.Node);
}

/** Inject the Highlight Style block into the SVG tag. */
function injectHighlightStyles() {
  const oldStyleTag = Data.Svg.Node.getElementById(STYLE_ID);
  if (oldStyleTag) Data.Svg.Node.removeChild(oldStyleTag);

  // TODO: Make these configurable?
  const drawWidth = '5px'; // ${drawWidth}
  const textSize = '2.5em'; // ${textSize}
  const textWeight = 'bold'; // ${textWeight}
  const textFontFamily = 'Arial'; // ${textFontFamily}

  const styleTag = document.createElement('style');
  styleTag.id = STYLE_ID;

  styleTag.textContent = `.${HIGH_CLASS_1}{fill:${Settings.Highlight1};}
.${HIGH_CLASS_2}{fill:${Settings.Highlight2};}
.${HIGH_CLASS_3}{fill:${Settings.Highlight3};}
.${HIGH_CLASS_4}{fill:${Settings.Highlight4};}
.${DRAW_CLASS}{stroke-width:${drawWidth};stroke-linecap:round;stroke-linejoin:round;fill-opacity:25%;stroke-opacity:80%;}
.${TEXT_CLASS}{font-family:${textFontFamily};font-size:${textSize};font-weight:${textWeight};}
.${SELECT_CLASS}{filter:drop-shadow(0 0 10px #ff0);}`;

  Data.Svg.Node.appendChild(styleTag);
}

/** Returns a highlight target inside the SVG given the starting element. */
function findHighlightTarget(start) {
  let target = start;

  while (target.nodeName === 'tspan') target = target.parentNode;

  if (target.nodeName === 'text') target = target.parentNode;

  if (target.nodeName === 'g' || target.nodeName === 'a') {
    let children = target.getElementsByTagName('rect');
    if (children.length === 0) {
      children = target.getElementsByTagName('path');
    }

    if (children.length === 0) return undefined;

    target = children.item(0);
  }

  return (
    target.nodeName === 'rect' ||
    target.nodeName === 'path' ||
    target.nodeName === 'circle' ||
    target.nodeName === 'ellipse') ? target : undefined;
}

/** Sizes the SVG image to fit according the user preferred Zoom option. */
function resizeSvg() {
  let scale = 1;

  switch (Settings.Zoom) {
    case 'Fit':
      scale = Math.min(
        window.innerWidth / Data.Svg.NativeWidth,
        window.innerHeight / Data.Svg.NativeHeight);
      break;

    case 'Fit Width':
      scale = window.innerWidth / Data.Svg.NativeWidth;
      break;

    case 'Fit Height':
      scale = window.innerHeight / Data.Svg.NativeHeight;
      break;

    case 'Fill':
      scale = Math.max(
        window.innerWidth / Data.Svg.NativeWidth,
        window.innerHeight / Data.Svg.NativeHeight);
      break;

    case 'Original':
      break;

    default:
      throw 'Unexpected Zoom setting: ' + Settings.Zoom;
  }

  Data.Svg.StartWidth = Data.Svg.NativeWidth * scale;
  Data.Svg.StartHeight = Data.Svg.NativeHeight * scale;

  // Zoom
  Data.Svg.Node.style.width = Data.Svg.StartWidth.toFixed(0) + 'px';
  Data.Svg.Node.style.height = Data.Svg.StartHeight.toFixed(0) + 'px';
  Data.Zoom.Level = 100;

  // Position
  const left = ((window.innerWidth / 2) - (Data.Svg.StartWidth / 2));
  const top = ((window.innerHeight / 2) - (Data.Svg.StartHeight / 2));

  Data.Svg.Node.style.left = left.toFixed(0) + 'px';
  Data.Svg.Node.style.top = top.toFixed(0) + 'px';

  // Ratio data
  Data.Svg.RatioX = Data.Svg.StartWidth / Data.Svg.NativeWidth;
  Data.Svg.RatioY = Data.Svg.StartHeight / Data.Svg.NativeHeight;
}

/** Resets the position of the diagram to the centre of the screen. */
function resetSvgPosition() {
  const svgWidth = parseFloat(Data.Svg.Node.style.width);
  const left = (window.innerWidth / 2) - (svgWidth / 2);
  Data.Svg.Node.style.left = left.toFixed(0) + 'px';

  const svgHeight = parseFloat(Data.Svg.Node.style.height);
  const top = (window.innerHeight / 2) - (svgHeight / 2);
  Data.Svg.Node.style.top = top.toFixed(0) + 'px';
}

/** Apply the highlighter to the click event target. */
function applyHighlightOnClick(event) {
  if (!Data.Edit.Node) return;

  if (Data.Edit.Node.classList.contains(HIGH_CLASS_1) ||
    Data.Edit.Node.classList.contains(HIGH_CLASS_2) ||
    Data.Edit.Node.classList.contains(HIGH_CLASS_3) ||
    Data.Edit.Node.classList.contains(HIGH_CLASS_4)) {
    Data.Edit.Node.classList.remove(HIGH_CLASS_1);
    Data.Edit.Node.classList.remove(HIGH_CLASS_2);
    Data.Edit.Node.classList.remove(HIGH_CLASS_3);
    Data.Edit.Node.classList.remove(HIGH_CLASS_4);
  } else {
    let newFill = document.getElementById('menu-highlight-colour').value;
    if (event.shiftKey && event.ctrlKey) {
      newFill = Settings.Highlight4;
    } else if (event.ctrlKey) {
      newFill = Settings.Highlight3;
    } else if (event.shiftKey) {
      newFill = Settings.Highlight2;
    }

    if (Data.Edit.Node.style.fill &&
      getHexForColour(Data.Edit.Node.style.fill) === newFill) {
      Data.Edit.Node.style.fill = '';
    } else {
      Data.Edit.Node.style.fill = newFill;
    }
  }

  hasEdits(true);
}

/** Adds a title node to the top parent of the selected node, or update
 *  existing. */
function setNodeTooltip() {
  if (!Data.Edit.Node) {
    return;
  }

  let topParent = Data.Edit.Node;
  while (topParent.parentNode.tagName !== 'svg') {
    topParent = topParent.parentNode;
  }

  let titleNode = undefined;
  let children = topParent.getElementsByTagName('title');
  if (children.length >= 1) {
    titleNode = children.item(0);
  }

  showModalDialog(
    titleNode ? 'Update or delete item notes' : 'Set item notes',
    true, titleNode ? titleNode.textContent : '',
    'OK', function setTooltipOK() {
      let tooltipText = getModalInputText();
      if (tooltipText) tooltipText = tooltipText.trim();
      if (tooltipText) {
        if (titleNode) {
          titleNode.textContent = tooltipText;
        } else {
          titleNode = document.createElementNS(SVG_NAMESPACE, 'title');
          titleNode.textContent = tooltipText;
          topParent.appendChild(titleNode);
        }

        hasEdits(true);
      }

      Data.Edit.Node.classList.remove(SELECT_CLASS);
    },
    titleNode ? 'Delete' : undefined, function setTooltipDelete() {
      titleNode.remove();
      Data.Edit.Node.classList.remove(SELECT_CLASS);
    },
    'Cancel', function setTooltipCancel() {
      Data.Edit.Node.classList.remove(SELECT_CLASS);
    });
}

/** Adds a hyperlink to an element or updates an existing hyperlink. */
function setNodeHyperlink() {
  if (!Data.Edit.Node) {
    return;
  }

  let linkNode = undefined;
  for (let node = Data.Edit.Node;
    node && node != Data.Svg.Node && node != document;
    node = node.parentNode) {
    if (node.tagName === 'a') {
      linkNode = node;
      break;
    }
  }

  // Can only add links to images, text, or drawings ...
  if (!linkNode &&
    !Data.Edit.Node.classList.contains(TEXT_CLASS) &&
    !Data.Edit.Node.classList.contains(IMAGE_CLASS) &&
    !Data.Edit.Node.classList.contains(DRAW_CLASS)) {
    Data.Edit.Node.classList.remove(SELECT_CLASS);
    return;
  }

  const existingUrl = linkNode ? linkNode.getAttribute('href') : undefined;

  showModalDialog(
    (linkNode && existingUrl) ?
      'Update or delete item hyperlink' : 'Set item hyperlink',
    true, existingUrl ? existingUrl : 'https://',
    'OK', function setHyperlinkOK() {
      let linkUrl = getModalInputText();
      if (linkUrl) linkUrl = linkUrl.trim();
      if (linkUrl) {
        if (linkNode) {
          linkNode.setAttribute('href', linkUrl);
        } else {
          linkNode = document.createElementNS(SVG_NAMESPACE, 'a');
          linkNode.setAttribute('target', '_blank');
          linkNode.setAttribute('href', linkUrl);

          const parent = Data.Edit.Node.parentNode;
          parent.insertBefore(linkNode, Data.Edit.Node);
          parent.removeChild(Data.Edit.Node);
          linkNode.appendChild(Data.Edit.Node);
        }

        hasEdits(true);
      }

      Data.Edit.Node.classList.remove(SELECT_CLASS);
    },
    (linkNode && existingUrl) ? 'Delete' : undefined,
    function setHyperlinkDelete() {
      linkNode.removeAttribute('href');
      Data.Edit.Node.classList.remove(SELECT_CLASS);
    },
    'Cancel', function setHyperlinkCancel() {
      Data.Edit.Node.classList.remove(SELECT_CLASS);
    });
}

/** Inserts an image at the current pointer position, from a url. */
function insertImage(url, w, h) {
  const image = new Image();

  if (w) image.width = w;
  if (h) image.height = h;

  image.onload = function imageLoaded() {
    const x = (Data.Pointer.X - parseFloat(Data.Svg.Node.style.left)) /
      Data.Svg.RatioX;
    const y = (Data.Pointer.Y - parseFloat(Data.Svg.Node.style.top)) /
      Data.Svg.RatioY;

    let width = image.width;
    let height = image.height;

    // console.log('Image Loaded (w,h):', width, height);

    // Scale image to fit inside the bounds of the SVG
    if (width > Data.Svg.NativeWidth || height > Data.Svg.NativeHeight) {
      scale = 0.9 * Math.min(
        Data.Svg.NativeWidth / width,
        Data.Svg.NativeHeight / height);

      width *= scale;
      height *= scale;
    }

    const svgImage = document.createElementNS(SVG_NAMESPACE, 'image');
    svgImage.setAttribute('href', image.src);
    svgImage.setAttribute('width', width.toFixed(1));
    svgImage.setAttribute('height', height.toFixed(1));
    svgImage.setAttribute('x', 0); // position controlled by transform
    svgImage.setAttribute('y', 0); // position controlled by transform
    svgImage.setAttribute('class', IMAGE_CLASS);
    svgImage.setAttribute('transform',
      `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

    // Data attributes
    svgImage.setAttribute('data-width', image.width);
    svgImage.setAttribute('data-height', image.height);

    Data.Svg.Node.appendChild(svgImage);

    hasEdits(true);
  };

  image.src = url;
}

/** When an image file upload occurs place the image at the current cursor
 *  position. */
function fileSelectorUploadEvent(changeEvent) {
  if (changeEvent.target.files.length === 0) return;

  const reader = new FileReader();
  reader.onload = function readerLoaded(loadEvent) {
    insertImage(loadEvent.target.result);
  };

  const file = changeEvent.target.files[0];
  reader.readAsDataURL(file);
};

/** Handle a image list dialog image click. */
function imageListItemCallback(event) {
  const regex = new RegExp('(.*)\\(([0-9]+)x([0-9]+)\\)');
  const result = regex.exec(event.target.value);
  if (result && result.length === 4) {
    insertImage(result[1], result[2], result[3])
  } else {
    insertImage(event.target.value);
  }
}

/** Take an image from the user's machine and add it to the diagram. */
function addImageOnClick() {
  showModalDialog('Select or upload an image',
    false, undefined,
    'Upload', function uploadImage() {
      document.getElementById('file-selector').click();
    }, undefined, undefined,
    'Cancel', undefined,
    true, IMAGE_GALLERY, imageListItemCallback);
}

/** Prompt the user for text to create or update a text label with. */
function addOrUpdateTextLabel() {
  showModalDialog(
    Data.Edit.Node ? 'Update or delete text label' : 'Add a text label',
    true, Data.Edit.Node ? Data.Edit.Node.textContent : '',
    'OK', function textModalOK() {
      let textContent = getModalInputText();
      if (textContent) textContent = textContent.trim();
      if (textContent) {
        if (Data.Edit.Node) {
          Data.Edit.Node.textContent = textContent;
          const colour = getModalColourValue();
          if (colour) Data.Edit.Node.style.fill = colour;
          Data.Edit.Node.classList.remove(SELECT_CLASS);
        } else {
          const x = (Data.Pointer.X - parseFloat(Data.Svg.Node.style.left)) /
            Data.Svg.RatioX;
          const y = (Data.Pointer.Y - parseFloat(Data.Svg.Node.style.top)) /
            Data.Svg.RatioY;

          const text = document.createElementNS(SVG_NAMESPACE, 'text');
          text.setAttribute('class', TEXT_CLASS);
          text.setAttribute('transform',
            `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          text.textContent = textContent;

          const colour = getModalColourValue();
          text.style.fill = colour ? colour : Colours[0];

          Data.Svg.Node.appendChild(text);
        }

        hasEdits(true);
      }
    },
    Data.Edit.Node ? 'Delete' : undefined, function textDelete() {
      Data.Edit.Node.remove();
      hasEdits(true);
    },
    'Cancel', function textModalCancel() {
      if (Data.Edit.Node) Data.Edit.Node.classList.remove(SELECT_CLASS);
    },
    false, undefined, undefined,
    true, 'Select a label colour:',
    Data.Edit.Node ?
      getHexForColour(Data.Edit.Node.style.fill) :
      document.getElementById('menu-text-colour').value);
}

/** Cycle through the sequence in Data.Colours. */
function cycleColour(colour) {
  let index = Colours.findIndex(item =>
    item.toUpperCase() === colour.toUpperCase());
  if (index === -1) index = 0;
  index = (index + 1) % Colours.length;
  return Colours[index];
}

/** Cycle the colour of the Draw Node. */
function cycleDrawColour() {
  Data.Edit.Node.style.stroke = cycleColour(Data.Edit.Node.style.stroke);
  hasEdits(true);
}

/** Handles mouse middle button click events. */
function auxClickEvent(event) {
  if (event.button !== Mouse.Button.Right) return;

  if (Data.IgnoreClick) return;

  if (Data.Edit.Node) {
    Data.Edit.Node.classList.remove(SELECT_CLASS);
  }

  switch (Data.Edit.Mode) {
    case EditModes.Draw:
      if (event.target.classList.contains(DRAW_CLASS)) {
        event.target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Highlight:
      removeHighlights(event.target);
      break;

    case EditModes.Text:
      if (event.target.classList.contains(TEXT_CLASS)) {
        event.target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Image:
      if (event.target.classList.contains(IMAGE_CLASS)) {
        event.target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Link:
    case EditModes.Notes:
    default:
      resizeSvg();
      break;
  }

  event.preventDefault();
}

/** Handles mouse left click event for highlighting. */
function clickSvgEvent(event) {
  if (Data.IgnoreClick) {
    event.preventDefault();
    return;
  }

  document.activeElement.blur();

  switch (Data.Edit.Mode) {
    case EditModes.Highlight:
      applyHighlightOnClick(event);
      if (Data.Edit.Node) Data.Edit.Node.classList.remove(SELECT_CLASS);
      event.preventDefault();
      break;

    case EditModes.Draw:
      if (Data.Edit.Node) {
        if (event.ctrlKey) {
          Data.Edit.Node.style.stroke =
            document.getElementById('menu-draw-colour').value;

          hasEdits(true);
        } else {
          cycleDrawColour();
        }
        Data.Edit.Node.classList.remove(SELECT_CLASS);
      }
      event.preventDefault();
      break;

    case EditModes.Text:
      if (Data.Edit.Node) {
        if (event.ctrlKey) {
          resetScaleTransform();
          Data.Edit.Node.classList.remove(SELECT_CLASS);
        } else if (event.shiftKey) {
          stepRotationTransform();
          Data.Edit.Node.classList.remove(SELECT_CLASS);
        } else {
          addOrUpdateTextLabel();
        }
      } else {
        addOrUpdateTextLabel();
      }
      event.preventDefault();
      break;

    case EditModes.Image:
      if (Data.Edit.Node) {
        Data.Edit.Node.classList.remove(SELECT_CLASS);
        if (event.ctrlKey) {
          resetScaleTransform();
        } else if (event.shiftKey) {
          stepRotationTransform();
        } else {
          addImageOnClick();
        }
      } else {
        addImageOnClick();
      }
      event.preventDefault();
      break;

    case EditModes.Link:
      setNodeHyperlink();
      event.preventDefault();
      break;

    case EditModes.Notes:
      setNodeTooltip();
      event.preventDefault();
      break;

    default:
      if (Data.Edit.Node) Data.Edit.Node.classList.remove(SELECT_CLASS);
      break;
  }
}

/** Determines if the given element is a descendant of a tag name supplied. */
function isDescendantOf(element, tagName) {
  const tagNameTarget = tagName.toUpperCase();

  for (let node = element; node && node != document; node = node.parentNode) {
    if (node.tagName.toUpperCase() === tagNameTarget) return true;
  }

  return false;
}

/** Create transform attribute for an SVG node. */
function updateTransform() {
  const transforms = [];

  if (Data.Edit.Transform.Translate.X !== 0 ||
    Data.Edit.Transform.Translate.Y !== 0) {
    transforms.push(`translate(${Data.Edit.Transform.Translate.X.toFixed(1)} \
${Data.Edit.Transform.Translate.Y.toFixed(1)})`);
  }

  if (Data.Edit.Transform.Rotate !== 0) {
    transforms.push(`rotate(${Data.Edit.Transform.Rotate.toFixed(1)})`);
  }

  if (Data.Edit.Transform.Scale !== 1) {
    transforms.push(`scale(${Data.Edit.Transform.Scale.toFixed(2)})`);
  }

  Data.Edit.Node.setAttribute('transform', transforms.join(' '));
}

/** Parse the transform attribute of an SVG Node and return data object. */
function parseTransform(svgNode) {
  Data.Edit.Transform.Translate.X = 0;
  Data.Edit.Transform.Translate.Y = 0;
  Data.Edit.Transform.Rotate = 0;
  Data.Edit.Transform.Scale = 1;

  const value = svgNode.getAttribute('transform');
  if (!value) return;

  const components = value.split(/\(|\s|\)/);
  for (let index = 0; index < components.length; index++) {
    switch (components[index]) {
      case 'translate':
        Data.Edit.Transform.Translate.X = parseFloat(components[++index]);
        Data.Edit.Transform.Translate.Y = parseFloat(components[++index]);
        break;

      case 'rotate':
        Data.Edit.Transform.Rotate = parseFloat(components[++index]);
        break;

      case 'scale':
        Data.Edit.Transform.Scale = parseFloat(components[++index]);
        break;
    }
  }
}

/** Handles the pointer down event. */
function pointerDown(target, x, y, ctrlKey, shiftKey) {
  if (target !== document.body && !isDescendantOf(target, 'svg')) return;

  Data.Pointer.IgnoreMove = false;
  Data.Pointer.Moved = false;
  Data.Pointer.X = x;
  Data.Pointer.Y = y;

  Data.Scroll.StartLeft = parseFloat(Data.Svg.Node.style.left);
  Data.Scroll.StartTop = parseFloat(Data.Svg.Node.style.top);
  Data.Edit.Node = undefined;
  Data.Action.Type = undefined;

  switch (Data.Edit.Mode) {
    case EditModes.Highlight:
      Data.Edit.Node = findHighlightTarget(target);
      if (Data.Edit.Node)
        Data.Edit.Node.classList.add(SELECT_CLASS);
      break;

    case EditModes.Draw:
      if (target.classList.contains(DRAW_CLASS)) {
        Data.Edit.Node = target;
        Data.Edit.Node.classList.add(SELECT_CLASS);
        parseTransform(target);
        // const bbox = target.getBBox();
        // Data.Edit.Centre.X = bbox.x + (bbox.width / 2);
        // Data.Edit.Centre.Y = bbox.y + (bbox.height / 2);

        // if (ctrlKey) {
        //   Data.Action.Type = Actions.Resize;
        // } else if (shiftKey) {
        //   Data.Action.Type = Actions.Rotate;
        // } else {
        Data.Action.Type = Actions.Move;
        Data.Pointer.X -= Data.Edit.Transform.Translate.X * Data.Svg.RatioX;
        Data.Pointer.Y -= Data.Edit.Transform.Translate.Y * Data.Svg.RatioY;
        // }
      } else {
        Data.IgnoreClick = true;
        Data.Action.Type = Actions.Add;
      }
      break;

    case EditModes.Text:
      if (target.classList.contains(TEXT_CLASS)) {
        Data.Edit.Node = target;
        Data.Edit.Node.classList.add(SELECT_CLASS);
        parseTransform(target);
        // const bbox = target.getBBox();
        // Data.Edit.Centre.X = bbox.x + (bbox.width / 2);
        // Data.Edit.Centre.Y = bbox.y + (bbox.height / 2);

        if (ctrlKey) {
          Data.Action.Type = Actions.Resize;
        } else if (shiftKey) {
          Data.Action.Type = Actions.Rotate;
        } else {
          Data.Action.Type = Actions.Move;
          Data.Pointer.X -= Data.Edit.Transform.Translate.X * Data.Svg.RatioX;
          Data.Pointer.Y -= Data.Edit.Transform.Translate.Y * Data.Svg.RatioY;
        }
      }
      break;

    case EditModes.Image:
      if (target.classList.contains(IMAGE_CLASS)) {
        Data.Edit.Node = target;
        Data.Edit.Node.classList.add(SELECT_CLASS);
        parseTransform(target);
        // const bbox = target.getBBox();
        // Data.Edit.Centre.X = bbox.x + (bbox.width / 2);
        // Data.Edit.Centre.Y = bbox.y + (bbox.height / 2);

        if (ctrlKey) {
          Data.Action.Type = Actions.Resize;
        } else if (shiftKey) {
          Data.Action.Type = Actions.Rotate;
        } else {
          Data.Action.Type = Actions.Move;
          Data.Pointer.X -= Data.Edit.Transform.Translate.X * Data.Svg.RatioX;
          Data.Pointer.Y -= Data.Edit.Transform.Translate.Y * Data.Svg.RatioY;
        }
      }
      break;

    case EditModes.Link:
      Data.Edit.Node = target;
      if (target.classList.contains(IMAGE_CLASS) ||
        target.classList.contains(TEXT_CLASS) ||
        target.classList.contains(DRAW_CLASS)) {
        target.classList.add(SELECT_CLASS);
      }
      break;

    case EditModes.Notes:
      Data.Edit.Node = target;
      if (target.classList.contains(IMAGE_CLASS) ||
        target.classList.contains(TEXT_CLASS) ||
        target.classList.contains(DRAW_CLASS)) {
        target.classList.add(SELECT_CLASS);
      }
      break;
  }
}

/** Sets drag, paint, and scroll reference data on left button and ignores
 *  other button events. */
function mouseDown(event) {
  Data.IgnoreClick = false;

  if (event.buttons === Mouse.Buttons.Left) {
    Data.Pointer.IgnoreMove = true;

    pointerDown(
      event.target,
      event.clientX,
      event.clientY,
      event.ctrlKey,
      event.shiftKey);
  } else if (event.buttons === Mouse.Buttons.Right) {
    Data.Pointer.IgnoreMove = false;
  }
}

/** Handles paint events in Draw Mode. */
function drawModePaint(x, y, ctrlKey, shiftKey) {
  // A mathematically simple estimation of distance moved
  if (Math.abs(x - Data.Pointer.X) + Math.abs(y - Data.Pointer.Y) < 4) return;

  if (!Data.Action.Active) {
    document.body.classList.add('drawing');
    Data.Action.Active = true;
    Data.IgnoreClick = true;
    hasEdits(true);
  }

  const left = parseFloat(Data.Svg.Node.style.left);
  const top = parseFloat(Data.Svg.Node.style.top);

  if (!Data.Edit.Node) {
    const startX = (Data.Pointer.X - left) / Data.Svg.RatioX;
    const startY = (Data.Pointer.Y - top) / Data.Svg.RatioY;
    const path = document.createElementNS(SVG_NAMESPACE, 'path');
    path.setAttribute('class', DRAW_CLASS);
    path.setAttribute('d', `M${startX.toFixed(1)} ${startY.toFixed(1)}`);
    path.style.stroke = document.getElementById('menu-draw-colour').value;
    Data.Svg.Node.appendChild(path);

    Data.Edit.Node = path;
  }

  const x2 = (x - left) / Data.Svg.RatioX;
  const y2 = (y - top) / Data.Svg.RatioY;

  if (ctrlKey) {
    const index = Data.Edit.Node.attributes['d'].value.lastIndexOf('L');
    if (index !== -1) {
      Data.Edit.Node.attributes['d'].value =
        Data.Edit.Node.attributes['d'].value.slice(0, index);
    }
  }

  if (Data.Edit.Node.attributes['d'].value.endsWith('Z')) {
    Data.Edit.Node.attributes['d'].value =
      Data.Edit.Node.attributes['d'].value.slice(0, -1);
  }

  Data.Edit.Node.attributes['d'].value += `L${x2.toFixed(1)} ${y2.toFixed(1)}`;

  if (shiftKey) {
    Data.Edit.Node.attributes['d'].value += 'Z';
  }

  Data.Pointer.X = x;
  Data.Pointer.Y = y;
}

/** Processes a scroll mouse move. Scrolls based on fixed start position. */
function scrollMove(x, y) {
  if (!Data.Action.Active) {
    document.body.classList.add('scrolling');
    Data.Action.Type = Actions.Scroll;
    Data.Action.Active = true;
    Data.IgnoreClick = true;
  }

  const left = (Data.Scroll.StartLeft - Data.Pointer.X + x).toFixed(0);
  Data.Svg.Node.style.left = left + 'px';

  const top = (Data.Scroll.StartTop - Data.Pointer.Y + y).toFixed(0);
  Data.Svg.Node.style.top = top + 'px';

  if (Data.Edit.Node) Data.Edit.Node.classList.remove(SELECT_CLASS);
}

/** Translate the position of the current Edit Node with the transform
 *  attribute. */
function moveNodeByTransform(x, y) {
  if (!Data.Action.Active) {
    document.body.classList.add('moving');
    Data.Action.Type = Actions.Move;
    Data.Action.Active = true;
    Data.IgnoreClick = true;
    hasEdits(true);
  }

  Data.Edit.Transform.Translate.X = (x - Data.Pointer.X) / Data.Svg.RatioX;
  Data.Edit.Transform.Translate.Y = (y - Data.Pointer.Y) / Data.Svg.RatioY;

  updateTransform();
}

/** Rotate the current Edit Node. */
function rotateNodeByTransform(x, y) {
  if (!Data.Action.Active) {
    document.body.classList.add('rotating');
    Data.Action.Type = Actions.Rotate;
    Data.Action.Active = true;
    Data.IgnoreClick = true;
    hasEdits(true);
  }

  const dx = ((x - parseFloat(Data.Svg.Node.style.left)) / Data.Svg.RatioX) -
    Data.Edit.Transform.Translate.X;
  const dy = ((y - parseFloat(Data.Svg.Node.style.top)) / Data.Svg.RatioY) -
    Data.Edit.Transform.Translate.Y;

  Data.Edit.Transform.Rotate = Math.atan(dy / dx) * 180 / Math.PI;
  if (dx < 0) Data.Edit.Transform.Rotate += 180;

  updateTransform();
}

/** Scale the current Edit Node with the transform attribute. */
function resizeNodeByTransform(y) {
  if (!Data.Action.Active) {
    document.body.classList.add('resizing');
    Data.Action.Type = Actions.Resize;
    Data.Action.Active = true;
    Data.IgnoreClick = true;
    Data.Edit.Transform.StartScale = Data.Edit.Transform.Scale;
    hasEdits(true);
  }

  const maxDelta = Data.Pointer.Y;
  const minDelta = -window.innerHeight - Data.Pointer.Y;

  const scaleUp = (10.0 - Data.Edit.Transform.StartScale) / maxDelta;
  const scaleDown = (0.05 - Data.Edit.Transform.StartScale) / minDelta;

  let delta = Data.Pointer.Y - y;
  if (delta > maxDelta) delta = maxDelta;
  if (delta < minDelta) delta = minDelta;

  // if (Math.abs(delta) > 3) {
  Data.Edit.Transform.Scale = Data.Edit.Transform.StartScale +
    (delta * (delta > 0 ? scaleUp : scaleDown));
  updateTransform();
  // }
}

/** Resets the Transform Scale value to 1x. */
function resetScaleTransform() {
  Data.Edit.Transform.Scale = 1;
  updateTransform();
}

/** Steps through Transform Rotation values in stepSize increments. */
function stepRotationTransform(stepSize = 90) {
  const rotation = (Data.Edit.Transform.Rotate + stepSize) % 360;
  const stepMultiple = Math.floor(rotation / stepSize);
  Data.Edit.Transform.Rotate = stepMultiple * stepSize;
  updateTransform();
}

/** Handles pointer movement. */
function pointerMove(x, y, ctrlKey, shiftKey) {
  switch (Data.Edit.Mode) {
    case EditModes.Off: scrollMove(x, y); break;
    case EditModes.Highlight: scrollMove(x, y); break;

    case EditModes.Draw:
      switch (Data.Action.Type) {
        case Actions.Add: drawModePaint(x, y, ctrlKey, shiftKey); break;
        case Actions.Move: moveNodeByTransform(x, y); break;
        // case Actions.Rotate: rotateNodeByTransform(x, y); break;
        // case Actions.Resize: resizeNodeByTransform(y); break;
      }
      break;

    case EditModes.Text:
      switch (Data.Action.Type) {
        case Actions.Move: moveNodeByTransform(x, y); break;
        case Actions.Rotate: rotateNodeByTransform(x, y); break;
        case Actions.Resize: resizeNodeByTransform(y); break;
        default: scrollMove(x, y); break;
      }
      break;

    case EditModes.Image:
      switch (Data.Action.Type) {
        case Actions.Move: moveNodeByTransform(x, y); break;
        case Actions.Rotate: rotateNodeByTransform(x, y); break;
        case Actions.Resize: resizeNodeByTransform(y); break;
        default: scrollMove(x, y); break;
      }
      break;

    case EditModes.Link:
      scrollMove(x, y);
      break;

    case EditModes.Notes:
      scrollMove(x, y);
      break;
  }
}

/** Removes highlights from the target node. */
function removeHighlights(target) {
  const node = findHighlightTarget(target);
  if (!node) return;

  if (node.classList.contains(HIGH_CLASS_1)) {
    node.classList.remove(HIGH_CLASS_1);
    hasEdits(true);
  } else if (node.classList.contains(HIGH_CLASS_2)) {
    node.classList.remove(HIGH_CLASS_2);
    hasEdits(true);
  } else if (node.classList.contains(HIGH_CLASS_3)) {
    node.classList.remove(HIGH_CLASS_3);
    hasEdits(true);
  } else if (node.classList.contains(HIGH_CLASS_4)) {
    node.classList.remove(HIGH_CLASS_4);
    hasEdits(true);
  } else if (node.style.fill) {
    node.style.fill = '';
    hasEdits(true);
  }
}

/** Handles the eraser action for the target node. */
function eraserMove(target) {
  if (!Data.Action.Active) {
    document.body.classList.add('erasing');
    Data.Action.Type = Actions.Erase;
    Data.Action.Active = true;
    Data.IgnoreClick = true;
  }

  switch (Data.Edit.Mode) {
    case EditModes.Highlight:
      removeHighlights(target);
      break;

    case EditModes.Draw:
      if (target.classList.contains(DRAW_CLASS)) {
        target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Text:
      if (target.classList.contains(TEXT_CLASS)) {
        target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Image:
      if (target.classList.contains(IMAGE_CLASS)) {
        target.remove();
        hasEdits(true);
      }
      break;

    case EditModes.Link: break;

    case EditModes.Notes: break;
  }
}

/** Performs drag to scroll events for left button and ignores non-movement. */
function mouseMove(event) {
  if (!Data.Pointer.Moved) {
    if (Data.Pointer.X !== event.clientX || Data.Pointer.Y !== event.clientY) {
      Data.Pointer.Moved = true;
    } else {
      return;
    }
  }

  if (Data.Pointer.IgnoreMove) return;

  if (event.buttons === Mouse.Buttons.Left) {
    pointerMove(event.clientX, event.clientY, event.ctrlKey, event.shiftKey);
  } else if (event.buttons === Mouse.Buttons.Right &&
    Data.Edit.Mode !== EditModes.Off) {
    eraserMove(event.target);
  }
}

/** Timer fires regularly to act on zoom instructions, taking the action off
 *  the even listener. */
function zoomTimer() {
  if (!Data.Zoom.Trigger) return;
  Data.Zoom.Trigger = false;

  const prevWidth = parseFloat(Data.Svg.Node.style.width);
  const prevHeight = parseFloat(Data.Svg.Node.style.height);

  const newWidth = Data.Svg.StartWidth * Data.Zoom.Level / 100;
  const newHeight = Data.Svg.StartHeight * Data.Zoom.Level / 100;

  Data.Svg.Node.style.width = newWidth.toFixed(0) + 'px';
  Data.Svg.Node.style.height = newHeight.toFixed(0) + 'px';

  Data.Svg.RatioX = newWidth / Data.Svg.NativeWidth;
  Data.Svg.RatioY = newHeight / Data.Svg.NativeHeight;

  // Move the image keep it centred about the pointer position
  const originX = parseFloat(Data.Svg.Node.style.left);
  const originY = parseFloat(Data.Svg.Node.style.top);

  const scaleX = newWidth / prevWidth;
  const scaleY = newHeight / prevHeight;

  const relativeX = Data.Pointer.X - originX;
  const relativeY = Data.Pointer.Y - originY;

  const deltaX = (relativeX * scaleX) - relativeX;
  const deltaY = (relativeY * scaleY) - relativeY;

  const top = originY - deltaY;
  const left = originX - deltaX;

  Data.Svg.Node.style.top = top.toFixed(0) + 'px';
  Data.Svg.Node.style.left = left.toFixed(0) + 'px';
}

/** Apply the zoom step with checks and balances on limits and zoom level. */
function applyZoomStep(step) {
  // Use smaller step sizes when zoomed less than 100%
  if (Data.Zoom.Level < 100) {
    step = step / 4;
  } else if (Data.Zoom.Level === 100) {
    if (step < 0) {
      step = step / 4;
    }
  }

  Data.Zoom.Level += step;

  if (Data.Zoom.Level > 1000) Data.Zoom.Level = 1000;
  else if (Data.Zoom.Level < 10) Data.Zoom.Level = 10;

  Data.Zoom.Trigger = true;
}

/** Intercepts the mouse wheel event and uses it to zoom in/out on SVG (when
  * present). */
function wheelEvent(event) {
  if (modalVisible) {
    if (event.ctrlKey) event.preventDefault();
    return;
  }

  event.preventDefault();

  if (Data.Action.Active) return;
  if (Math.abs(event.deltaY) < 0.1) return;

  Data.Pointer.X = event.clientX;
  Data.Pointer.Y = event.clientY;

  applyZoomStep(event.deltaY > 0 ? -ZOOM_STEP_SIZE : ZOOM_STEP_SIZE);
}

/** Zoom based on a key press. */
function zoomKey(step) {
  Data.Pointer.X = window.innerWidth / 2;
  Data.Pointer.Y = window.innerHeight / 2;

  applyZoomStep(step);
}

/** Move the diagram coordinates to simulate a scroll based on the x and y
 *  step sizes supplied */
function scrollStep(x, y) {
  if (x !== 0) {
    const originX = parseFloat(Data.Svg.Node.style.left);
    const deltaX = window.innerHeight * x;
    const left = originX - deltaX;
    Data.Svg.Node.style.left = left.toFixed(0) + 'px';
  }
  if (y !== 0) {
    const originY = parseFloat(Data.Svg.Node.style.top);
    const deltaY = window.innerWidth * y;
    const top = originY - deltaY;
    Data.Svg.Node.style.top = top.toFixed(0) + 'px';
  }
}

/** Zoom in button pressed. */
function zoomInClick(event) {
  zoomKey(ZOOM_STEP_SIZE);
  event.preventDefault();
  document.activeElement.blur();
}

/** Zoom out button pressed. */
function zoomOutClick(event) {
  zoomKey(-ZOOM_STEP_SIZE);
  event.preventDefault();
  document.activeElement.blur();
}

/** Zoom reset button pressed. */
function zoomResetClick(event) {
  resizeSvg();
  event.preventDefault();
  document.activeElement.blur();
}

/** Act on key presses for zooming. */
function keyUpEvent(event) {
  if (event.target !== document.body) return;
  if (Data.Action.Active) return;

  switch (event.key) {
    case '+':
      zoomInClick(event);
      break;

    case '-':
      zoomOutClick(event);
      break;

    case '=':
      zoomResetClick(event);
      break;

    case 'ArrowUp':
      scrollStep(0, -SCROLL_STEP_SIZE);
      event.preventDefault();
      break;

    case 'ArrowDown':
      scrollStep(0, SCROLL_STEP_SIZE);
      event.preventDefault();
      break;

    case 'ArrowLeft':
      scrollStep(-SCROLL_STEP_SIZE, 0);
      event.preventDefault();
      break;

    case 'ArrowRight':
      scrollStep(SCROLL_STEP_SIZE, 0);
      event.preventDefault();
      break;

    case 'Enter':
      resetSvgPosition();
      event.preventDefault();
      break;

    case '1':
      setEditToolColour(Settings.Highlight1);
      break;

    case '2':
      setEditToolColour(Settings.Highlight2);
      break;

    case '3':
      setEditToolColour(Settings.Highlight3);
      break;

    case '4':
      setEditToolColour(Settings.Highlight4);
      break;

    case '5':
      setEditToolColour(Settings.Highlight5);
      break;

    case '6':
      setEditToolColour(Settings.Highlight6);
      break;

    case '7':
      setEditToolColour(Settings.Highlight7);
      break;

    case '8':
      setEditToolColour(Settings.Highlight8);
      break;

    case '9':
      setEditToolColour(Settings.Highlight9);
      break;

    case '0':
      setEditToolColour(Settings.Highlight0);
      break;
  }
}

/** Sets the current edit tool colour. */
function setEditToolColour(colour) {
  switch (Data.Edit.Mode) {
    case EditModes.Draw:
      document.getElementById('menu-draw-colour').value = colour;
      break;

    case EditModes.Highlight:
      document.getElementById('menu-highlight-colour').value = colour;
      break;

    case EditModes.Text:
      document.getElementById('menu-text-colour').value = colour;
      break;
  }
}

/** Handles the window size change event. Could be an orientation change. */
function windowResize() {
  resizeSvg();
  setMenuPosition();
}

/** Applies pinch zoom based on coordinates of two fingers. */
function pinchZoom(x1, y1, x2, y2) {
  const newDistance = Math.abs(x1 - x2) + Math.abs(y1 - y2);
  const delta = newDistance - Data.PinchZoom.Distance;
  if (Math.abs(delta) < 0.1) return;

  Data.IgnoreClick = true;

  // Centre the pointer position between the two pinch points.
  Data.Pointer.X = x1 + ((x2 - x1) / 2);
  Data.Pointer.Y = y1 + ((y2 - y1) / 2);

  applyZoomStep(delta);

  Data.PinchZoom.X1 = x1;
  Data.PinchZoom.Y1 = y1;
  Data.PinchZoom.X2 = x2;
  Data.PinchZoom.Y2 = y2;
  Data.PinchZoom.Distance = newDistance;
}

/** Handles the touch start event for either 1 or 2 finger touch events. */
function touchStart(event) {
  if (Data.Pointer.TouchCount === 0 && event.touches.length === 1) {
    // 0 -> 1 touch transition

    Data.IgnoreClick = false;
    Data.Pointer.IgnoreMove = true;

    pointerDown(
      event.touches[0].target,
      event.touches[0].clientX,
      event.touches[0].clientY,
      event.ctrlKey,
      event.shiftKey);

    Data.Pointer.TouchCount = 1;
  } else if (Data.Pointer.TouchCount < 2 && event.touches.length === 2) {
    // 0 or 1 -> 2 touches transition

    Data.IgnoreClick = false;

    // 1 -> 2 touches transition
    if (Data.Pointer.TouchCount === 1) {
      pointerUp(event);
    }

    Data.PinchZoom.X1 = event.touches[0].clientX;
    Data.PinchZoom.Y1 = event.touches[0].clientY;
    Data.PinchZoom.X2 = event.touches[1].clientX;
    Data.PinchZoom.Y2 = event.touches[1].clientY;
    Data.PinchZoom.Distance =
      Math.abs(Data.PinchZoom.X1 - Data.PinchZoom.X2) +
      Math.abs(Data.PinchZoom.Y1 - Data.PinchZoom.Y2);

    Data.Pointer.TouchCount = 2;
  } else if (Data.Pointer.TouchCount !== 0) {
    // Any other touch count transition
    pointerUp(event);
  }
}

/** Handles the touch move event. */
function touchMove(event) {
  event.preventDefault();

  if (modalVisible) return;

  if (Data.Pointer.IgnoreMove) return;

  if (event.touches.length === 1 && Data.Pointer.TouchCount === 1) {
    pointerMove(
      event.touches[0].clientX,
      event.touches[0].clientY,
      event.ctrlKey,
      event.shiftKey);
  } else if (event.touches.length === 2 && Data.Pointer.TouchCount === 2) {
    pinchZoom(
      event.touches[0].clientX,
      event.touches[0].clientY,
      event.touches[1].clientX,
      event.touches[1].clientY);
  }
}

/** Handles the touch end and mouse up events. */
function pointerUp() {
  if (Data.Action.Active) {
    document.body.classList.remove('moving');
    document.body.classList.remove('drawing');
    document.body.classList.remove('erasing');
    document.body.classList.remove('resizing');
    document.body.classList.remove('rotating');
    document.body.classList.remove('scrolling');

    Data.Action.Active = false;
  }

  if (Data.Edit.Node && Data.IgnoreClick) {
    Data.Edit.Node.classList.remove(SELECT_CLASS);
  }

  Data.Pointer.TouchCount = 0;
}

/** Register the SVG related event handlers. */
function registerEventHandlers() {
  // SVG Click event
  Data.Svg.Node.addEventListener('click', clickSvgEvent);

  // Capture right click / other click event
  window.addEventListener('auxclick', auxClickEvent);

  // Mouse actions for scrolling, drawing, and moving text
  window.addEventListener('mousedown', mouseDown);
  window.addEventListener('mouseup', pointerUp);
  window.addEventListener('mousemove', mouseMove);

  // Touch actions for scrolling, drawing, and moving text
  window.addEventListener("touchstart", touchStart);
  window.addEventListener("touchend", pointerUp);
  window.addEventListener("touchmove", touchMove);

  // Key presses for zooming / reset zoom
  window.addEventListener('keyup', keyUpEvent);

  // Listen for the scroll wheel for zooming
  window.addEventListener('wheel', wheelEvent, { passive: false });
  // Data.Svg.Node.addEventListener('wheel', wheelEvent, { passive: false });

  // Detect window resize events (coud be an orientation change!)
  window.addEventListener('resize', windowResize);

  // File selector for uploading images
  document.getElementById('file-selector').
    addEventListener('change', fileSelectorUploadEvent);

  // Setup zoom buttons
  document.getElementById('menu-zoom-in').
    addEventListener('click', zoomInClick);

  document.getElementById('menu-zoom-out').
    addEventListener('click', zoomOutClick);

  document.getElementById('menu-zoom-reset').
    addEventListener('click', zoomResetClick);

  // Setup timer function for zooming actions outside the event listener
  setInterval(zoomTimer, 100);
}

/** Handles the user clicking the menu Flag item. */
function flagClick() {
  const flagIndex = Data.Flags.indexOf(Data.Filename);
  if (flagIndex !== -1) {
    Data.Flags.splice(flagIndex, 1);
  } else {
    Data.Flags.push(Data.Filename);
  }

  localStorage.setItem(StoreName.Flags, JSON.stringify(Data.Flags));

  updateMenuFlag();

  document.activeElement.blur();
}

/** Load IsFlagged diagrms list from local storage. */
function loadFlags() {
  const flagsJSON = localStorage.getItem(StoreName.Flags);
  if (flagsJSON) {
    const flags = JSON.parse(flagsJSON);
    if (flags) {
      Data.Flags = flags;
    }
  }
}

/** Read the filter values from the existing filter style on the SVG tag. */
function readFilterValuesfromSvg() {
  const filters = Data.Svg.Node.style.filter;
  if (filters === '') return false;

  const bIndex = filters.indexOf('brightness');
  const cIndex = filters.indexOf('contrast');
  const hIndex = filters.indexOf('hue-rotate');
  const sIndex = filters.indexOf('saturate');

  const bString = getStringBetween(filters, bIndex, '(', ')');
  const cString = getStringBetween(filters, cIndex, '(', ')');
  const hString = getStringBetween(filters, hIndex, '(', 'deg');
  const sString = getStringBetween(filters, sIndex, '(', ')');

  if (bString) Data.Controls.Brightness.value = bString * 10;
  if (cString) Data.Controls.Contrast.value = cString * 10;
  if (hString) Data.Controls.Hue.value = hString;
  if (sString) Data.Controls.Saturation.value = sString * 10;

  return true;
}

/** Update the SVG filter CSS based on changes to the image controls. */
function filterChange() {
  Data.Svg.Node.style.filter = getFiltersCss(
    Data.Controls.Brightness.value,
    Data.Controls.Contrast.value,
    Data.Controls.Hue.value,
    Data.Controls.Saturation.value);
}

/** Handles the user clicking the image controls menu reset button. */
function imageControlsResetClick() {
  Data.Controls.Brightness.value = Data.Controls.Brightness.defaultValue;
  Data.Controls.Contrast.value = Data.Controls.Contrast.defaultValue;
  Data.Controls.Hue.value = Data.Controls.Hue.defaultValue;
  Data.Controls.Saturation.value = Data.Controls.Saturation.defaultValue;

  filterChange();

  document.activeElement.blur();
}

/** Handles the user clicking the image controls menu save button. */
function imageControlsSaveClick() {
  Settings.Filters.Brightness = Data.Controls.Brightness.value;
  Settings.Filters.Contrast = Data.Controls.Contrast.value;
  Settings.Filters.Hue = Data.Controls.Hue.value;
  Settings.Filters.Saturation = Data.Controls.Saturation.value;

  saveSettings();

  Data.Controls.Open = false;
  setControlsPosition();

  document.activeElement.blur();
}

/** Sets the image controls panel position based on Data.Controls.Open. */
function setControlsPosition() {
  const menu = document.getElementById('menu');
  const panel = document.getElementById('image-controls');

  const top = Data.Controls.Open ? menu.clientHeight : -panel.clientHeight - 2;
  panel.style.top = top + 'px';

  if (Data.Controls.Open)
    document.getElementById('menu-controls').classList.add('active');
  else
    document.getElementById('menu-controls').classList.remove('active');
}

/** Set values and attach event listeners to image control elements. */
function setupImageControls() {
  Data.Controls.Brightness = document.getElementById('brightness');
  Data.Controls.Contrast = document.getElementById('contrast');
  Data.Controls.Hue = document.getElementById('hue');
  Data.Controls.Saturation = document.getElementById('saturation');

  Data.Controls.Brightness.value = Settings.Filters.Brightness;
  Data.Controls.Contrast.value = Settings.Filters.Contrast;
  Data.Controls.Hue.value = Settings.Filters.Hue;
  Data.Controls.Saturation.value = Settings.Filters.Saturation;

  Data.Controls.Brightness.addEventListener('input', filterChange);
  Data.Controls.Contrast.addEventListener('input', filterChange);
  Data.Controls.Hue.addEventListener('input', filterChange);
  Data.Controls.Saturation.addEventListener('input', filterChange);

  document.getElementById('image-controls-reset').
    addEventListener('click', imageControlsResetClick);
  document.getElementById('image-controls-save').
    addEventListener('click', imageControlsSaveClick);
}

/** Sets the edit menu panel position based on Data.Edit.Open. */
function setEditMenuPosition() {
  const menu = document.getElementById('menu');
  const panel = document.getElementById('edit-controls');

  const top = Data.Edit.Open ? menu.clientHeight : -panel.clientHeight - 2;
  panel.style.top = top + 'px';

  if (Data.Edit.Open)
    document.getElementById('menu-edit').classList.add('active');
  else
    document.getElementById('menu-edit').classList.remove('active');
}

/** Updates the visual state of the menu flag button based on IsFlagged. */
function updateMenuFlag() {
  const menuFlag = document.getElementById('menu-flag');
  if (menuFlag) {
    if (Data.Flags.includes(Data.Filename)) {
      menuFlag.title = 'Remove flag';
      menuFlag.className = 'flagged';
    } else {
      menuFlag.title = 'Flag this diagram';
      menuFlag.className = 'unflagged';
    }
  }
}

/** Enable or Disable the menu download buttons depending on online status. */
function updateDownloadButtonState() {
  const menuDownloadPdf = document.getElementById('menu-download-pdf');
  const menuDownloadPng = document.getElementById('menu-download-png');

  if (navigator.onLine) {
    if (menuDownloadPdf) menuDownloadPdf.disabled = false;
    if (menuDownloadPng) menuDownloadPng.disabled = false;
  } else {
    if (menuDownloadPdf) menuDownloadPdf.disabled = true;
    if (menuDownloadPng) menuDownloadPng.disabled = true;
  }
}

/** Update tehe edit menu items according to the current mode. */
function updateEditMenu() {
  Data.Svg.Node.classList.remove('draw-mode');
  Data.Svg.Node.classList.remove('highlight-mode');
  Data.Svg.Node.classList.remove('text-mode');
  Data.Svg.Node.classList.remove('image-mode');
  Data.Svg.Node.classList.remove('link-mode');
  Data.Svg.Node.classList.remove('notes-mode');

  document.getElementById('menu-highlight-box').classList.remove('active');
  document.getElementById('menu-draw-box').classList.remove('active');
  document.getElementById('menu-text-box').classList.remove('active');
  document.getElementById('menu-image-box').classList.remove('active');
  document.getElementById('menu-link-box').classList.remove('active');
  document.getElementById('menu-notes-box').classList.remove('active');

  switch (Data.Edit.Mode) {
    case EditModes.Draw:
      Data.Svg.Node.classList.add('draw-mode');
      document.getElementById('menu-draw-box').classList.add('active');
      break;

    case EditModes.Highlight:
      Data.Svg.Node.classList.add('highlight-mode');
      document.getElementById('menu-highlight-box').classList.add('active');
      break;

    case EditModes.Text:
      Data.Svg.Node.classList.add('text-mode');
      document.getElementById('menu-text-box').classList.add('active');
      break;

    case EditModes.Image:
      Data.Svg.Node.classList.add('image-mode');
      document.getElementById('menu-image-box').classList.add('active');
      break;

    case EditModes.Link:
      Data.Svg.Node.classList.add('link-mode');
      document.getElementById('menu-link-box').classList.add('active');
      break;

    case EditModes.Notes:
      Data.Svg.Node.classList.add('notes-mode');
      document.getElementById('menu-notes-box').classList.add('active');
      break;
  }
}

/** Updates all data on the Menu elements. */
function updateMenu() {
  const menuExportSvg = document.getElementById('menu-export-svg');
  const menuExportPng = document.getElementById('menu-export-png');
  const menuDownloadPdf = document.getElementById('menu-download-pdf');
  const menuDownloadPng = document.getElementById('menu-download-png');

  if (Data.Edit.Mode === EditModes.Off) {
    Data.Svg.Node.classList.remove('edit-mode');

    if (!Data.IsSavedDiagram) {
      if (menuExportSvg) menuExportSvg.style.display = 'none';
      if (menuExportPng) menuExportPng.style.display = 'none';
    }

    if (menuDownloadPdf) menuDownloadPdf.style.display = 'inline-block';
    if (menuDownloadPng) menuDownloadPng.style.display = 'inline-block';

    updateDownloadButtonState();
  } else {
    Data.Svg.Node.classList.add('edit-mode');

    if (!Data.IsSavedDiagram) {
      if (menuExportSvg) menuExportSvg.style.display = 'inline-block';
      if (menuExportPng) menuExportPng.style.display = 'inline-block';
    }

    if (menuDownloadPdf) menuDownloadPdf.style.display = 'none';
    if (menuDownloadPng) menuDownloadPng.style.display = 'none';
  }

  updateEditMenu();

  document.activeElement.blur();
}

/** Sets the menu position, grip title, and grip graphic based on
 *  Data.Menu.Open. */
function setMenuPosition() {
  const menu = document.getElementById('menu');
  const grip = document.getElementById('menu-grip');

  if (Data.Menu.Open) {
    grip.title = 'Close menu';
    grip.className = 'close';

    if (window.innerWidth < 450) {
      menu.style.left = 0;
      menu.style.borderLeft = 'none';
      menu.style.borderRadius = 0;
      menu.style.width = '100vw';
    } else {
      menu.style.removeProperty('left');
      menu.style.removeProperty('border-left');
      menu.style.removeProperty('border-radius');
      menu.style.removeProperty('width');
    }

    menu.style.right = 0;
  } else {
    grip.title = 'Open menu';
    grip.className = 'open';

    if (window.innerWidth < 450) {
      menu.style.removeProperty('left');
      menu.style.removeProperty('border-left');
      menu.style.removeProperty('border-radius');
      menu.style.removeProperty('width');
    }

    const offset = menu.clientWidth - grip.clientWidth - 8;
    menu.style.right = -offset + 'px';
  }
}

/** User clicked the menu grip, toggling the Data.Menu.Open state and
 * redrawing the menu. */
function gripClick() {
  Data.Menu.Open = !Data.Menu.Open;
  setMenuPosition();

  if (!Data.Menu.Open && Data.Controls.Open) {
    Data.Controls.Open = false;
    setControlsPosition();
  }

  if (!Data.Menu.Open && Data.Edit.Open) {
    Data.Edit.Open = false;
    setEditMenuPosition();

    Data.Edit.LastMode = Data.Edit.Mode;
    Data.Edit.Mode = EditModes.Off;
    updateMenu();
  }

  document.activeElement.blur();
}

/** Handles the user clicking the menu edit item. */
function menuEditClick() {
  Data.Edit.Open = !Data.Edit.Open;
  setEditMenuPosition();

  if (Data.Edit.Open && Data.Controls.Open) {
    Data.Controls.Open = false;
    setControlsPosition();
  }

  if (Data.Edit.Open) {
    if (Data.Edit.LastMode) {
      Data.Edit.Mode = Data.Edit.LastMode;
    }
  } else {
    Data.Edit.LastMode = Data.Edit.Mode;
    Data.Edit.Mode = EditModes.Off;
  }
  updateMenu();
}

/** Handles the user clicking the highlight edit menu item. */
function menuHighlightClick() {
  Data.Edit.Mode = EditModes.Highlight;
  updateEditMenu();
  document.activeElement.blur();
}

/** Handles the user clicking the draw edit menu item. */
function menuDrawClick() {
  Data.Edit.Mode = EditModes.Draw;
  updateEditMenu();
  document.activeElement.blur();
}

/** Handles the user clicking the text edit menu item. */
function menuTextClick() {
  Data.Edit.Mode = EditModes.Text;
  updateEditMenu();
  document.activeElement.blur();
}

/** Handles the user clicking the highlight edit menu colour item. */
function menuHighlightColourClick() {
  Data.Edit.Mode = EditModes.Highlight;
  updateEditMenu();
}

/** Handles the user clicking the draw edit menu colour item. */
function menuDrawColourClick() {
  Data.Edit.Mode = EditModes.Draw;
  updateEditMenu();
}

/** Handles the user clicking the text edit menu colour item. */
function menuTextColourClick() {
  Data.Edit.Mode = EditModes.Text;
  updateEditMenu();
}

/** Handles the user clicking the image edit menu item. */
function menuImageClick() {
  Data.Edit.Mode = EditModes.Image;
  updateMenu();
}

/** Handles the user clicking the link edit menu item. */
function menuLinkClick() {
  Data.Edit.Mode = EditModes.Link;
  updateMenu();
}

/** Handles the user clicking the tooltip edit menu item. */
function menuTooltipClick() {
  Data.Edit.Mode = EditModes.Notes;
  updateMenu();
}

/** Handles the user clicking the menu Controls item. */
function menuControlsClick() {
  Data.Controls.Open = !Data.Controls.Open;
  setControlsPosition();

  if (Data.Controls.Open && Data.Edit.Open) {
    Data.Edit.Open = false;
    setEditMenuPosition();

    Data.Edit.LastMode = Data.Edit.Mode;
    Data.Edit.Mode = EditModes.Off;
    updateMenu();
  }

  document.activeElement.blur();
}

/** Save current SVG to local storage using title and key supplied. */
function saveSvg(title, storageKey) {
  const svgXml = getSvgXml();
  const svgObject = { Title: title, SvgXml: svgXml };
  const jsonData = JSON.stringify(svgObject);
  localStorage.setItem(storageKey, jsonData);
  hasEdits(false);
}

/** Handle the OK outcome on the Save Modal Prompt. */
function saveOK(callback) {
  let diagramTitle = getModalInputText();
  if (diagramTitle) diagramTitle = diagramTitle.trim();
  if (diagramTitle) {
    const storageKey = Date.now().toString();
    saveSvg(diagramTitle, storageKey);

    if (callback) {
      callback();
    } else {
      window.location.href = `/viewsvg.htm#*${storageKey}`;
    }
  }
}

/** Handles the Yes outcome on the Overwrite Modal Confirm. */
function overwriteYes(callback) {
  saveSvg(Data.SavedDiagramTitle, Data.Filename);
  if (callback) callback();
}

/** Handles the No outcome on the Overwrite Modal Confirm. */
function overwriteNo(okCallback, cancelCallback) {
  showModalDialog('Save diagram as',
    true, Data.SavedDiagramTitle,
    'OK', () => saveOK(okCallback),
    undefined, undefined,
    'Cancel', cancelCallback);
}

/** Called if a request to save is cancelled. */
function saveCancel() {
  document.activeElement.blur();
}

/** Process the request to save the diagram. */
function requestSave(yesCallback) {
  if (Data.IsSavedDiagram) {
    showModalDialog(`Overwrite existing diagram "${Data.SavedDiagramTitle}"?`,
      false, undefined,
      'Yes', () => overwriteYes(yesCallback),
      'No', () => overwriteNo(yesCallback),
      'Cancel', saveCancel);
  } else {
    const diagramNameElement = document.getElementById('diagram-name');
    const diagramName = diagramNameElement ?
      diagramNameElement.textContent : decodeURIComponent(Data.Filename);
    showModalDialog('Save diagram as',
      true, diagramName,
      'OK', () => saveOK(yesCallback),
      undefined, undefined,
      'Cancel', saveCancel);
  }
}

/** Handles the user clicking the menu Save item. */
function menuSaveClick() {
  requestSave();
}

/** Handles the user clicking the menu Export SVG item. */
function exportSvgClick() {
  const filename = Data.IsSavedDiagram ?
    Data.SavedDiagramTitle :
    decodeURIComponent(Data.Filename);

  const svgXml = getSvgXml();
  exportSvg(filename + '.svg', svgXml);

  document.activeElement.blur();
}

/** Handles the user clicking the menu Export PNG item. */
function exportPngClick() {
  const filename = Data.IsSavedDiagram ?
    Data.SavedDiagramTitle :
    decodeURIComponent(Data.Filename);

  const svgXml = getSvgXml();
  const background = window.getComputedStyle(document.body).backgroundColor;
  exportPng(filename + '.png', svgXml, background);

  document.activeElement.blur();
}

/** Handles the user clicking the menu back button. */
function backClick() {
  if (Data.Edit.HasEdits) {
    showModalDialog(
      'Would you like to save your changes before leaving the page?',
      false, undefined,
      'Yes', () => requestSave(backOrHome),
      'No', backOrHome,
      'Cancel', undefined);
  } else {
    backOrHome();
  }
}

/** Attaches event listeners and sets the initial menu state. */
function setupMenu() {
  document.getElementById('menu-grip').
    addEventListener('click', gripClick);

  document.getElementById('menu-back').
    addEventListener('click', backClick);

  document.getElementById('menu-edit').
    addEventListener('click', menuEditClick);

  document.getElementById('menu-highlight').
    addEventListener('click', menuHighlightClick);
  document.getElementById('menu-highlight-colour').
    addEventListener('click', menuHighlightColourClick);
  document.getElementById('menu-highlight-colour').value = Settings.Highlight1;

  document.getElementById('menu-draw').
    addEventListener('click', menuDrawClick);
  document.getElementById('menu-draw-colour').
    addEventListener('click', menuDrawColourClick);
  document.getElementById('menu-draw-colour').value = Settings.Highlight2;

  document.getElementById('menu-text').
    addEventListener('click', menuTextClick);
  document.getElementById('menu-text-colour').
    addEventListener('click', menuTextColourClick);
  document.getElementById('menu-text-colour').value = Settings.Highlight3;

  document.getElementById('menu-image').
    addEventListener('click', menuImageClick);

  document.getElementById('menu-link').
    addEventListener('click', menuLinkClick);

  document.getElementById('menu-notes').
    addEventListener('click', menuTooltipClick);

  document.getElementById('menu-controls').
    addEventListener('click', menuControlsClick);

  document.getElementById('menu-save').
    addEventListener('click', menuSaveClick);

  document.getElementById('menu-export-svg').
    addEventListener('click', exportSvgClick);

  document.getElementById('menu-export-png').
    addEventListener('click', exportPngClick);

  const menuFlag = document.getElementById('menu-flag');
  if (menuFlag) menuFlag.addEventListener('click', flagClick);

  const menuDownloadPdf = document.getElementById('menu-download-pdf');
  if (menuDownloadPdf) {
    menuDownloadPdf.addEventListener('click',
      () => document.getElementById('download-pdf').click());
  }

  const menuDownloadPng = document.getElementById('menu-download-png');
  if (menuDownloadPng) {
    menuDownloadPng.addEventListener('click',
      () => document.getElementById('download-png').click());
  }

  Data.Menu.Open = (Settings.Menu === 'Open');
}

/** Detect a legacy diagram URL and redirect the user to the new page. */
function legacyRedirect() {
  let indexOf = window.location.href.indexOf('#');
  if (indexOf === -1) {
    indexOf = window.location.href.indexOf('=');
  }
  if (indexOf === -1 || indexOf === window.location.href.length - 1) {
    return false;
  }
  if (window.location.href[indexOf + 1] === '*') {
    return false;
  }

  const redirect = window.location.origin + '/' +
    window.location.href.substring(indexOf + 1) + '.htm';

  location.replace(redirect);

  return true;
}

/** Loads the saved diagram referenced in the URL hash. */
function loadSavedDiagram() {
  if (!window.location.hash || window.location.hash.length <= 2) {
    showModalDialog('Missing saved diagram details',
      false, undefined,
      'OK', Data.IsComparing ? undefined : backOrHome);

    return false;
  }

  // Trim '#*' and '/compare'
  if (Data.IsComparing) {
    Data.Filename = window.location.hash.slice(2, -8);
  } else {
    Data.Filename = window.location.hash.substring(2);
  }

  const json = localStorage.getItem(Data.Filename);
  if (!json) {
    showModalDialog('Failed to locate saved diagram',
      false, undefined,
      'OK', Data.IsComparing ? undefined : backOrHome);

    return false;
  }

  const data = JSON.parse(json);
  if (!data || !data.SvgXml) {
    showModalDialog('Failed to process saved diagram data',
      false, undefined,
      'OK', Data.IsComparing ? undefined : backOrHome);

    return false;
  }

  Data.SavedDiagramTitle = data.Title;
  document.title = `Saved Diagram: ${data.Title} | M365 Insights`;

  const svgXml = data.SvgXml.
    replace(/<!--.*-->/i, '').
    replace(/<\?xml.*\?>/i, '').
    replace(/<!doctype.*>/i, '').
    replace(/^[\n\r]+/, '');

  Data.Svg.Node = createElementFromHtml(svgXml);
  document.body.appendChild(Data.Svg.Node);

  return true;
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  setupModal();

  if (Data.IsComparing) {
    document.body.style.overflow = 'hidden';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('edit-controls').style.display = 'none';
    document.getElementById('image-controls').style.display = 'none';
    document.getElementById('zoom-controls').style.display = 'none';
  } else {
    setupMenu();

    window.addEventListener('offline', updateDownloadButtonState);
    window.addEventListener('online', updateDownloadButtonState);

    if (!Data.IsSavedDiagram) {
      loadFlags();

      // Remove leading '/' and trailing '.htm'
      Data.Filename = window.location.pathname.slice(1, -4);
    }
  }

  setupImageControls();
}

/** Page Load event handler. */
function pageLoad() {
  if (Data.IsSavedDiagram) {
    const loaded = loadSavedDiagram();
    if (!loaded) return;
  } else {
    Data.Svg.Node = document.getElementsByTagName('svg').item(0);
  }

  Data.Svg.NativeWidth = parseFloat(Data.Svg.Node.getAttribute('width'));
  Data.Svg.NativeHeight = parseFloat(Data.Svg.Node.getAttribute('height'));

  resizeSvg();
  injectHighlightStyles();

  const hasFilters = readFilterValuesfromSvg();
  if (!hasFilters) filterChange();

  if (!Data.IsComparing) {
    updateMenu();
    updateMenuFlag();
    setMenuPosition();
    setControlsPosition();
  }

  registerEventHandlers();

  Data.Svg.Node.style.display = 'inline';
}

Data.IsComparing = window.location.hash.endsWith('/compare');
Data.IsSavedDiagram = (window.location.pathname === '/viewsvg.htm');

let redirecting = false;
if (Data.IsSavedDiagram) {
  redirecting = legacyRedirect();
}

if (!redirecting) {
  document.addEventListener('DOMContentLoaded', DOMContentLoaded);
  window.addEventListener('load', pageLoad);
}
