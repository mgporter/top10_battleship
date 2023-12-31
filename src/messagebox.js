export default function MessageBox() {
  let messageBox = document.getElementById('message-box');

  if (messageBox === null) {
    messageBox = document.createElement('div');
    messageBox.id = 'message-box';
    messageBox.classList.add('message-box');
    messageBox.textContent = '';
    document.querySelector('header#player').appendChild(messageBox);
  }

  function write(message) {
    // If the message box is at opacity 0, we just write the message. This can happen
    // if a user selects another ship quickly
    if (messageBox.style.opacity == 0) {
      messageBox.innerHTML = message;
      messageBox.style.opacity = 1;
    } else {
      // Otherwise, set the opacity to 0. This will start a transition, and we will
      // write the message at the end of this transition
      messageBox.style.opacity = 0;
      messageBox.addEventListener(
        'transitionend',
        () => {
          messageBox.innerHTML = message;
          messageBox.style.opacity = 1;
        },
        { once: true }
      );
    }
  }

  function clear() {
    messageBox.style.opacity = 0;
  }

  function getElement() {
    return messageBox;
  }

  return {
    write,
    clear,
    getElement,
  };
}
