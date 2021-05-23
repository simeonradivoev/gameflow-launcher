import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core';
import React, { PropsWithChildren } from 'react';
import { MdSettingsBackupRestore } from 'react-icons/md';

interface UpdateGameFieldLabelProps<
  TTargetType,
  TKeyType extends keyof TTargetType
> {
  className?: string;
  name?: string;
  field: TKeyType;
  target: TTargetType;
  source?: TTargetType;
  updateTarget?: (target: TTargetType) => void;
  equalityCheck?: (
    target: TTargetType[TKeyType],
    source?: TTargetType[TKeyType]
  ) => boolean;
}

const UpdateGameFieldLabel: <TTargetType, TKeyType extends keyof TTargetType>(
  props: PropsWithChildren<UpdateGameFieldLabelProps<TTargetType, TKeyType>>,
  context?: any
) => React.ReactElement<
  UpdateGameFieldLabelProps<TTargetType, TKeyType>
> | null = ({
  className,
  name,
  field,
  target,
  source,
  children,
  updateTarget,
  equalityCheck,
}) => {
  const contextMenu = (
    <Menu>
      <MenuItem
        text="Reset"
        icon={<MdSettingsBackupRestore />}
        disabled={source && source[field] === target[field]}
        onClick={() => {
          if (updateTarget) {
            if (source) {
              if (field in source) {
                updateTarget({ ...target, [field]: source[field] });
              } else {
                // Source did not have the property so remove it from target as well.
                const { [field]: remove, ...rest } = target;
                updateTarget(rest as any);
              }
            } else {
              const { [field]: remove, ...rest } = target;
              updateTarget(rest as any);
            }
          }
        }}
      />
    </Menu>
  );

  return (
    <div
      className={`field ${
        (
          equalityCheck
            ? !equalityCheck(target[field], source ? source[field] : undefined)
            : (source ? source[field] : undefined) !== target[field]
        )
          ? 'changed'
          : ''
      }`}
    >
      {name ? (
        <label htmlFor={field.toString()}>
          <span
            onContextMenu={(e) => {
              ContextMenu.show(contextMenu, {
                left: e.clientX,
                top: e.clientY,
              });
            }}
            className={`label ${className}`}
          >
            {name}
          </span>
          {children && children}
        </label>
      ) : (
        <div
          onContextMenu={(e) => {
            ContextMenu.show(contextMenu, {
              left: e.clientX,
              top: e.clientY,
            });
          }}
          className="label-group"
        >
          {children && children}
        </div>
      )}
    </div>
  );
};

export default UpdateGameFieldLabel;
