import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { WEBSOCKET_CHAT_URL, API_CHAT_URL, GET_BOOK_DETAIL_API_URL, API_CHAT_LIST_URL } from '../../util/apiUrl';
import { initializeAuth } from '../../redux/features/auth/authSlice';
import './Stella.css';

const MAX_RECONNECT_ATTEMPTS = 3;
const INITIAL_RECONNECT_DELAY = 1000;

const Stella = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(bookId || 0);
  const [isTyping, setIsTyping] = useState(false);
  const [bookInfo, setBookInfo] = useState(null);
  const chatBoxRef = useRef(null);
  const alertShownRef = useRef(false);
  const { isLoggedIn, isAuthInitializing, authInitialized, user } = useSelector((state) => state.auth);

  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const wsRef = useRef(null); // WebSocket을 관리하기 위한 ref

  useEffect(() => {
    if (!authInitialized) {
      dispatch(initializeAuth());
    }
  }, [authInitialized, dispatch]);

  useEffect(() => {
    if (!isAuthInitializing && !isLoggedIn && !alertShownRef.current) {
      alertShownRef.current = true; // 표시되었음을 설정
      const shouldNavigateToLogin = window.confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
      if (shouldNavigateToLogin) {
        navigate('/login');
      } else {
        navigate('/');
      }
    }
  }, [isAuthInitializing, isLoggedIn, navigate]);

  useEffect(() => {
    const loadChatRooms = async () => {
      if (user) {
        try {
          const response = await axios.get(API_CHAT_LIST_URL(user.memberNum));
          setChatRooms(response.data);
        } catch (error) {
          console.error('Failed to load chat rooms:', error);
        }
      }
    };
    loadChatRooms();
  }, [user]);

  useEffect(() => {
    // bookId가 없으면 일회성 채팅 모드로 전환
    if (!bookId) {
      setSelectedRoom(0);
      setChatHistory([
        { sender_id: 'stella', message: '일회성 채팅방에 오신 것을 환영합니다!' },
        { sender_id: 'stella', message: 'ex) 책에 대해 궁금한 점을 물어보세요.' },
      ]);
      setIsSocketOpen(false); // WebSocket 연결 초기화
    }
  }, [bookId]);

  useEffect(() => {
    const loadBookInfoAndChatHistory = async () => {
      if (selectedRoom && user) {
        try {
          // 책 정보 가져오기
          const bookResponse = await axios.get(GET_BOOK_DETAIL_API_URL(selectedRoom));
          setBookInfo(bookResponse.data);

          // 채팅 기록 가져오기
          const chatResponse = await axios.get(`${API_CHAT_URL}/${selectedRoom}/${user.memberNum}`);
          const loadedChatHistory = chatResponse.data;

          // 환영 메시지 정의
          const welcomeMessages = [
            {
              sender_id: 'stella',
              message: `${bookResponse.data.book_title || '일회성'} 채팅방에 오신 것을 환영합니다!`,
            },
            {
              sender_id: 'stella',
              message: 'ex) 이 책에 대해 설명해줘 같은 메시지를 입력해 주세요.',
            },
          ];

          // 환영 메시지와 불러온 채팅 기록 병합 후 설정
          setChatHistory([...welcomeMessages, ...loadedChatHistory]);
        } catch (error) {
          console.error('Failed to load book information or chat history:', error);
        }
      }
    };

    loadBookInfoAndChatHistory();
  }, [selectedRoom, user]);

  // WebSocket 연결 관리
  useEffect(() => {
    if (!authInitialized || !isLoggedIn || !user || selectedRoom === null) return;

    // 기존 WebSocket 연결 닫기
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const connectWebSocket = () => {
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.log('Maximum reconnect attempts reached. Stopping reconnect attempts.');
        return;
      }

      const wsUrl = `${WEBSOCKET_CHAT_URL}?member_num=${user.memberNum}&book_id=${selectedRoom}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // console.log(`Connected to the chat server with book_id: ${selectedRoom}`);
        setIsSocketOpen(true);
        reconnectAttemptsRef.current = 0; // 재연결 횟수 초기화
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY; // 지연 시간 초기화
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsSocketOpen(false); // WebSocket이 열리지 않은 상태로 설정
      };

      ws.onclose = () => {
        console.log(`Disconnected from chat server with book_id: ${selectedRoom}`);
        setIsSocketOpen(false);
        wsRef.current = null;

        // 일정 시간 이후 재연결 시도
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(connectWebSocket, reconnectDelayRef.current);
          reconnectAttemptsRef.current += 1;
          reconnectDelayRef.current *= 2; // 지연 시간 증가 (지수 재시도)
        }
      };

      ws.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        setIsTyping(false);
        if (receivedMessage.message.trim()) {
          setChatHistory((prev) => [...prev, receivedMessage]);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      reconnectAttemptsRef.current = 0;
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    };
  }, [selectedRoom, isLoggedIn, authInitialized, user]);

  const handleSendMessage = async () => {
    if (isSocketOpen && wsRef.current && message.trim()) {
      const userMessage = { sender_id: 'user', message: message.trim() };
      wsRef.current.send(JSON.stringify(userMessage));
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);
    } else {
      console.log('WebSocket is not open or message is empty');
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 채팅방 선택 시 새로운 대화 불러오기
  const handleRoomSelect = (bookId) => {
    if (bookId === selectedRoom) {
      // 현재 채팅방을 클릭한 경우에는 아무 작업도 하지 않음
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }
    setSelectedRoom(bookId);
    setChatHistory([]);
    setIsSocketOpen(false);

    // URL을 현재 선택된 채팅방의 bookId로 업데이트
    navigate(`/chatstella/${bookId}?memberNum=${user.memberNum}`);
  };

  return (
    <div className="stella_container">
      <div className="stella_sidebar">
        <h3>채팅방 목록</h3>
        <ul>
          {chatRooms.map((room) => (
            <li key={room.book_id} onClick={() => handleRoomSelect(room.book_id)}>
              {room.book_title}
            </li>
          ))}
        </ul>
      </div>

      <div className="stella_chat_area">
        <div className="stella_chat_box" ref={chatBoxRef}>
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`stella_chat_message ${chat.sender_id === 'user' ? 'stella_user' : 'stella_bot'}`}
            >
              {chat.message}
            </div>
          ))}
          {isTyping && <div className="stella_typing">Stella가 입력 중입니다...</div>}
        </div>

        <div className="stella_input_outer_container">
          <div className="stella_input_container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="stella_input"
            />
            <button onClick={handleSendMessage} className="stella_send_button">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stella;
