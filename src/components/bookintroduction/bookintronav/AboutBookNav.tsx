import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as St from './AboutBookNav.styled';

const AboutBookNav = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('Bestseller');

  const CategoryClickHandler = (category: string, path: string) => {
    setSelectedCategory(category); // 현재 선택된 카테고리 상태를 업데이트
    navigate(path);
  };

  return (
    <St.Container>
      <St.CatrgoryBox>
        <St.Category>
          <St.CategoryList
            // isSelected={selectedCategory === 'Bestseller'}
            className={selectedCategory === 'Bestseller' ? 'active' : ''}
            onClick={() => CategoryClickHandler('Bestseller', '/aboutBook/Bestseller')}>
            베스트셀러
          </St.CategoryList>
          <St.CategoryList
            // isSelected={selectedCategory === 'NewBook'}
            className={selectedCategory === 'NewBook' ? 'active' : ''}
            onClick={() => CategoryClickHandler('NewBook', '/aboutBook/NewBook')}>
            신간도서
          </St.CategoryList>
          <St.CategoryList
            // isSelected={selectedCategory === 'BookSpecial'}
            className={selectedCategory === 'BookSpecial' ? 'active' : ''}
            onClick={() => CategoryClickHandler('BookSpecial', '/aboutBook/BookSpecial')}>
            스페셜
          </St.CategoryList>
          <St.CategoryList
            // isSelected={selectedCategory === 'BookerPick'}
            className={selectedCategory === 'BookerPick' ? 'active' : ''}
            onClick={() => CategoryClickHandler('BookerPick', '/aboutBook/BookerPick')}>
            북커픽
          </St.CategoryList>
        </St.Category>
      </St.CatrgoryBox>
    </St.Container>
  );
};

export default AboutBookNav;
