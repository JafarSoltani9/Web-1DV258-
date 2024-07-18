export const windows = []

/**
 * Closes a specified window element from the container.
 * @param {HTMLElement} windowContainer - The container holding the window elements.
 * @param {string} windowID - The ID of the window element to be closed.
 */
export function closeWindow (windowContainer, windowID) {
  const windowElement = document.getElementById(windowID)
  if (windowElement) {
    windowContainer.removeChild(windowElement)
    const index = windows.indexOf(windowElement)
    if (index !== -1) {
      windows.splice(index, 1)
    }
  }
}

/**
 * Makes an HTML element draggable within the DOM.
 * @param {HTMLElement} element - The element to be made draggable.
 */
export function makeDraggable (element) {
  let highestZIndex = 100

  element.onmousedown = function () {
    element.style.zIndex = ++highestZIndex
  }

  const header = element.querySelector('.window-header')
  header.onmousedown = function (e) {
    element.style.zIndex = ++highestZIndex // Bring to front when header is clicked
    const startX = e.clientX
    const startY = e.clientY
    const startLeft = parseInt(window.getComputedStyle(element).left, 10)
    const startTop = parseInt(window.getComputedStyle(element).top, 10)

    /**
     * Handles mouse move event to update element position.
     * @param {MouseEvent} e - The mouse event.
     */
    function onMouseMove (e) {
      element.style.left = startLeft + e.clientX - startX + 'px'
      element.style.top = startTop + e.clientY - startY + 'px'
    }

    /**
     *
     */
    function onMouseUp () {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
}
