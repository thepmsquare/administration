interface IndexState {
  user: {
    user_id: string;
    username: string;
    app_id: number;
    access_token: string;
    refresh_token: string;
  };
}

export { IndexState };
