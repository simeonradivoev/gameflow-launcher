import { Button, ControlGroup, InputGroup } from '@blueprintjs/core';
import React from 'react';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import { IGame } from '../../../common/Types';
import UpdateGameFieldLabel from './UpdateGameFieldLabel';
import GameLink from '../../../common/Types/GameLink';

interface UpdateGameLinksProps {
  target: IGame;
  source?: IGame;
  updateTarget: (target: any) => void;
}

const UpdateGameLinks: React.FC<UpdateGameLinksProps> = ({
  target,
  source,
  updateTarget,
}) => {
  const renderLink = (link: GameLink, index: number) => {
    return (
      <UpdateGameFieldLabel<GameLink, GameLink[]>
        key={index}
        field={index}
        target={target.links}
        source={source?.links}
        equalityCheck={GameLink.equals}
        updateTarget={(value) => {
          updateTarget(
            update(target, {
              links: { $set: value },
            })
          );
        }}
      >
        <div className="field">
          <ControlGroup fill>
            <InputGroup
              placeholder="Name..."
              value={link.name ?? ''}
              onChange={(value) => {
                updateTarget(
                  update(target, {
                    links: {
                      [index]: { name: { $set: value.target.value } },
                    },
                  })
                );
              }}
            />
            <InputGroup
              rightElement={
                <Button
                  disabled={!link.link}
                  onClick={() => {
                    updateTarget(
                      update(target, {
                        links: {
                          [index]: { link: { $set: '' } },
                        },
                      })
                    );
                  }}
                  minimal
                  icon="small-cross"
                />
              }
              leftIcon="link"
              placeholder="URL..."
              fill
              value={link.link ?? ''}
              onChange={(value) => {
                updateTarget(
                  update(target, {
                    links: {
                      [index]: { link: { $set: value.target.value } },
                    },
                  })
                );
              }}
            />
            <Button
              small
              onClick={() => {
                updateTarget(
                  update(target, {
                    links: { $splice: [[index, 1]] },
                  })
                );
              }}
              icon="trash"
            />
          </ControlGroup>
        </div>
      </UpdateGameFieldLabel>
    );
  };

  return (
    <div className="padded">
      <Button
        text="Add Link"
        onClick={() => {
          updateTarget(
            target.links
              ? update(target, {
                  links: {
                    $push: [new GameLink('', '')],
                  },
                })
              : update(target, {
                  links: { $set: [new GameLink('', '')] },
                })
          );
        }}
      />
      {target.links?.map((link, index) => renderLink(link, index))}
    </div>
  );
};

export default UpdateGameLinks;
