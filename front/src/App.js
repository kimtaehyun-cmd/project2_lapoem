import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Main from './components/Main/Main';
import Join from './components/Auth/Join';
import Login from './components/Auth/Login';
import Booklist from './components/BookList/Booklist';
import Stella from './components/Stella/Stella';
import Community from './components/Community/Community';
import NewForum from './components/Community/NewForum';
import Community_detail from './components/Community/Community_detail';
import CommunityMyForum from './components/Community/CommunityMyForum';
import ThreadOn from './components/ThreadOn/Threadon';
import BookDetail from './components/BookList/BookDetail';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { initializeAuth } from './redux/features/auth/authSlice';
import Mypage from './components/My/Mypage';
import Threadon_post from './components/ThreadOn/Threadon_post';
import Terms from './components/Auth/Terms';
import ThreadDetailPage from './components/ThreadOn/ThreadDetailPage';
import Footer from './components/Footer';

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book_list" element={<Booklist />} />
          <Route path="/book_list/:bookId" element={<BookDetail />} />
          <Route path="/chatstella/" element={<Stella />} />
          <Route path="/chatstella/:bookId" element={<Stella />} />
          <Route path="/thread_on" element={<ThreadOn />} />
          <Route path="/new_thread" element={<Threadon_post />} />
          <Route path="/threads/:thread_num" element={<ThreadDetailPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/new_forum" element={<NewForum />} />
          <Route path="/community/:postId" element={<Community_detail />} />
          <Route path="/community/my_forum" element={<CommunityMyForum />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
        {/* Catch all unmatched routes and redirect to Home */}
      </div>
    </BrowserRouter>
  );
}

export default App;
