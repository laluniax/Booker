import { useEffect, useState } from 'react';
import {
  deleteSubCommentHandler,
  getSubCommentsInfoHandler,
  insertSubCommentHandler,
  updateSubCommentHandler,
} from '../../../api/supabase.api';
import { SubCommentTypes } from '../../../types/types';
import { formatCreatedAt } from '../../../utils/date';
import * as St from './Comment.styled';

type Props = {
  commentId: number | undefined;
  session: string | undefined;
  setCommentsCount: React.Dispatch<React.SetStateAction<number>>;
};

const SubComment = ({ commentId, session, setCommentsCount }: Props) => {
  const [toggleOpen, setToggleOpen] = useState(false);
  const [content, setContent] = useState('');
  const [data, setData] = useState<SubCommentTypes>();
  const [isEditing, setIsEditing] = useState(false);
  const [inputSubComment, setInputSubComment] = useState('');
  const [subCommentId, setSubCommentId] = useState<number>();

  // console.log(data);

  const getSubCommentsInfo = async () => {
    const result = await getSubCommentsInfoHandler(commentId as number);
    setData(result[0]);
    // const subcomments = result[0].subcomments
    // console.log(result);
    // const subCommentsCount = subcomments.reduce((acc, item) => {
    //   return acc + item.length;
    // });
    // console.log(subCommentsCount);
    // const subCommentsCount = result.reduce((acc, item) => {
    //   return acc + item.subcomments?.length;
    // });
    // console.log(subCommentsCount);
    // setCommentsCount(subCommentsCount);
  };

  const insertSubComment = async () => {
    const result = await insertSubCommentHandler(commentId as number, session as string, content);
    getSubCommentsInfo();
    setContent('');
  };

  const updateSubComment = async () => {
    const result = await updateSubCommentHandler(inputSubComment, subCommentId as number);
    // setContent('');
    getSubCommentsInfo();
    setIsEditing(false);
    setSubCommentId(undefined);
    setInputSubComment('');
  };

  const deleteSubComment = async (subCommentId: number) => {
    const result = await deleteSubCommentHandler(subCommentId);
    getSubCommentsInfo();
  };

  useEffect(() => {
    getSubCommentsInfo();
  }, []);
  return (
    <St.SubCommentWrapper>
      {toggleOpen ? (
        <>
          <St.SubCommentAddBtn
            onClick={() => {
              setToggleOpen(false);
            }}>
            답글 숨기기
          </St.SubCommentAddBtn>
          <St.SubCommentBox>
            {data?.subcomments
              .sort((a, b) => a.id - b.id)
              .map((item, i) => {
                return (
                  <St.SubCommentList key={i}>
                    <St.SubCommentNextText> ┗ </St.SubCommentNextText>
                    <St.SubComment>
                      <St.SubCommentUserAndBtn>
                        <St.SubCommentUser>
                          <St.SubCommentImg src={item.users.user_img ?? undefined} />
                          <St.SubCommentNickname>{item.users.nickname} | </St.SubCommentNickname>
                          <St.SubCommentDate>{formatCreatedAt(item.created_at)}</St.SubCommentDate>
                        </St.SubCommentUser>
                        {session === item.user_id ? (
                          <St.CommentBtnDiv>
                            {isEditing ? (
                              <St.CommentEditSubmitBtnBox>
                                {item.id === subCommentId ? (
                                  <St.SubCommentEditSubmitBtnBox>
                                    <St.SubCommentEditSubmitButton
                                      onClick={() => {
                                        updateSubComment();
                                      }}>
                                      완료
                                    </St.SubCommentEditSubmitButton>
                                    <St.SubCommentEditSubmitButton
                                      onClick={() => {
                                        deleteSubComment(item.id);
                                      }}>
                                      삭제
                                    </St.SubCommentEditSubmitButton>
                                  </St.SubCommentEditSubmitBtnBox>
                                ) : null}
                              </St.CommentEditSubmitBtnBox>
                            ) : (
                              <>
                                <St.SubCommentButton
                                  onClick={() => {
                                    setIsEditing(true);
                                    setSubCommentId(item.id);
                                    setInputSubComment(item.content as string);
                                  }}>
                                  수정
                                </St.SubCommentButton>
                                <St.SubCommentButton
                                  onClick={() => {
                                    deleteSubComment(item.id);
                                  }}>
                                  삭제
                                </St.SubCommentButton>
                              </>
                            )}
                          </St.CommentBtnDiv>
                        ) : (
                          <St.CommentBtnDiv></St.CommentBtnDiv>
                        )}
                      </St.SubCommentUserAndBtn>
                      <St.SubCommentContent>
                        {item.id === subCommentId ? (
                          <St.subCommentEditInput
                            value={inputSubComment}
                            onChange={(e) => {
                              setInputSubComment(e.target.value);
                            }}
                          />
                        ) : (
                          item.content
                        )}
                      </St.SubCommentContent>
                    </St.SubComment>
                  </St.SubCommentList>
                );
              })}
          </St.SubCommentBox>

          {session ? (
            <St.SubCommentTextAreaBox>
              <St.SubCommentTextArea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
              />
              <St.SubCommentSubmitBtn onClick={insertSubComment}>등록</St.SubCommentSubmitBtn>
            </St.SubCommentTextAreaBox>
          ) : (
            <></>
          )}
        </>
      ) : (
        <St.SubCommentAddBtn
          onClick={() => {
            setToggleOpen(true);
            getSubCommentsInfo();
          }}>
          답글 펼치기
        </St.SubCommentAddBtn>
      )}
    </St.SubCommentWrapper>
  );
};

export default SubComment;
