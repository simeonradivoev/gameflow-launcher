import React from 'react';
import ReactPlayer from 'react-player';
import SimpleImageSlider from 'react-simple-image-slider';
import AwesomeSlider from 'react-awesome-slider';
import {
  ICommunityPost,
  ICommunityPostGalleryItem,
  ICommunityPostMediaResolution,
} from '../../common/Types';

interface CommunityPostProps {
  post: ICommunityPost;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post }) => {
  let content = null;

  // Show as video
  if (!content && post.media?.reddit_video) {
    let preview: ICommunityPostMediaResolution | null = null;
    if (post.preview && post.preview?.images.length > 0) {
      const firstImage = post.preview.images[0];
      if (firstImage.resolutions.length > 0) {
        preview =
          firstImage.resolutions[
            Math.min(3, firstImage.resolutions.length - 1)
          ];
      }
    }

    content = (
      <div
        className="media player-wrapper"
        style={
          preview
            ? { paddingTop: `${(preview.height / preview.width) * 100}%` }
            : {}
        }
      >
        <ReactPlayer
          className="react-player"
          width="100%"
          height="100%"
          pip={false}
          playsinline
          // light={preview?.url}
          controls
          url={post.media.reddit_video.dash_url}
          fallback={post.media.reddit_video.fallback_url}
          config={{ file: { attributes: { preload: 'none' } } }}
        />
      </div>
    );
  }

  // Show as a gallery
  if (!content && post.gallery && post.gallery.length > 0) {
    const media = post.gallery.map((g) => {
      return (
        <div
          key={g.id}
          data-src={g.resolutions[Math.min(g.resolutions.length - 1, 3)].url}
          onClick={() => {
            console.log(g.id);
          }}
          style={{ cursor: 'pointer' }}
        />
      );
    });
    content = <AwesomeSlider className="media">{media}</AwesomeSlider>;
  }

  // Show as just the preview image
  if (!content && post.preview && post.preview.images.length > 0) {
    const firstImage = post.preview.images[0];
    if (firstImage.resolutions.length > 0) {
      const desiredResolution =
        firstImage.resolutions[Math.min(firstImage.resolutions.length - 1, 3)];
      content = (
        <img
          className="media"
          src={desiredResolution.url}
          alt={firstImage.source.url}
        />
      );
    }
  }

  return (
    <div className="community-post content-box">
      <div className="title">{post.title}</div>
      {content}
    </div>
  );
};

export default CommunityPost;
