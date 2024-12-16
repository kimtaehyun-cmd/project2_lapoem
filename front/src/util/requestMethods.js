/* ====== Common Post Request Function ====== */
export async function postRequest(url, data) {
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);

  // 응답 데이터 변수 선언
  let responseData;

  try {
    // JSON 파싱 시도
    responseData = await response.json();
  } catch (error) {
    throw new Error('Failed to parse response JSON.');
  }

  // 응답이 성공적이지 않을 경우 에러 처리
  if (!response.ok) {
    throw new Error(responseData?.message || 'Network response was not ok');
  }

  // 정상적인 응답일 경우 파싱된 데이터 반환
  return responseData;
}

/* ====== Common GET Request Function ====== */
export const getRequest = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('Unexpected response type');
    }
  } catch (error) {
    console.error('Error in getRequest:', error);
    throw error;
  }
};
/* ====== Common Put Request Function ====== */
export async function putRequest(url, data) {
  const defaultOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);
  let responseData;

  try {
    responseData = await response.json();
  } catch (error) {
    throw new Error('Failed to parse response JSON.');
  }

  if (!response.ok) {
    throw new Error(responseData.message || 'Network response was not ok');
  }

  return responseData;
}

/* ====== Common Patch Request Function ====== */
export async function patchRequest(url, data) {
  const defaultOptions = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);
  let responseData;

  try {
    responseData = await response.json();
  } catch (error) {
    throw new Error('Failed to parse response JSON.');
  }

  if (!response.ok) {
    throw new Error(responseData.message || 'Network response was not ok');
  }

  return responseData;
}

/* ====== Common Delete Request Function ====== */
export async function deleteRequest(url, data) {
  const defaultOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  };

  const response = await fetch(url, defaultOptions);
  let responseData;

  try {
    responseData = await response.json();
  } catch (error) {
    throw new Error('Failed to parse response JSON.');
  }

  if (!response.ok) {
    throw new Error(responseData.message || 'Network response was not ok');
  }

  return responseData;
}
