import { LikesInfoType } from '../../../likes/api/model/output/output';
import { CommentView, CommentViewOutput } from './type';
import { WithId } from 'mongodb';

export const getCommentsView = (
  Comm: WithId<CommentView>,
  likes: LikesInfoType,
): CommentViewOutput => {
  return {
    id: Comm._id.toString(),
    content: Comm.content,
    commentatorInfo: {
      userId: Comm.commentatorInfo.userId,
      userLogin: Comm.commentatorInfo.userLogin,
    },
    createdAt: Comm.createdAt,
    likesInfo: likes,
  };
};
// export const postLikesMapper = (like: PostLikeDto): NewestLikeType => {
//   return {
//     addedAt: like.addedAt,
//     userId: like.likedUserId,
//     login: like.likedUserName,
//   };
// };
