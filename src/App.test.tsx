import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';

jest.mock('./api/axiosClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        data: {
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        },
      })
    ),
    post: jest.fn(),
  },
  apiBaseUrl: 'http://localhost:3001/api',
  setAuthToken: jest.fn(),
}));

test('renders login form before authentication', async () => {
  window.localStorage.clear();

  await act(async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  });

  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', {
      name: /masuk/i,
    })
  ).toBeInTheDocument();
});
