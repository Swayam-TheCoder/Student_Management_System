package com.sms.service;

import com.sms.dto.request.LoginRequest;
import com.sms.dto.request.RegisterRequest;
import com.sms.dto.response.AuthResponse;
import com.sms.dto.response.UserProfileResponse;
import com.sms.security.UserPrincipal;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getCurrentUserProfile(UserPrincipal userPrincipal);
}

