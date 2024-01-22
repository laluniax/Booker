import { githubLoginHandler } from '../../api/supabase.api';
import * as St from './Form.stlyed';

export const GithubLogin = async () => {
  const result = await githubLoginHandler();

  if (result.error) {
    console.error('에러가 발견되었습니다', result.error);
  } else if (result.data) {
    alert('깃허브 로그인 창으로 이동합니다');
  }
};

export const GithubLoginBtn = () => {
  return <St.SnsLogo src="/images/snslogo/githubLogo.png" alt="깃허브 로고" onClick={GithubLogin} />;
};
