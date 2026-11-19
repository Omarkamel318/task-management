using TaskManagement.Application.Users.DTOs;

namespace TaskManagement.Application.Auth.DTOs;

public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
