import { Spinner } from '@blueprintjs/core';
import { ipcRenderer } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import React from 'react';
import Masonry from 'react-masonry-css';
import { Commands, Events } from '../../common/NetworkChannels';
import { ICommunityPost, IGame } from '../../common/Types';
import GameLink from '../../common/Types/GameLink';
import CommunityPost from './CommunityPost';
import { useEffectAsyncWithParameters } from './Extensions';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

interface CommunityProps {
  game: IGame;
}

const subRedditUrlRegex = /(?:https:\/\/www\.reddit\.com\/r\/)(.+?(?:(?=[/ ])|$))/;

const findSubRedditNameFromLinks = (links: Array<GameLink>) => {
  let subRedditName: string | undefined;
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];
    const matches = link.link.match(subRedditUrlRegex);
    if (matches && matches.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      subRedditName = matches[1];
      break;
    }
  }
  return subRedditName;
};

const Community: React.FC<CommunityProps> = ({ game }) => {
  const breakpointColumnsObj = {
    default: 3,
    1600: 2,
    1100: 1,
  };

  const getPosts = async (
    subRedditName: string | undefined
  ): Promise<Array<ICommunityPost> | null> => {
    if (!subRedditName) {
      return null;
    }
    return typedIpcRenderer.invoke('GetLatestPostsRequest', subRedditName);
  };

  const [communityPosts] = useEffectAsyncWithParameters<
    string | undefined,
    Array<ICommunityPost> | null
  >(findSubRedditNameFromLinks(game.links), getPosts, [game.id]);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="community-posts-grid"
      columnClassName="community-posts-grid_column"
    >
      <div>
        {communityPosts.isLoading ? (
          <Spinner />
        ) : (
          communityPosts.payload &&
          communityPosts.payload.map((p) => (
            <CommunityPost post={p} key={p.id} />
          ))
        )}
      </div>
    </Masonry>
  );
};

export default Community;
