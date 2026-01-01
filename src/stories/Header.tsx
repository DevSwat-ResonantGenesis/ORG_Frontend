import React from 'react';

type User = {
  name: string;
};

interface HeaderProps {
  user?: User;
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}) => (
  <header>
    <div className="storybook-header">
      <div>
        <h1>ResonantGraph AI</h1>
      </div>
      <div>
        {user ? (
          <>
            <span className="welcome">
              Welcome, <b>{user.name}</b>!
            </span>
            <button type="button" className="storybook-button storybook-button--small" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button type="button" className="storybook-button storybook-button--small" onClick={onLogin}>
              Log in
            </button>
            <button
              type="button"
              className="storybook-button storybook-button--small storybook-button--primary"
              onClick={onCreateAccount}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  </header>
);
