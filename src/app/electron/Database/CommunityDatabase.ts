import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import { TypedIpcMain } from 'electron-typed-ipc';
import { Submission } from 'snoowrap';
import { Media } from 'snoowrap/dist/objects/Submission';
import { Commands, Events } from '../../common/NetworkChannels';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import {
  ICommunityPost,
  ICommunityPostGalleryItem,
  ICommunityPostImagePreview,
  ICommunityPostMedia,
  ICommunityPostMediaResolution,
  ICommunityPostPreview,
} from '../../common/Types';
import { IRedditAuthAccessToken } from '../Reddit/IRedditAuthAccessToken';
import { GetRequester } from '../Reddit/RedditAuth';

const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>;

interface CachedSubmissions {
  nextUpdate: Date;
  submissions: Array<ICommunityPost>;
}

const cachedSubmissions: { [key: string]: CachedSubmissions } = {};

const translateMedia = (media: Media) => {
  const translatedMedia: ICommunityPostMedia = {
    type: media.type,
  };
  if (media.reddit_video) {
    translatedMedia.reddit_video = {
      dash_url: media.reddit_video.dash_url,
      duration: media.reddit_video.duration,
      fallback_url: media.reddit_video.fallback_url,
      is_gif: media.reddit_video.is_gif,
      height: media.reddit_video.height,
    };
  }
  return media;
};

const translatePreview = (submission: Submission): ICommunityPostPreview => {
  return {
    enabled: submission.preview.enabled,
    images: submission.preview.images
      .filter((i) => i.source && i.resolutions)
      .map<ICommunityPostImagePreview>((i) => ({
        source: {
          url: i.source.url,
          width: i.source.width,
          height: i.source.height,
        },
        resolutions: i.resolutions.map<ICommunityPostMediaResolution>((r) => ({
          url: r.url,
          width: r.width,
          height: r.height,
        })),
        variants: i.variants,
        id: i.id,
      })),
  };
};

// gallery_data is not in typescript def
const translateGallery = (
  gallery_data: any,
  media_metadata: any
): Array<ICommunityPostGalleryItem> => {
  return gallery_data.items.map(
    (galleryItem: { id: string; media_id: number }) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { id, media_id } = galleryItem;
      const metadata: any = media_metadata[media_id.toString()];

      const item: ICommunityPostGalleryItem = {
        id,
        media_id,
        status: metadata.status,
        content_type: metadata.m,
        resolutions: metadata.p.map(
          (res: { x: number; y: number; u: string }) => {
            const resTranslated: ICommunityPostMediaResolution = {
              width: res.x,
              height: res.y,
              url: res.u,
            };
            return resTranslated;
          }
        ),
      };
      return item;
    }
  );
};

const translateSubmission = (submission: Submission): ICommunityPost => {
  const post: ICommunityPost = {
    id: submission.id,
    title: submission.title,
    thumbnail: submission.thumbnail,
    url: submission.url,
    name: submission.name,
    media: null,
  };

  if ((submission as any).gallery_data) {
    post.gallery = translateGallery(
      (submission as any).gallery_data,
      (submission as any).media_metadata
    );
  }

  if (submission.preview) {
    post.preview = translatePreview(submission);
  }

  if (submission.media) {
    post.media = translateMedia(submission.media);
  }
  return post;
};

export default (
  store: ElectronStore<SettingsElectronStore>,
  oldToken: Promise<IRedditAuthAccessToken | null>,
  updateTokenPromise: (
    newPromise: Promise<IRedditAuthAccessToken | null>
  ) => void
) => {
  typedIpcMain.handle('GetLatestPostsRequest', async (e, subredditName) => {
    // Check if we have cached version that doesn't need an update yet.
    const nowDate = new Date();
    const cached = cachedSubmissions[subredditName];

    if (cached) {
      if (cached.nextUpdate > nowDate) {
        return cached.submissions;
      }
    }

    // Get whole new version
    const requester = await GetRequester(store, oldToken, updateTokenPromise);

    if (requester) {
      const submissionsListings = (
        await requester.getSubreddit(subredditName).getHot({ limit: 10 })
      ).toJSON();

      const posts = submissionsListings.map(translateSubmission);
      // Update cache
      cachedSubmissions[subredditName] = {
        nextUpdate: new Date(new Date().getTime() + 10 * 60000),
        submissions: posts,
      };
      return posts;
    }

    return null;
  });
};
