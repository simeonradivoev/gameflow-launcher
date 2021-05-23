import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core';
import { clipboard } from 'electron';
import React, { useEffect } from 'react';

const TextContextMenu: React.FC = () => {
  const copyPasteMenu = (e: any) => (
    <Menu>
      <MenuItem
        onClick={() => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(e.target, clipboard.readText());

          const ev2 = new Event('input', { bubbles: true });
          e.target.dispatchEvent(ev2);
        }}
        text="Paste"
      />
    </Menu>
  );

  useEffect(() => {
    const eventListerer = (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      let node = e.target;

      while (node) {
        if (
          node.nodeName.match(/^(input|textarea)$/i) ||
          node.isContentEditable
        ) {
          ContextMenu.show(copyPasteMenu(e), {
            left: e.clientX,
            top: e.clientY,
          });
          break;
        }
        node = node.parentNode;
      }
    };
    document.body.addEventListener('contextmenu', eventListerer);

    return () => {
      document.body.removeEventListener('contextMenu', eventListerer);
    };
  });
  return <div />;
};

export default TextContextMenu;
