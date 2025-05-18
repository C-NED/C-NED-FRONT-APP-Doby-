interface LoginRequest {
  email: string;
  password: string;
  type: 'USER' | 'ADMIN';  // enum-like으로 제약 가능
}