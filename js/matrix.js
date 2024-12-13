/// <reference path="common.js" />
/* global isEmbedded */

// Variables
let TriggerSearch = false;

// Constants
const DIAGRAM_COUNT = 21;
const DIAGRAM_GROUPS = [3, 3, 5, 4, 6];
const EXPORT_FILENAME = 'Microsoft-365-Matrix-Export.xls';

/** Toggle the Trigger Search variable when a Key Up event occurs. */
function searchKeyUp() {
  TriggerSearch = true;
}

/** Update the row visibility based on search text. */
function applySearch() {
  const search =
    document.getElementById('feature-search').value.toUpperCase();

  let inGroup = false;

  const rows = document.querySelectorAll('tr');
  for (const row of rows) {
    // Detect header row by partial match of on of the sticky-row-x classes.
    const isHeaderRow = (row.className.indexOf('sticky-row') !== -1);
    if (isHeaderRow) {
      inGroup = false;
    } else {
      const cell = row.getElementsByTagName('td')[0];
      if (cell) {
        // Find the end of the current group match
        if (inGroup && cell.className.indexOf('indent') == -1) {
          inGroup = false;
        }

        const featureName = cell.textContent || cell.innerText;
        if (featureName.toUpperCase().includes(search) || inGroup) {
          // row.style.display = 'table-row';
          row.classList.remove('hidden');

          // If the match is on a group header keep the features under this
          // group visible
          if (cell.className.indexOf('group') !== -1) {
            inGroup = true;
          }
        } else {
          // row.style.display = 'none';
          row.classList.add('hidden');
        }
      }
    }
  }
}

/** Timer periodically fires to update the row visibility in response to
 *  search text changes. */
function searchTimer() {
  if (!TriggerSearch) return;
  TriggerSearch = false;

  applySearch();
}

/** Set up the feature search box and action functions. */
function setupFeatureSearch() {
  document.getElementById('feature-search').
    addEventListener('keyup', searchKeyUp);
}

/** Count the selected columns within the given group. This is used to
 *  determine license type header visibility when filtering columns. */
function countInGroup(group, all) {
  let count = 0;
  let start = 0;

  for (let i = 0; i < DIAGRAM_GROUPS.length; i += 1) {
    if (i === group) {
      const end = start + DIAGRAM_GROUPS[i];
      for (let allIndex = start; allIndex < end; allIndex += 1) {
        if (all[allIndex]) {
          count += 1;
        }
      }
      return count;
    }

    start += DIAGRAM_GROUPS[i];
  }

  return -1;
}

/** Get an array of booleans represented the state of each license checkbox. */
function getSelectedCheckboxes() {
  const selected = new Array(DIAGRAM_COUNT);

  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  for (const checkbox of checkboxes) {
    selected[checkbox.value] = checkbox.checked;
  }

  return selected;
}

/** Set the checked status of each checkbox based on an array of booleans. */
function setSelectedCheckboxes(selected) {
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  for (const checkbox of checkboxes) {
    checkbox.checked = selected[checkbox.value];
  }
}

/** Find the group that corresponds with a license column number. */
function findGroup(find, groups) {
  let total = 0;
  for (let index = 0; index < groups.length; index += 1) {
    total += groups[index];
    if (find < total) return index;
  }
  return -1;
}

/** Show only the selected feature columns based on the array of booleans.
 *  Hide any rows that no longer have a visible feature. */
function showColumns(selected) {
  const noneSelected = selected.every(value => !value);

  const rows = document.querySelectorAll('tr');
  for (let row = 0; row < rows.length; row += 1) {
    const tr = rows[row];

    let emptyRow = false;
    let cells = null;

    if (row === 0) {
      cells = tr.getElementsByTagName('th');

      for (let col = 1; col < cells.length; col += 1) {
        const cell = cells[col];

        const count = countInGroup(col - 1, selected);
        if (count > 0) {
          cell.classList.remove('hidden');
        } else {
          cell.classList.add('hidden');
        }
        cell.setAttribute('colspan', count);
      }
    } else {
      const isGroupHeaderRow = (tr.className.indexOf('sticky-row-3') !== -1);

      if (row === 1 || isGroupHeaderRow) {
        cells = tr.getElementsByTagName('th');
      } else {
        cells = tr.getElementsByTagName('td');
        // Only look for empty feature rows (denoted by the use of TD tags).
        // If none selected then don't hide any rows.
        emptyRow = !noneSelected;
      }

      if (isGroupHeaderRow) emptyRow = false;

      for (let col = 1; col < cells.length; col += 1) {
        const cell = cells[col];

        if (selected[col - 1]) {
          cell.classList.remove('hidden');

          if (cell.textContent !== '') {
            emptyRow = false;
          }
        } else {
          cell.classList.add('hidden');
        }
      }

      if (emptyRow) {
        tr.classList.add('hidden');
      } else {
        tr.classList.remove('hidden');
      }
    }
  }

  if (document.getElementById('feature-search').value !== '') {
    applySearch();
  }
}

/** Updated selection of license types when hash changes. */
function hashChanged() {
  const selected = new Array(DIAGRAM_COUNT);
  selected.fill(true);

  let hash = window.location.hash.substring(1);

  const allSelected = Array.from(hash).every(value => (value === '1'));
  if (!allSelected) {
    // Pad bookmarked selections from previous site versions:
    if (hash.length === 18) {
      hash = hash[0] + '00' + hash.slice(1, -4) + '0' + hash.slice(-4);
    }

    if (hash.length === DIAGRAM_COUNT) {
      for (let index = 0; index < hash.length; index += 1) {
        selected[index] = (hash[index] === '1');
      }
    }
  }

  setSelectedCheckboxes(selected);
  showColumns(selected);
}

/** Listen for checboxes changing state. */
function checkboxChanged() {
  const selected = getSelectedCheckboxes();

  let newHash = '#';
  for (const select of selected) {
    newHash += (select ? '1' : '0');
  }

  window.location.hash = newHash;
}

/** Add event listeners to all checkboxes. */
function setupCheckboxes() {
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  for (const checkbox of checkboxes) {
    checkbox.addEventListener('change', checkboxChanged);
  }
}

/** Select all checkboxes. */
function selectAll() {
  const newHash = '#' + '1'.repeat(DIAGRAM_COUNT);
  window.location.hash = newHash;
}

/** Remove all selected checkboxes. */
function selectNone() {
  const newHash = '#' + '0'.repeat(DIAGRAM_COUNT);
  window.location.hash = newHash;
}

/** Save the current selection for default page load use. */
function selectSave() {
  const selected = getSelectedCheckboxes();

  let savedHash = '#';
  for (const select of selected) {
    savedHash += (select ? '1' : '0');
  }

  localStorage.setItem(StoreName.MatrixSelection, savedHash);

  showModalDialog(
    `Selection saved.<br/><br/>
    When you return your selection will be applied automatically.`,
    false, undefined, 'OK');
}

/** Generates and downloads a spreadsheet from the current matrix view. */
function exportClick() {
  const table = document.getElementById('features-table').cloneNode(true);

  // Remove search text box from export
  const filter = table.querySelector('#feature-search');
  if (filter.value !== '') {
    filter.parentNode.innerText = 'Feature filter: ' + filter.value;
  } else {
    filter.remove();
  }

  // Remove all hidden cells
  const hidden = table.getElementsByClassName('hidden');
  Array.from(hidden).forEach(item => item.remove());

  // Fix indents
  const indent1 = table.getElementsByClassName('indent1');
  Array.from(indent1).forEach(item => {
    item.insertAdjacentText('afterBegin', '> ');
  });
  const indent2 = table.getElementsByClassName('indent2');
  Array.from(indent2).forEach(item => {
    item.insertAdjacentText('afterBegin', '> > ');
  });

  // Centre align feature columns
  const featureCells = table.querySelectorAll('td:not(:first-of-type)');
  Array.from(featureCells).forEach(item => {
    item.style.textAlign = 'center';
  });

  // Left align first column
  const first = table.querySelectorAll('th:first-of-type, td:first-of-type');
  Array.from(first).forEach(item => {
    item.style.textAlign = 'left';
  });

  // Colour the office, ems, windows, and suite section headers
  const office = table.querySelectorAll('.office>th, .office>td');
  Array.from(office).forEach(item => {
    item.style.backgroundColor = '#E82200';
    item.style.color = '#FFFFFF';
  });
  const ems = table.querySelectorAll('.ems>th, .ems>td');
  Array.from(ems).forEach(item => {
    item.style.backgroundColor = '#2080A0';
    item.style.color = '#FFFFFF';
  });
  const windows = table.querySelectorAll('.windows>th, .windows>td');
  Array.from(windows).forEach(item => {
    item.style.backgroundColor = '#006600';
    item.style.color = '#FFFFFF';
  });
  const suite = table.querySelectorAll('.suite>th, .suite>td');
  Array.from(suite).forEach(item => {
    item.style.backgroundColor = '#7030A0';
    item.style.color = '#FFFFFF';
  });

  const html = '<html><head><base href="https://m365insights.org/"></head><body>' +
    table.outerHTML + '</body></html>';

  const blob = new Blob(['\ufeff', html], {
    type: 'application/vnd.ms-excel'
  });

  downloadBlob(EXPORT_FILENAME, blob);
}

/** Attach event listeners on buttons. */
function setupButtons() {
  document.getElementById('button-all').addEventListener('click', selectAll);
  document.getElementById('button-none').addEventListener('click', selectNone);
  document.getElementById('button-save').addEventListener('click', selectSave);

  document.getElementById('button-export').
    addEventListener('click', exportClick);
}

/** Checks for the lack of a page hash and injects the saved hash. */
function applySavedSelectionHash() {
  if (window.location.hash === '') {
    const savedHash = localStorage.getItem(StoreName.MatrixSelection);
    if (savedHash) {
      window.location.hash = savedHash;
    }
  }
}

/** DOM Content Loaded event handler. */
function DOMContentLoaded() {
  if (isEmbedded()) {
    document.getElementById('menu').style.display = 'none';
  }

  setupModal();
  setupButtons();
  setupFeatureSearch();
  setupCheckboxes();

  applySavedSelectionHash();

  window.addEventListener('hashchange', hashChanged);
  if (window.location.hash !== '') hashChanged();
}

/** Page Load event handler. */
function pageLoad() {
  document.getElementById('header').style.width =
    document.body.scrollWidth + 'px';

  setInterval(searchTimer, 250);
}

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
window.addEventListener('load', pageLoad);
