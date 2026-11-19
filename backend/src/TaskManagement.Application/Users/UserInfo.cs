namespace TaskManagement.Application.Users;

public sealed record UserInfo(
    int Id,
    string Email,
    string FullName,
    string Role,
    bool MustChangePassword,
    DateTime CreatedAt);
