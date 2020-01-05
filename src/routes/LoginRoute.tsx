import React, { FC } from "react";
import { useHistory } from "react-router-dom";
import { Button, Card } from "antd";
import styled from "styled-components";

export const LoginRoute = () => {
  return (
    <Login
      useGoogle={() =>
        (window.location.href = `${process.env.REACT_APP_GRAPHQL_SERVER_URI}/auth/google`)
      }
    />
  );
};

interface ILogin {
  useGoogle: () => void;
}

export const Login: FC<ILogin> = props => {
  const { useGoogle } = props;
  return (
    <LoginCard title="Log in">
      <Button type="primary" onClick={useGoogle}>
        Google
      </Button>
    </LoginCard>
  );
};

const LoginCard = styled(Card)`
  margin: 240px auto;
  max-width: 360px;
`;
