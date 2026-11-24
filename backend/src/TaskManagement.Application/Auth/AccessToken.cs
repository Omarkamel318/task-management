namespace TaskManagement.Application.Auth;

public sealed record AccessToken(string Token, DateTime ExpiresAt);
