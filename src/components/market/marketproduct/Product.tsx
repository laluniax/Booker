import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일 가져오기
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useCreateOrGetChat, useSendMessage } from '../../../api/Chat.api';
import { deleteProductHandler, deleteProductImgStorage, getProductHandler, supabase } from '../../../api/Supabase.api';
import SliderPrevIcon from '../../../assets/common/slider_left.webp';
import SliderNextIcon from '../../../assets/common/slider_right.webp';
import logoImage from '../../../assets/profile/defaultprofileimage.webp';
import { ChatId, otherPerson, person, productState, sendMessages } from '../../../state/atom/chatAtom';
import { userSession } from '../../../state/atom/userSessionAtom';
import { MessageTypes, ProductsTypes } from '../../../types/types';
import Follow from '../../common/follow/Follow';
import ProductsLike from '../../common/like/ProductsLike';
import { categoryArr } from '../marketpost/Post';
import * as St from './Product.styled';

const Product = () => {
  const params = useParams().id;
  const postId = params ? parseInt(params, 10) : undefined;
  const navigate = useNavigate();
  const slideRef = useRef<HTMLUListElement>(null);
  const [product, setProduct] = useState<ProductsTypes>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideLength, setSlideLength] = useState(0);
  const session = useRecoilValue(userSession);

  const [inputValue, setInputValue] = useState('');
  const [productId, setProductId] = useRecoilState(productState);
  const [LoginPersonal, setLoginPersonal] = useRecoilState(person);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messages, setMessages] = useRecoilState(sendMessages);
  const [otherLoginPersonal, setOtherLoginPersonal] = useRecoilState(otherPerson);
  const { mutate: createOrGetChat } = useCreateOrGetChat();
  const [chatId, setChatId] = useRecoilState(ChatId);
  const { mutate: sendDirectMessage } = useSendMessage();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // 최하단으로 스크롤하는 함수
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  // 채팅 모달이 열리거나 메시지 목록이 변경될 때 스크롤
  useEffect(() => {
    if (isChatModalOpen && isAtBottom) {
      // 비동기적으로 스크롤 함수 실행하여 모든 DOM 업데이트 후 스크롤되도록 함
      setTimeout(scrollToBottom, 0);
    }
  }, [messages, isChatModalOpen, isAtBottom]);

  // DM 클릭 핸들러
  const DmClickhandler = async (otherUserId: string, productId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id === otherUserId) {
      alert('자신에게 채팅을 보낼 수 없습니다 ');
      return;
    } else {
      if (user) {
        const userId = user?.id;
        setIsChatModalOpen(true);
        createOrGetChat({ userId, otherUserId, productId });
        setProductId(productId);
        setOtherLoginPersonal(otherUserId);
        setLoginPersonal(userId);
      }
    }
  };

  const InputChanger = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // 메시지 전송 핸들러(엔터)
  const KeyPresshandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      if (event.nativeEvent.isComposing === false) {
        sendDirectMessage({
          content: inputValue,
          author_id: LoginPersonal,
          chat_id: chatId,
          item_id: productId,
        });
        setChatId(chatId);
        setInputValue('');
      }
    }
  };

  //보내기 버튼(클릭)
  const sendDmMessage = async () => {
    if (!inputValue.trim()) return; // 메시지가 비어있지 않은지 확인
    sendDirectMessage({
      content: inputValue,
      author_id: LoginPersonal,
      chat_id: chatId,
      item_id: productId,
    });
    setChatId(chatId);
    setInputValue('');
  };

  const renderMessages = () => {
    dayjs.locale('ko'); // 한국어 로케일을 기본값으로 설정
    let lastDate: dayjs.Dayjs | null = null;
    return (
      <>
        {messages
          .filter((message: MessageTypes) => message.chat_id === chatId)
          .sort((a: MessageTypes, b: MessageTypes) => a.id - b.id) // 오름차순 정렬
          .map((message: MessageTypes) => {
            const currentDate = dayjs(message.created_at);
            const formattedTime = currentDate.format('hh:mm A'); // Format time with AM/PM
            const formattedDate = currentDate.format('YYYY-MM-DD dddd'); // Format date with day of the week
            let dateLabel = null;
            // Check if the date has changed
            if (lastDate === null || !currentDate.isSame(lastDate, 'day')) {
              dateLabel = <St.DateLabel>{formattedDate}</St.DateLabel>; // Use DateLabel
              lastDate = currentDate;
            }
            return (
              <>
                {dateLabel} {/* Display the date label if the date has changed */}
                {message.author_id !== LoginPersonal && <St.NicknameLabel>{message.users?.nickname}</St.NicknameLabel>}
                <St.MessageComponent key={message.id} isOutgoing={message.author_id === LoginPersonal}>
                  {message.content} {formattedTime}
                </St.MessageComponent>
              </>
            );
          })}
      </>
    );
  };

  const getProduct = async () => {
    const result = await getProductHandler(params as string);
    setProduct(result[0]);
    setSlideLength(result[0].product_img.length);
  };

  const onClickPrevBtn = useCallback(() => {
    if (currentSlide >= 1) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const onClickNextBtn = useCallback(() => {
    if (currentSlide < slideLength - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slideLength]);

  const onClickDeleteButton = async () => {
    if (window.confirm('삭제하시겠습니까?')) {
      const result = await deleteProductHandler(params as string);
      const resultStorage = await deleteProductImgStorage(params as string);
      navigate(`/market`);
    } else {
      return false;
    }
  };

  const onClickDMButton = () => {
    session
      ? product?.user_id && DmClickhandler(product.user_id, product.id)
      : window.confirm('로그인 페이지로 이동하시겠습니까?') && navigate(`/login`);
  };

  useEffect(() => {
    getProduct();
  }, [params]);

  useEffect(() => {
    if (slideRef.current) slideRef.current.style.marginLeft = `${-currentSlide * 30}rem`;
  }, [currentSlide]);

  return (
    <St.Container>
      <St.PrevButton
        onClick={() => navigate(`/market/${categoryArr.indexOf(product?.category as string)}`)}></St.PrevButton>
      <St.Title>중고 거래 상세페이지</St.Title>
      <St.ProductWrapper>
        {product?.product_img?.length === 0 ? (
          <St.LogoWrapper>
            <img src={logoImage} />
          </St.LogoWrapper>
        ) : (
          <St.SliderWrapper>
            <St.SliderUl ref={slideRef} $currentSlide={currentSlide} $slideCount={product?.product_img?.length ?? 0}>
              {product?.product_img?.map((img, i) => (
                <St.SliderLi key={i}>
                  <img src={img} alt={`Product image ${i + 1}`} />
                </St.SliderLi>
              ))}
            </St.SliderUl>
            {currentSlide !== 0 && (
              <St.SliderBtn onClick={onClickPrevBtn} className="prev">
                <img src={SliderPrevIcon} />
              </St.SliderBtn>
            )}
            {currentSlide !== slideLength - 1 && (
              <St.SliderBtn onClick={onClickNextBtn} className="next">
                <img src={SliderNextIcon} />
              </St.SliderBtn>
            )}
          </St.SliderWrapper>
        )}
        <St.ProductInfo>
          <St.ProductTitleAndDate>
            <St.ProductTitle>{product?.title}</St.ProductTitle>
            <St.ProductDate>
              | {product?.created_at ? dayjs(product.created_at).format('MM-DD HH:MM') : '날짜 정보 없음'}
            </St.ProductDate>
          </St.ProductTitleAndDate>
          <St.ProductCategory>
            <span>카테고리 | </span>
            {product?.category}
            <St.ProductGrade>
              <span>제품 상태 | </span>
              {product?.product_grade}
            </St.ProductGrade>
          </St.ProductCategory>
          <St.ProductCategory>
            <span>거래 혜택 | </span>첫 결제 시 안전거래 수수료 1,000원 할인
            <St.ProductGrade>
              <span>무이자 | </span>
              1개월 이상 무이자 할부
            </St.ProductGrade>
          </St.ProductCategory>
          <St.PriceBtnWrapper>
            <St.ProductPrice>
              {product?.price} <span>원</span>
            </St.ProductPrice>
            {session?.id === product?.user_id ? (
              <St.ProductBtn>
                <St.UpdateBtn onClick={() => navigate(`/marketpost/${product?.id}`)}>
                  <St.EditIcon />
                </St.UpdateBtn>
                <St.UpdateBtn onClick={onClickDeleteButton}>
                  <St.DeleteIcon />
                </St.UpdateBtn>
              </St.ProductBtn>
            ) : null}
          </St.PriceBtnWrapper>
          <St.ProductLikesChatUser>
            <St.ProductBtn>
              {product?.onsale ? (
                <>
                  <St.ProductsLikesWrapper>
                    <ProductsLike postId={postId} count={true} />
                  </St.ProductsLikesWrapper>
                  <St.StartChat onClick={onClickDMButton}>대화 시작하기</St.StartChat>
                </>
              ) : (
                <St.ProductSoldOut>판매 완료된 상품입니다.</St.ProductSoldOut>
              )}
              {/* 여기에 채팅 모달을 조건부 렌더링합니다. */}
              {isChatModalOpen && (
                <St.ChatModalWrapper>
                  <St.ChatModalHeader>
                    {/* 채팅 모달 내용 */}
                    <St.ChatModalHeader>
                      <St.CloseButton onClick={() => setIsChatModalOpen(false)}>←</St.CloseButton>
                      <St.HeaderChattingModalTitle>채팅</St.HeaderChattingModalTitle>
                      <div></div>
                    </St.ChatModalHeader>
                  </St.ChatModalHeader>
                  <St.ChatModalBody ref={chatBodyRef}>
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                  </St.ChatModalBody>
                  <St.ChatModalFooter>
                    <St.InputField
                      value={inputValue}
                      onChange={InputChanger}
                      onKeyDown={KeyPresshandler}
                      placeholder="메세지를 입력해주세요"
                    />
                    <St.SendButton onClick={sendDmMessage}>전송</St.SendButton>
                  </St.ChatModalFooter>
                </St.ChatModalWrapper>
              )}
            </St.ProductBtn>
            <St.ProductUser
              onClick={() => {
                navigate(`/profile/${product?.user_id}`);
              }}>
              <img src={product?.users.user_img ?? undefined} />
              <div>{product?.users.nickname}</div>
              {session?.id === product?.user_id ? (
                <St.FollowBtn>내 프로필</St.FollowBtn>
              ) : (
                product?.user_id && <Follow params={product?.user_id as string} usage="product" />
              )}
            </St.ProductUser>
          </St.ProductLikesChatUser>
        </St.ProductInfo>
      </St.ProductWrapper>
      <St.ProductContent>{product?.content}</St.ProductContent>
    </St.Container>
  );
};

export default Product;
