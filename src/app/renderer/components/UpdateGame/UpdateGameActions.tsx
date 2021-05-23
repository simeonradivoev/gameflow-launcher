import {
  Button,
  ControlGroup,
  FileInput,
  FormGroup,
  InputGroup,
  MenuItem,
} from '@blueprintjs/core';
import React from 'react';
import update from 'immutability-helper';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import { ActionType, IGame, IGameAction } from '../../../common/Types';
import UpdateGameFieldLabel from './UpdateGameFieldLabel';
import GameAction from '../../../common/Types/GameAction';

interface UpdateGameActionsProps {
  target: IGame;
  source: IGame | undefined;
  updateTarget: (target: any) => void;
}

const UpdateGameActions: React.FC<UpdateGameActionsProps> = ({
  target,
  source,
  updateTarget,
}) => {
  const DefaultAction = new GameAction(ActionType.EXECUTABLE);

  const ActionTypeSelect = Select.ofType<ActionType>();

  const filterType: ItemPredicate<ActionType> = (query, s) => {
    return ActionType[s].toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const renderType: ItemRenderer<ActionType> = (
    type,
    { handleClick, modifiers }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={type}
        onClick={handleClick}
        text={ActionType[type]}
      />
    );
  };

  const renderAction = (
    targetGameAction: IGameAction,
    sourceGameAction: IGameAction | null | undefined,
    updatePlayAction: (updatedAction: IGameAction) => void,
    showName: boolean,
    elementButtons?: JSX.Element
  ) => {
    return (
      <FormGroup>
        {showName && (
          <UpdateGameFieldLabel
            name="Action Name"
            field="name"
            target={targetGameAction}
            source={sourceGameAction ?? DefaultAction}
            updateTarget={updatePlayAction}
          >
            <ControlGroup>
              <InputGroup
                fill
                value={targetGameAction.name ?? ''}
                onChange={(e) =>
                  updatePlayAction(
                    update(targetGameAction, { name: { $set: e.target.value } })
                  )
                }
              />
              {elementButtons && elementButtons}
            </ControlGroup>
          </UpdateGameFieldLabel>
        )}
        <UpdateGameFieldLabel
          name="Type"
          field="type"
          target={targetGameAction}
          source={sourceGameAction ?? DefaultAction}
          updateTarget={(v) => updatePlayAction(v)}
        >
          <ActionTypeSelect
            className="full-width"
            popoverProps={{ minimal: true }}
            items={
              Object.values(ActionType).filter(
                (t) => typeof t !== 'string'
              ) as ActionType[]
            }
            itemRenderer={renderType}
            itemPredicate={filterType}
            activeItem={targetGameAction.type ?? ''}
            onItemSelect={(item) => {
              updatePlayAction(
                update(targetGameAction, { type: { $set: item } })
              );
            }}
          >
            <Button
              fill
              text={ActionType[targetGameAction.type]}
              rightIcon="caret-down"
              alignText="left"
            />
          </ActionTypeSelect>
        </UpdateGameFieldLabel>

        {targetGameAction.type === ActionType.EXECUTABLE ? (
          <UpdateGameFieldLabel
            name="Path"
            field="path"
            target={targetGameAction}
            source={sourceGameAction ?? DefaultAction}
            updateTarget={(v) => updatePlayAction(v)}
          >
            <FileInput
              text={targetGameAction.path}
              inputProps={{
                onChange: (e) => {
                  updatePlayAction(
                    update(targetGameAction, {
                      path: { $set: e.target.files[0].path },
                    })
                  );
                },
              }}
              className="full-width"
            />
          </UpdateGameFieldLabel>
        ) : (
          <UpdateGameFieldLabel
            name="Address"
            field="address"
            target={targetGameAction}
            source={sourceGameAction ?? DefaultAction}
            updateTarget={(v) => updatePlayAction(v)}
          >
            <InputGroup
              leftIcon="link"
              onChange={(e) =>
                updatePlayAction(
                  update(targetGameAction, {
                    address: { $set: e.target.value },
                  })
                )
              }
              value={targetGameAction.address ?? ''}
              className="full-width"
            />
          </UpdateGameFieldLabel>
        )}
      </FormGroup>
    );
  };

  return (
    <div className="actions">
      <div className="play-action">
        <UpdateGameFieldLabel
          field="playAction"
          target={target}
          source={source}
          updateTarget={updateTarget}
        >
          <div className="padded">
            <ControlGroup>
              <Button
                disabled={!!target.playAction}
                text="Create Play Action"
                icon="add"
                onClick={() =>
                  updateTarget(
                    update(target, {
                      playAction: {
                        $set: { ...DefaultAction },
                      },
                    })
                  )
                }
              />
              <Button
                disabled={!target.playAction}
                icon="trash"
                onClick={() => {
                  updateTarget(update(target, { playAction: { $set: null } }));
                }}
              />
            </ControlGroup>
          </div>
          {target.playAction &&
            renderAction(
              target.playAction,
              source?.playAction,
              (updatedAction) =>
                updateTarget(
                  update(target, { playAction: { $set: updatedAction } })
                ),
              false
            )}
        </UpdateGameFieldLabel>
      </div>
      <div className="other-action">
        <div className="padded field">
          <Button
            text="Add Other Action"
            icon="add"
            onClick={() => {
              if (target.otherActions) {
                updateTarget(
                  update(target, {
                    otherActions: {
                      $push: [
                        new GameAction(ActionType.EXECUTABLE, {
                          name: target.otherActions.length.toString(),
                        }),
                      ],
                    },
                  })
                );
              } else {
                updateTarget(
                  update(target, {
                    otherActions: {
                      $set: [{ name: 'Other Action 0' } as GameAction],
                    },
                  })
                );
              }
            }}
          />
        </div>
        {target.otherActions?.map((action, index) => (
          <div key={index}>
            {renderAction(
              action,
              source?.otherActions[index],
              (updatedAction) =>
                updateTarget(
                  update(target, {
                    otherActions: { [index]: { $set: updatedAction } },
                  })
                ),
              true,
              <div>
                <Button
                  disabled={index <= 0}
                  icon="arrow-up"
                  onClick={() =>
                    updateTarget(
                      update(
                        update(target, {
                          otherActions: {
                            [index]: { $set: target.otherActions[index - 1] },
                          },
                        }),
                        {
                          otherActions: {
                            [index - 1]: { $set: target.otherActions[index] },
                          },
                        }
                      )
                    )
                  }
                />
                <Button
                  icon="arrow-down"
                  disabled={index >= target.otherActions.length - 1}
                  onClick={() =>
                    updateTarget(
                      update(
                        update(target, {
                          otherActions: {
                            [index]: { $set: target.otherActions[index + 1] },
                          },
                        }),
                        {
                          otherActions: {
                            [index + 1]: { $set: target.otherActions[index] },
                          },
                        }
                      )
                    )
                  }
                />
                <Button
                  icon="trash"
                  onClick={() => {
                    updateTarget(
                      update(target, {
                        otherActions: { $splice: [[index, 1]] },
                      })
                    );
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateGameActions;
